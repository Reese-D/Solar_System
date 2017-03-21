/**
 * Created by Reese De Wind
 */
class Planet {    
    /*
     * Constructs a new planet at the given origin with the provided properties
     * @param {double} x the origins x value
     * @param {double} y the origins y value
     * @param {double} z the origins z value
     * @param {int} subDiv the number of subdivisions for the planet, number of points will be subDiv^2
     * @param {color} color the base color of a planet
     */
    constructor(gl,x,y,z,radius,subDiv,color,seed,startOctave,endOctave,persistence,coordFrame) {
	if(typeof color === "undefined") color = vec3.fromValues(Math.random(), Math.random(), Math.random());
	this.gl = gl;
	this.x = x;
	this.y = y;
	this.z = z;
	this.radius = radius;
	this.subDiv = subDiv;
	this.points = [];
	this.vertices = [];
	this.color = color;
	this.seed = seed;
	this.startOctave = startOctave;
	this.endOctave = endOctave;
	this.persistence = persistence;
	this.coordFrame = coordFrame;
	this.p5 = new p5();
	let maxAngle = Math.PI * 2;
	//let divisions = Math.round(subDiv)/10.0;
	let counter = 0;
	let increments = (maxAngle / subDiv);
	for(let rotationX = 0; rotationX <= maxAngle; rotationX += increments){
	    let pointsY = []
	    for(let rotationY = 0; rotationY <= maxAngle; rotationY += increments){
		let currPoint = this.getRandomPoint(rotationX, rotationY, color.slice(), maxAngle);
		pointsY.push(currPoint);
		counter++;
	    }
	    this.points.push(pointsY);
	}
	this.counter = counter;
	this.pushVertices();
	this.pushIndices();
	this.preDraw();
    }

    preDraw(){	
	this.vbuff = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbuff);
     	this.gl.bufferData(this.gl.ARRAY_BUFFER, Float32Array.from(this.vertices), this.gl.STATIC_DRAW);
    }

    pushVertices(){
	this.p5.noiseSeed(this.seed)
	for(let i = 0; i < this.points.length; i++){
	    for(let t = 0; t < this.points[i].length; t++){
		let currPoint = this.points[i][t];
		this.vertices.push(currPoint.x, currPoint.y, currPoint.z);
		//let col = this.getNoise(i/this.points.length,t/this.points[i].length)
		//let col = (this.getNoise(i,t) + 2) / 4;
		let col = this.p5.noise(i,t);
		//let col = 0.2
		this.vertices.push(Math.max(0.4, col),Math.max(0.4, col),Math.max(0.6, col))
		//this.vertices.push(currPoint.color[0], currPoint.color[1], currPoint.color[2]);
	    }
	}
    }

    pushIndices(){
	this.indices = [];
	for(let i = 0; i < this.points.length/2; i++){
	let Idx = []
	    for(let j = 0; j < this.points[i].length; j++){
		let a = (i * this.points[0].length + j) % this.counter;
		let b = ((i+1) * this.points[0].length + j) % this.counter;
		if(j < this.points[i].length / 2){
		    Idx.push(b)
		    Idx.push(a);
		}else{
		    Idx.push(a)
		    Idx.push(b);
		}		    
	    }
	    let idxBuffer = gl.createBuffer();
     	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
     	    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(Idx), gl.STATIC_DRAW);
     	    this.indices.push({"primitive": gl.TRIANGLE_STRIP, "buffer": idxBuffer, "numPoints": Idx.length});
	}


    }

    getRandomPoint(rotationX, rotationY, color, numPoints){
	//rotationY = rotationY + (Math.random() * 2 - 1) / (numPoints * 8);
	//rotationX = rotationX + (Math.random() * 2 - 1) / (numPoints * 8);
	let x = this.x + this.radius * Math.cos(rotationX) * Math.sin(rotationY);
	let y = this.y + this.radius * Math.sin(rotationX) * Math.sin(rotationY);
	let z = this.z + this.radius * Math.cos(rotationY);
	return new Point(x,y,z,color);
    }
    
    /*
     * @param {Point} the x, y coordinates in the points array that you want the neighboring points of
     */
    getPointNeighbors(x,y){
	let neighbors = [];
	let leftX = (x - 1 >= 0);
	let rightX = (x + 1 < subDiv);
	let yPlus = y+1 % this.subDiv;
	let yMinus = y - 1;
	if(yMinus < 0){
	    yMinus = subDiv - 1;
	}

	if(leftX){
	    neighbors.push(vertices[x-1][y]);
	    neighbors.push(vertices[x-1][yPlus]);
	    neighbors.push(vertices[x-1][yMinus]);
	}

	neighbors.push(vertices[x][y]);
	neighbors.push(vertices[x][yPlus]);
	neighbors.push(vertices[x][yMinus]);

	if(rightX){
	    neighbors.push(vertices[x+1][y]);
	    neighbors.push(vertices[x+1][yPlus]);
	    neighbors.push(vertices[x+1][yMinus]);
	}
    }

    rawNoise(x, y, octave) {
    	let seed = ((octave * 1000000) + (x * 1000000000)
    		     + (y * 100000000000)) ^ this.seed;
    	Math.seedrandom(seed);

    	let r = Math.random();
	
    	// we want the value to be between -1 and +1
    	return (r * 2.0) - 1.0;
    }

    getNoise(u, v) {
    	var total = 0.0;
	
    	for (let octave = 0; octave <= this.endOctave - this.startOctave; octave++) {
            let freq = Math.pow(2, octave + this.startOctave) + 1;
            let amplitude = Math.pow(this.persistence, octave);
	    
            let x = (u * freq);
            let y = (v * freq);
	    
            let n = this.interpolatedNoise(Math.floor(x), Math.floor(y), octave);
            total += n * amplitude;
    	}
	
    	return total;
    }

    interpolateLinear(a, b, n) {
	return a + n * (b - a);
    }

    interpolateCosine(a, b, n) {
	let radians = n * Math.PI;
	n = (1 - Math.cos(radians)) * 0.5;
	
	return this.interpolateLinear(a, b, n);
    }

    interpolatedNoise(x, y, octave) {
	let intX = Math.floor(x);
	let remainderX = x - intX;
	
	let intY = Math.floor(y);
	let remainderY = y - intY;
	
	let base = this.rawNoise(intX, intY, octave);
	let baseX1 = this.rawNoise(intX + 1, intY, octave);
	let baseY1 = this.rawNoise(intX, intY + 1, octave);
	let baseX1Y1 = this.rawNoise(intX + 1, intY + 1, octave);
	
	let ny1 = this.interpolateCosine(base, baseX1, remainderX);
	let ny2 = this.interpolateCosine(baseY1, baseX1Y1, remainderX);
	
	return this.interpolateCosine(ny1, ny2, remainderY);
    }    
    
    
    // constructor (gl, lineSubDiv, pointSubDiv, height, lineFunc, pointFunc, col1, col2, special, x, y, z, fanPoints) {

    // 	/* if colors are undefined, generate random colors */
    // 	if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    // 	if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    // 	let randColor = vec3.create();
    // 	let vertices = [];
    // 	let line = lineFunc(lineSubDiv, height, x, y, z); //array of x,y,z array
    // 	let points = pointFunc(pointSubDiv, line, special);
    // 	console.log("num points: " + points.length + " start: " + points[0].length  + " end: " + points[lineSubDiv-1].length);
    
    // 	for(let l = 0; l < lineSubDiv; l++){
    // 	    col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    // 	    col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
    // 	    for(let p = 0; p < pointSubDiv; p++){
    // 		for(let dim = 0; dim < 3; dim++){
    // 		    vertices.push(points[l][p][dim]);
    // 		}
    // 		vec3.lerp (randColor, col1, col2, Math.random());
    // 		vertices.push(randColor[0], randColor[1], randColor[2]);
    // 	    }
    // 	}
    // 	for(let l = 0; l < lineSubDiv; l++){
    // 	    for(let dim = 0; dim < 3; dim++){
    // 		vertices.push(line[l][dim]);
    // 	    }
    // 	    vec3.lerp (randColor, col1, col2, Math.random());
    // 	    vertices.push(randColor[0], randColor[1], randColor[2]);
    // 	}

    // 	/* Copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
    // 	this.vbuff = gl.createBuffer();
    // 	gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    // 	gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

    // 	this.indices = [];
    // 	// initialization (called only one time)
    // 	for(let l = 0; l < lineSubDiv - 1; l++){
    // 	    let Idx = [];
    // 	    for(let p = pointSubDiv; p >= 0; p--){
    // 		let start = l*pointSubDiv
    // 		Idx.push(start + p%pointSubDiv);
    // 		Idx.push(start + p%pointSubDiv + pointSubDiv);
    // 	    }
    // 	    let idxBuffer = gl.createBuffer();
    // 	    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
    // 	    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(Idx), gl.STATIC_DRAW);
    // 	    this.indices.push({"primitive": gl.TRIANGLE_STRIP, "buffer": idxBuffer, "numPoints": Idx.length});
    // 	}
    // 	if(typeof fanPoints !== "undefined"){
    // 	    for(let f = 0; f < fanPoints.length; f++){
    // 		let Idx = [];
    // 		Idx.push(lineSubDiv*pointSubDiv + fanPoints[f]);
    // 		if(f == 0){
    // 		    for(let p = pointSubDiv; p >= 0; p--){
    // 			Idx.push(fanPoints[f]*pointSubDiv + p%pointSubDiv);
    // 		    }
    // 		}else{
    // 		    for(let p = 0; p <= pointSubDiv; p++){	
    // 			Idx.push(fanPoints[f]*pointSubDiv + p%pointSubDiv);
    // 		    }
    // 		}
    // 		let idxBuffer = gl.createBuffer();
    // 		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
    // 		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint8Array.from(Idx), gl.STATIC_DRAW);
    // 		this.indices.push({"primitive": gl.TRIANGLE_FAN, "buffer": idxBuffer, "numPoints": Idx.length});
    // 	    }
    // 	}
    // }


    /**
     * Draw the object
     * @param {Number} vertexAttr a handle to a vec3 attribute in the vertex shader for vertex xyz-position
     * @param {Number} colorAttr  a handle to a vec3 attribute in the vertex shader for vertex rgb-color
     * @param {Number} modelUniform a handle to a mat4 uniform in the shader for the coordinate frame of the model
     * @param {mat4} coordFrame a JS mat4 variable that holds the actual coordinate frame of the object
     */
    
    draw(vertexAttr, colorAttr, modelUniform) {
	/* copy the coordinate frame matrix to the uniform memory in shader */
	this.gl.uniformMatrix4fv(modelUniform, false, this.coordFrame);

	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbuff);

	/* with the "packed layout"  (x,y,z,r,g,b),
	   the stride distance between one group to the next is 24 bytes */
	this.gl.vertexAttribPointer(vertexAttr, 3, this.gl.FLOAT, false, 24, 0); /* (x,y,z) begins at offset 0 */
	this.gl.vertexAttribPointer(colorAttr, 3, this.gl.FLOAT, false, 24, 12); /* (r,g,b) begins at offset 12 */

	this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.counter) //Math.pow(this.subDiv, 2));
	for (let k = 0; k < this.indices.length; k++) {
	    let obj = this.indices[k];
	    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
	    this.gl.drawElements(obj.primitive, obj.numPoints, this.gl.UNSIGNED_SHORT, 0);
	}
    }
}
