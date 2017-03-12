/**
 * Created by Hans Dulimarta on 2/16/17.
 */
class DilbySpaceship {
	constructor (gl) {
		this.bridge = new Cube(gl, 0.3, 4);
		this.connector = new Cylinder(gl, 0.15, 0.15, 0.7, 4);
		this.body = new Cylinder(gl, 0.212, .212, 0.6, 4);
		this.wing1 = new Cylinder(gl, 0.212, .1, .25, 4);
		this.wing2 = new Cylinder(gl, 0.1, .212, .25, 4);
		this.thruster1 = new Torus(gl, .05, .04, 12, 12);
		this.thruster2 = new Torus(gl, .05, .04, 12, 12);
		this.rocket1 = new Cylinder(gl, 0.2, 0.2, .5, 12);
		this.rocket2 = new Cylinder(gl, 0.2, 0.2, .5, 12);
		this.rocket2 = new Cylinder(gl, 0.2, 0.2, .5, 12);
		this.rocket2 = new Cylinder(gl, 0.2, 0.2, .5, 12);




		//move bridge location    
		let moveAgainstX = vec3.fromValues (-0.3, 0, 0);
		this.bridgeTransform = mat4.create();
		mat4.translate (this.bridgeTransform, this.bridgeTransform, moveAgainstX);
		//--------------------------------------------------------------------------------------	

		//move connector location - currently not in used but added incase needed to later
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
		//--------------------------------------------------------------------------------------		
		
		//move body location
		let moveWithX = vec3.fromValues(.35, 0, 0);
		this.bodyTransform = mat4.create();
		mat4.translate (this.bodyTransform, this.bodyTransform, moveWithX);
	
		//rotate body location on x axis
		this.bodyTransform2 = mat4.create();
		angle = .5 * Math.PI;
		axisRot = vec3.fromValues(1, 0, 0);	
		mat4.fromRotation(this.bodyTransform2, angle, axisRot);
		mat4.multiply (this.bodyTransform, this.bodyTransform, this.bodyTransform2);
		
		//rotate body location on z axis
		this.bodyTransform3 = mat4.create();
		angle = .25 * Math.PI;
		axisRot = vec3.fromValues(0, 0, 1);
		mat4.fromRotation(this.bodyTransform3, angle, axisRot);
		mat4.multiply (this.bodyTransform, this.bodyTransform, this.bodyTransform3);
		//--------------------------------------------------------------------------------------	
		
		//move wing1 location on x axis	
		moveAgainstX = vec3.fromValues (-0.3, 0, 0);
		this.wing1Transform = mat4.create();
		mat4.translate (this.wing1Transform, this.wing1Transform, moveAgainstX);
			
		//move wing1 location on y axis
		let moveWithY = vec3.fromValues(0, .278, 0);
		this.wing1Transform2 = mat4.create();
		mat4.translate (this.wing1Transform2, this.wing1Transform2, moveWithY);
		mat4.multiply (this.wing1Transform, this.wing1Transform, this.wing1Transform2);	
		
		//rotate wing1 location on x axis
		this.wing1Transform3 = mat4.create();
		angle = 0.5 * Math.PI;
		axisRot = vec3.fromValues(1, 0, 0);	
		mat4.fromRotation(this.wing1Transform3, angle, axisRot);
		mat4.multiply (this.wing1Transform, this.wing1Transform, this.wing1Transform3);
		
		//rotate wing1 location on z axis
		this.wing1Transform4 = mat4.create();
		angle = .25 * Math.PI;
		axisRot = vec3.fromValues(0, 0, 1);
		mat4.fromRotation(this.wing1Transform4, angle, axisRot);
		mat4.multiply (this.wing1Transform, this.wing1Transform, this.wing1Transform4);
		//--------------------------------------------------------------------------------------	
		
		//move wing2 location on x axis	
		moveAgainstX = vec3.fromValues (-0.3, 0, 0);
		this.wing2Transform = mat4.create();
		mat4.translate (this.wing2Transform, this.wing2Transform, moveAgainstX);
			
		//move wing2 location on y axis
		moveWithY = vec3.fromValues(0, -.279, 0);
		this.wing2Transform2 = mat4.create();
		mat4.translate (this.wing2Transform2, this.wing2Transform2, moveWithY);
		mat4.multiply (this.wing2Transform, this.wing2Transform, this.wing2Transform2);	
		
		//rotate wing1 location on x axis
		this.wing2Transform3 = mat4.create();
		angle = 0.5 * Math.PI;
		axisRot = vec3.fromValues(1, 0, 0);	
		mat4.fromRotation(this.wing2Transform3, angle, axisRot);
		mat4.multiply (this.wing2Transform, this.wing2Transform, this.wing2Transform3);
		
		//rotate wing1 location on z axis
		this.wing2Transform4 = mat4.create();
		angle = .25 * Math.PI;
		axisRot = vec3.fromValues(0, 0, 1);
		mat4.fromRotation(this.wing2Transform4, angle, axisRot);
		mat4.multiply (this.wing2Transform, this.wing2Transform, this.wing2Transform4);
		this.tmp = mat4.create();
	}

	draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
		mat4.mul (this.tmp, coordFrame, this.bridgeTransform);
		this.bridge.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

		mat4.mul (this.tmp, coordFrame, this.connectorTransform);
		this.connector.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

		mat4.mul (this.tmp, coordFrame, this.bodyTransform);
		this.body.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
		
		mat4.mul (this.tmp, coordFrame, this.wing1Transform);
		this.wing1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
		
		mat4.mul (this.tmp, coordFrame, this.wing2Transform);
		this.wing2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
	}
}
