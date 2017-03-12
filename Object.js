/**
 * Created by Reese De Wind on 2/10/17.
 */
class Object {
    /**
     * Create a 3D cone with tip at the Z+ axis and base on the XY plane
     * @param {Object} gl      the current WebGL context
     * @param {Number} radius  radius of the cone base
     * @param {Number} height  height of the cone
     * @param {Number} subDiv  number of radial subdivision of the cone base
     * @param {vec3}   col1    color #1 to use
     * @param {vec3}   col2    color #2 to use
     */
    constructor (gl, lineSubDiv, pointSubDiv, height, lineFunc, pointFunc, col1, col2, special, x, y, z, fanPoints) {

	/* if colors are undefined, generate random colors */
	if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
	if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
	let randColor = vec3.create();
	let vertices = [];
	let line = lineFunc(lineSubDiv, height, x, y, z); //array of x,y,z array
	let points = pointFunc(pointSubDiv, line, special);
	console.log("num points: " + points.length + " start: " + points[0].length  + " end: " + points[lineSubDiv-1].length);
	
	for(let l = 0; l < lineSubDiv; l++){
	    col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
	    col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
	    for(let p = 0; p < pointSubDiv; p++){
		for(let dim = 0; dim < 3; dim++){
		    vertices.push(points[l][p][dim]);
		}
		vec3.lerp (randColor, col1, col2, Math.random());
		vertices.push(randColor[0], randColor[1], randColor[2]);
	    }
	}
	for(let l = 0; l < lineSubDiv; l++){
	    for(let dim = 0; dim < 3; dim++){
		vertices.push(line[l][dim]);
	    }
	    vec3.lerp (randColor, col1, col2, Math.random());
	    vertices.push(randColor[0], randColor[1], randColor[2]);
	}

	/* Copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
	this.vbuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
	gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

	this.indices = [];
	// initialization (called only one time)
	for(let l = 0; l < lineSubDiv - 1; l++){
	    let Idx = [];
	    for(let p = pointSubDiv; p >= 0; p--){
		let start = l*pointSubDiv
		Idx.push(start + p%pointSubDiv);
		Idx.push(start + p%pointSubDiv + pointSubDiv);
	    }
	    let idxBuffer = gl.createBuffer();
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
	    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(Idx), gl.STATIC_DRAW);
	    this.indices.push({"primitive": gl.TRIANGLE_STRIP, "buffer": idxBuffer, "numPoints": Idx.length});
	}
	if(typeof fanPoints !== "undefined"){
	    for(let f = 0; f < fanPoints.length; f++){
		let Idx = [];
		Idx.push(lineSubDiv*pointSubDiv + fanPoints[f]);
		if(f == 0){
		    for(let p = pointSubDiv; p >= 0; p--){
			Idx.push(fanPoints[f]*pointSubDiv + p%pointSubDiv);
		    }
		}else{
		    for(let p = 0; p <= pointSubDiv; p++){	
			Idx.push(fanPoints[f]*pointSubDiv + p%pointSubDiv);
		    }
		}
		let idxBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(Idx), gl.STATIC_DRAW);
		this.indices.push({"primitive": gl.TRIANGLE_FAN, "buffer": idxBuffer, "numPoints": Idx.length});
	    }
	}
    }


    /**
     * Draw the object
     * @param {Number} vertexAttr a handle to a vec3 attribute in the vertex shader for vertex xyz-position
     * @param {Number} colorAttr  a handle to a vec3 attribute in the vertex shader for vertex rgb-color
     * @param {Number} modelUniform a handle to a mat4 uniform in the shader for the coordinate frame of the model
     * @param {mat4} coordFrame a JS mat4 variable that holds the actual coordinate frame of the object
     */
    draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
	/* copy the coordinate frame matrix to the uniform memory in shader */
	gl.uniformMatrix4fv(modelUniform, false, coordFrame);

	gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);

	/* with the "packed layout"  (x,y,z,r,g,b),
	   the stride distance between one group to the next is 24 bytes */
	gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0); /* (x,y,z) begins at offset 0 */
	gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12); /* (r,g,b) begins at offset 12 */

	for (let k = 0; k < this.indices.length; k++) {
	    let obj = this.indices[k];
	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
	    gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_BYTE, 0);
	}
    }
}
