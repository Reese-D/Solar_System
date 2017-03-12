/**
 * Created by Hans Dulimarta on 2/16/17.
 */
class DilbySpaceship {
	constructor (gl) {
		this.bridge = new Cube(gl, 0.6, 2);
		this.connector = new Cylinder(gl, 0.2, 0.2, .8, 4);
		this.body = new Cube(gl, 0.5, 2);
		this.wing1 = new Cube(gl, 0.2, 2);
		this.wing2 = new Cube(gl, 0.2, 2);

		//move bridge location    
		let moveAgainstX = vec3.fromValues (-0.5, 0, 0);
		this.bridgeTransform = mat4.create();
		mat4.translate (this.bridgeTransform, this.bridgeTransform, moveAgainstX);


		//move connector location
		moveAgainstX = vec3.fromValues (0, 0, 0);
		this.connectorTransform = mat4.create();
		mat4.translate (this.connectorTransform, this.connectorTransform, moveAgainstX);
	
		//rotate connector on y axis and combine with previous translation
		this.connectorTransform2 = mat4.create();
		let angle = .5 * Math.PI;
		let axisRot = vec3.fromValues(0, 1, 0);
		mat4.fromRotation(this.connectorTransform2, angle, axisRot);
		mat4.multiply (this.connectorTransform, this.connectorTransform, this.connectorTransform2);
		
		//rotate connector on z axis & combine with previous rotation / translation
		axisRot = vec3.fromValues(0, 0, 1);
		angle = .25 * Math.PI;
		this.connectorTransform3 = mat4.create();
		mat4.fromRotation(this.connectorTransform3, angle, axisRot);
		mat4.multiply (this.connectorTransform, this.connectorTransform, this.connectorTransform3);

		
		this.bodyTransform = mat4.create();
		this.tmp = mat4.create();
	}

	draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
		mat4.mul (this.tmp, coordFrame, this.bridgeTransform);
		this.bridge.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

		mat4.mul (this.tmp, coordFrame, this.connectorTransform);
		this.connector.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

		mat4.mul (this.tmp, coordFrame, this.bodyTransform);
		//this.body.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
	}
}
