/**
 * Created by Hans Dulimarta on 2/16/17.
 */
class DilbySpaceship {
	constructor (gl) {
		this.bridge = new Cube(gl, 0.3, 4);
		this.connector = new Cylinder(gl, 0.15, 0.15, 0.7, 4);
		this.body = new Cylinder(gl, 0.212, .212, 0.6, 4);
		this.wing1 = new Cylinder(gl, 0.212, 0.1, .25, 4);
		this.wing2 = new Cylinder(gl, 0.1, .212, .25, 4);
		this.wing3 = new Cylinder(gl, 0.212, 0.1, .25, 4);
		this.wing4 = new Cylinder(gl, 0.1, .212, .25, 4);
		this.mount1 = new Cylinder(gl, 0.08, 0.08, .3, 4);
		this.mount2 = new Cylinder(gl, 0.08, .08, .25, 4);
		this.thruster1 = new Torus(gl, .05, .02, 12, 12);
		this.thruster2 = new Torus(gl, .05, .02, 12, 12);
		this.rocket1 = new Cylinder(gl, 0.05, 0.05, .5, 12);
		this.rocket2 = new Cylinder(gl, 0.05, 0.05, .5, 12);
		this.rocket2 = new Cylinder(gl, 0.05, 0.05, .5, 12);
		this.rocket2 = new Cylinder(gl, 0.05, 0.05, .5, 12);

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
		moveWithY = vec3.fromValues(0, -.278, 0);
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
		//--------------------------------------------------------------------------------------	
		
		//move wing3 location on x axis	
		moveAgainstX = vec3.fromValues (0.35, 0, 0);
		this.wing3Transform = mat4.create();
		mat4.translate (this.wing3Transform, this.wing3Transform, moveAgainstX);
			
		//move wing3 location on y axis
		moveWithY = vec3.fromValues(0, .418, 0);
		this.wing3Transform2 = mat4.create();
		mat4.translate (this.wing3Transform2, this.wing3Transform2, moveWithY);
		mat4.multiply (this.wing3Transform, this.wing3Transform, this.wing3Transform2);	
		
		//rotate wing3 location on x axis
		this.wing3Transform3 = mat4.create();
		angle = 0.5 * Math.PI;
		axisRot = vec3.fromValues(1, 0, 0);	
		mat4.fromRotation(this.wing3Transform3, angle, axisRot);
		mat4.multiply (this.wing3Transform, this.wing3Transform, this.wing3Transform3);
		
		//rotate wing3 location on z axis
		this.wing3Transform4 = mat4.create();
		angle = .25 * Math.PI;
		axisRot = vec3.fromValues(0, 0, 1);
		mat4.fromRotation(this.wing3Transform4, angle, axisRot);
		mat4.multiply (this.wing3Transform, this.wing3Transform, this.wing3Transform4);
		//--------------------------------------------------------------------------------------	
		
		//move wing4 location on x axis	
		moveAgainstX = vec3.fromValues (0.35, 0, 0);
		this.wing4Transform = mat4.create();
		mat4.translate (this.wing4Transform, this.wing4Transform, moveAgainstX);
			
		//move wing4 location on y axis
		moveWithY = vec3.fromValues(0, -.418, 0);
		this.wing4Transform2 = mat4.create();
		mat4.translate (this.wing4Transform2, this.wing4Transform2, moveWithY);
		mat4.multiply (this.wing4Transform, this.wing4Transform, this.wing4Transform2);	
		
		//rotate wing4 location on x axis
		this.wing4Transform3 = mat4.create();
		angle = 0.5 * Math.PI;
		axisRot = vec3.fromValues(1, 0, 0);	
		mat4.fromRotation(this.wing4Transform3, angle, axisRot);
		mat4.multiply (this.wing4Transform, this.wing4Transform, this.wing4Transform3);
		
		//rotate wing4 location on z axis
		this.wing4Transform4 = mat4.create();
		angle = .25 * Math.PI;
		axisRot = vec3.fromValues(0, 0, 1);
		mat4.fromRotation(this.wing4Transform4, angle, axisRot);
		mat4.multiply (this.wing4Transform, this.wing4Transform, this.wing4Transform4);
		//--------------------------------------------------------------------------------------	
		
		//move mount1 location on x axis	
		moveAgainstX = vec3.fromValues (0.35, 0, 0);
		this.mount1Transform = mat4.create();
		mat4.translate (this.mount1Transform, this.mount1Transform, moveAgainstX);
			
		//move mount1 location on y axis
		moveWithY = vec3.fromValues(0, .57, 0);
		this.mount1Transform2 = mat4.create();
		mat4.translate (this.mount1Transform2, this.mount1Transform2, moveWithY);
		mat4.multiply (this.mount1Transform, this.mount1Transform, this.mount1Transform2);	
		
		//rotate mount1 location on x axis
		this.mount1Transform3 = mat4.create();
		angle = 0.5 * Math.PI;
		axisRot = vec3.fromValues(1, 0, 0);	
		mat4.fromRotation(this.mount1Transform3, angle, axisRot);
		mat4.multiply (this.mount1Transform, this.mount1Transform, this.mount1Transform3);
		
		//rotate mount1 location on y axis
		this.mount1Transform4 = mat4.create();
		angle = 0.5 * Math.PI;
		axisRot = vec3.fromValues(0, 1, 0);	
		mat4.fromRotation(this.mount1Transform4, angle, axisRot);
		mat4.multiply (this.mount1Transform, this.mount1Transform, this.mount1Transform4);
		
		//rotate mount1 location on z axis
		this.mount1Transform5 = mat4.create();
		angle = -0.25 * Math.PI;
		axisRot = vec3.fromValues(0, 0, 1);
		mat4.fromRotation(this.mount1Transform5, angle, axisRot);
		mat4.multiply (this.mount1Transform, this.mount1Transform, this.mount1Transform5);
		//--------------------------------------------------------------------------------------	
		
		//move mount2 location on x axis	
		moveAgainstX = vec3.fromValues (0.35, 0, 0);
		this.mount2Transform = mat4.create();
		mat4.translate (this.mount2Transform, this.mount2Transform, moveAgainstX);
			
		//move mount2 location on y axis
		moveWithY = vec3.fromValues(0, -.57, 0);
		this.mount2Transform2 = mat4.create();
		mat4.translate (this.mount2Transform2, this.mount2Transform2, moveWithY);
		mat4.multiply (this.mount2Transform, this.mount2Transform, this.mount2Transform2);	
		
		//rotate mount2 location on x axis
		this.mount2Transform3 = mat4.create();
		angle = 0.5 * Math.PI;
		axisRot = vec3.fromValues(1, 0, 0);	
		mat4.fromRotation(this.mount2Transform3, angle, axisRot);
		mat4.multiply (this.mount2Transform, this.mount2Transform, this.mount2Transform3);
		
		//rotate mount2 location on y axis
		this.mount2Transform4 = mat4.create();
		angle = 0.5 * Math.PI;
		axisRot = vec3.fromValues(0, 1, 0);	
		mat4.fromRotation(this.mount2Transform4, angle, axisRot);
		mat4.multiply (this.mount2Transform, this.mount2Transform, this.mount2Transform4);
		
		//rotate mount2 location on z axis
		this.mount2Transform5 = mat4.create();
		angle = -0.25 * Math.PI;
		axisRot = vec3.fromValues(0, 0, 1);
		mat4.fromRotation(this.mount2Transform5, angle, axisRot);
		mat4.multiply (this.mount2Transform, this.mount2Transform, this.mount2Transform5);
		//--------------------------------------------------------------------------------------	
		
		//move thruster location on x axis	
		moveWithX = vec3.fromValues (0.495, 0, 0);
		this.thruster1Transform = mat4.create();
		mat4.translate (this.thruster1Transform, this.thruster1Transform, moveWithX);
			
		//move thruster location on y axis
		moveWithY = vec3.fromValues(0, -0.15, 0);
		this.thruster1Transform2 = mat4.create();
		mat4.translate (this.thruster1Transform2, this.thruster1Transform2, moveWithY);
		mat4.multiply (this.thruster1Transform, this.thruster1Transform, this.thruster1Transform2);	
		
		//rotate thruster location on x axis
		this.thruster1Transform3 = mat4.create();
		angle = 0.0 * Math.PI;
		axisRot = vec3.fromValues(1, 0, 0);	
		mat4.fromRotation(this.thruster1Transform3, angle, axisRot);
		mat4.multiply (this.thruster1Transform, this.thruster1Transform, this.thruster1Transform3);
		
		//rotate thruster location on z axis
		this.thruster1Transform4 = mat4.create();
		angle = 0.5 * Math.PI;
		axisRot = vec3.fromValues(0, 1, 0);
		mat4.fromRotation(this.thruster1Transform4, angle, axisRot);
		mat4.multiply (this.thruster1Transform, this.thruster1Transform, this.thruster1Transform4);
		//--------------------------------------------------------------------------------------	
		
		//move thruster location on x axis	
		moveWithX = vec3.fromValues (0.495, 0, 0);
		this.thruster2Transform = mat4.create();
		mat4.translate (this.thruster2Transform, this.thruster2Transform, moveWithX);
			
		//move thruster location on y axis
		moveWithY = vec3.fromValues(0, 0.15, 0);
		this.thruster2Transform2 = mat4.create();
		mat4.translate (this.thruster2Transform2, this.thruster2Transform2, moveWithY);
		mat4.multiply (this.thruster2Transform, this.thruster2Transform, this.thruster2Transform2);	
		
		//rotate thruster location on x axis
		this.thruster2Transform3 = mat4.create();
		angle = 0.0 * Math.PI;
		axisRot = vec3.fromValues(1, 0, 0);	
		mat4.fromRotation(this.thruster2Transform3, angle, axisRot);
		mat4.multiply (this.thruster2Transform, this.thruster2Transform, this.thruster2Transform3);
		
		//rotate thruster location on z axis
		this.thruster2Transform4 = mat4.create();
		angle = 0.5 * Math.PI;
		axisRot = vec3.fromValues(0, 1, 0);
		mat4.fromRotation(this.thruster2Transform4, angle, axisRot);
		mat4.multiply (this.thruster2Transform, this.thruster2Transform, this.thruster2Transform4);
		//--------------------------------------------------------------------------------------	
		
		//move rocket1 location on x axis	
		moveWithX = vec3.fromValues (0.35, 0, 0);
		this.rocket1Transform = mat4.create();
		mat4.translate (this.rocket1Transform, this.rocket1Transform, moveWithX);
			
		//move rocket1 location on y axis
		moveWithY = vec3.fromValues(0, 0.58, 0);
		this.rocket1Transform2 = mat4.create();
		mat4.translate (this.rocket1Transform2, this.rocket1Transform2, moveWithY);
		mat4.multiply (this.rocket1Transform, this.rocket1Transform, this.rocket1Transform2);	
		
		//move rocket1 location on z axis
		let moveWithZ = vec3.fromValues(0, 0.0, 0.075);
		this.rocket1Transform3 = mat4.create();
		mat4.translate (this.rocket1Transform3, this.rocket1Transform3, moveWithZ);
		mat4.multiply (this.rocket1Transform, this.rocket1Transform, this.rocket1Transform3);	
		
		//rotate rocket1 location on x axis
		this.rocket1Transform4 = mat4.create();
		angle = 0.0 * Math.PI;
		axisRot = vec3.fromValues(1, 0, 0);	
		mat4.fromRotation(this.rocket1Transform4, angle, axisRot);
		mat4.multiply (this.rocket1Transform, this.rocket1Transform, this.rocket1Transform4);
		
		//rotate rocket1 location on z axis
		this.rocket1Transform5 = mat4.create();
		angle = 0.5 * Math.PI;
		axisRot = vec3.fromValues(0, 1, 0);
		mat4.fromRotation(this.rocket1Transform5, angle, axisRot);
		mat4.multiply (this.rocket1Transform, this.rocket1Transform, this.rocket1Transform5);
		//--------------------------------------------------------------------------------------	
		
		//move rocket2 location on x axis	
		moveWithX = vec3.fromValues (0.35, 0, 0);
		this.rocket2Transform = mat4.create();
		mat4.translate (this.rocket2Transform, this.rocket2Transform, moveWithX);
			
		//move rocket2 location on y axis
		moveWithY = vec3.fromValues(0, 0.58, 0);
		this.rocket2Transform2 = mat4.create();
		mat4.translate (this.rocket2Transform2, this.rocket2Transform2, moveWithY);
		mat4.multiply (this.rocket2Transform, this.rocket2Transform, this.rocket2Transform2);	
		
		//move rocket2 location on z axis
		moveWithZ = vec3.fromValues(0, 0.0, -0.075);
		this.rocket2Transform3 = mat4.create();
		mat4.translate (this.rocket2Transform3, this.rocket2Transform3, moveWithZ);
		mat4.multiply (this.rocket2Transform, this.rocket2Transform, this.rocket2Transform3);	
		
		//rotate rocket2 location on x axis
		this.rocket2Transform4 = mat4.create();
		angle = 0.0 * Math.PI;
		axisRot = vec3.fromValues(1, 0, 0);	
		mat4.fromRotation(this.rocket2Transform4, angle, axisRot);
		mat4.multiply (this.rocket2Transform, this.rocket2Transform, this.rocket2Transform4);
		
		//rotate rocket2 location on z axis
		this.rocket2Transform5 = mat4.create();
		angle = 0.5 * Math.PI;
		axisRot = vec3.fromValues(0, 1, 0);
		mat4.fromRotation(this.rocket2Transform5, angle, axisRot);
		mat4.multiply (this.rocket2Transform, this.rocket2Transform, this.rocket2Transform5);
		
		
















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
		
		mat4.mul (this.tmp, coordFrame, this.wing3Transform);
		this.wing3.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
		
		mat4.mul (this.tmp, coordFrame, this.wing4Transform);
		this.wing4.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
		
		mat4.mul (this.tmp, coordFrame, this.mount1Transform);
		this.mount1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
		
		mat4.mul (this.tmp, coordFrame, this.mount2Transform);
		this.mount2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
		
		mat4.mul (this.tmp, coordFrame, this.thruster1Transform);
		this.thruster1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

		mat4.mul (this.tmp, coordFrame, this.thruster2Transform);
		this.thruster2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
		
		mat4.mul (this.tmp, coordFrame, this.rocket1Transform);
		this.rocket1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
		
		mat4.mul (this.tmp, coordFrame, this.rocket2Transform);
		this.rocket2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

	}
}
