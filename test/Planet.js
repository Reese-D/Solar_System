/**
 * Created by Reese De Wind
 */
class Planet extends GeometricObject {    
    /*
     * Constructs a new planet at the given origin with the provided properties
     * @param {double} x the origins x value
     * @param {double} y the origins y value
     * @param {double} z the origins z value
     * @param {int} subDiv the number of subdivisions for the planet, number of points will be subDiv^2
     * @param {color} color the base color of a planet
     */
    
    constructor(gl,x,y,z,radius,subDiv,color,seed,startOctave,endOctave,persistence,coordFrame) {
	//super(gl,coordFrame);
	super(gl);
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
	this.p5.noiseSeed(this.seed)
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
	this.nbuff = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuff);
	gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(this.normalLines), gl.STATIC_DRAW);

    }


    pushVertices(){
	this.normalLines = []
	this.p5.noiseDetail(8,0.5)
	for(let i = 0; i < this.points.length; i++){
	    for(let t = 0; t < this.points[i].length; t++){
		let currPoint = this.points[i][t];
		this.vertices.push(currPoint[0].x, currPoint[0].y, currPoint[0].z);
		//let col = this.getNoise(i/this.points.length,t/this.points[i].length)
		//let col = (this.getNoise(i,t) + 2) / 4;
		let mult = 2
		let col = this.p5.noise(currPoint[0].x*mult,currPoint[0].y*mult,currPoint[0].z*mult);
		//let col = 0.2
		this.vertices.push(col,col, col)
		this.vertices.push(currPoint[1].x, currPoint[1].y, currPoint[1].z);

		this.normalLines.push(x, y, h, 1, 1, 1);  /* (x,y,z)   (r,g,b) */
		this.normalLines.push (
		    x + this.NORMAL_SCALE * norm[0],
		    y + this.NORMAL_SCALE * norm[1],
		    h + this.NORMAL_SCALE * norm[2], 1, 1, 1);

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

	/* calculate the tangent vectors */
	let n1 = vec3.create();
	let n2 = vec3.create();
        vec3.set (n1, -Math.sin(rotationX), Math.cos(rotationX), 0);
        vec3.set (n2, -Math.sin(rotationY) * Math.cos(rotationX),
                      -Math.sin(rotationY) * Math.sin(rotationX),
                       Math.cos(rotationY));
        /* n1 is tangent along major circle, n2 is tangent along the minor circle */
        vec3.cross (norm, n1, n2);
        vec3.normalize(norm, norm);
        /* the next three floats are vertex normal */
	
        

	this.p5.noiseDetail(16, 0.5)

	let mult = 2;
	let tmp_noise = this.p5.noise(x*mult,y*mult,z*mult);
	let noise_influence = tmp_noise * tmp_noise;
	let uninfluenced = 1 - noise_influence;
	let r_noise =  tmp_noise * this.radius * noise_influence;
	
	x = this.x + (this.radius*uninfluenced + r_noise) * Math.cos(rotationX) * Math.sin(rotationY);
	y = this.y + (this.radius*uninfluenced + r_noise) * Math.sin(rotationX) * Math.sin(rotationY);
	z = this.z + (this.radius*uninfluenced + r_noise) * Math.cos(rotationY);	
	
	return [new Point(x,y,z,undefined), new Point(norm[0],norm[1],norm[2],undefined)]
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
}
