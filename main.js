/**
 * Created by Hans Dulimarta on 1/31/17.
 */

var gl;
var glCanvas, textOut;
var orthoProjMat, persProjMat, viewMat, topViewMat, ringCF;
var axisBuff, tmpMat;
var globalAxes;

/* Vertex shader attribute variables */
var posAttr, colAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif;

const IDENTITY = mat4.create();
var coneSpinAngle;
var obj;
var shaderProg;

function main() {
    glCanvas = document.getElementById("gl-canvas");
    textOut = document.getElementById("msg");
    gl = WebGLUtils.setupWebGL(glCanvas, null);
    axisBuff = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBuff);
    window.addEventListener("resize", resizeHandler, false);
    ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
	.then (prog => {
	    shaderProg = prog;
	    gl.useProgram(prog);
	    gl.clearColor(0, 0, 0, 1);
	    gl.enable(gl.DEPTH_TEST);    /* enable hidden surface removal */
	    //gl.enable(gl.CULL_FACE);     /* cull back facing polygons */
	    //gl.cullFace(gl.BACK);
	    posAttr = gl.getAttribLocation(prog, "vertexPos");
	    colAttr = gl.getAttribLocation(prog, "vertexCol");
	    projUnif = gl.getUniformLocation(prog, "projection");
	    viewUnif = gl.getUniformLocation(prog, "view");
	    modelUnif = gl.getUniformLocation(prog, "modelCF");
	    gl.enableVertexAttribArray(posAttr);
	    gl.enableVertexAttribArray(colAttr);
	    //orthoProjMat = mat4.create();
	    persProjMat = mat4.create();
	    viewMat = mat4.create();
	    
	    ringCF = mat4.create();
	    tmpMat = mat4.create();
	    mat4.lookAt(viewMat,
			vec3.fromValues(2, 2, 2), /* eye */
			vec3.fromValues(0, 0, 0), /* focal point */
			vec3.fromValues(0, 0, 1)); /* up */
	    gl.uniformMatrix4fv(modelUnif, false, ringCF);

	    obj = new DilbySpaceship(gl);
	    //mat4.rotateX(ringCF, ringCF, -Math.PI/2);
	    coneSpinAngle = 0;
	    resizeHandler();
	    render();
	});
}


function resizeHandler() {
    glCanvas.width = window.innerWidth;
    glCanvas.height = 0.9 * window.innerHeight;
    if (glCanvas.width > glCanvas.height) { // landscape
	let ratio = 2 * glCanvas.height / glCanvas.width;
	console.log("Landscape mode, ratio is " + ratio);
	mat4.perspective(persProjMat,
			 Math.PI/3,  // 60 degrees vertical field of view
			 1/ratio,    // must be width/height ratio
			 1,          // near plane at Z=1
			 20);        // far plane at Z=20
    } else {
	alert ("Window is too narrow!");
    }

}

function render() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    draw3D();

    requestAnimationFrame(render);
}

function drawScene() {

    if (typeof obj !== 'undefined') {
	var yPos = 0.0;
	mat4.fromTranslation(tmpMat, vec3.fromValues(0, yPos, 0));
	mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
	obj.draw(posAttr, colAttr, modelUnif, tmpMat);
	obj2 = new Planet(gl,0,0,0,0.8,75,undefined,112421442,1,4,0.5);
	obj2.draw(posAttr, colAttr, modelUnif, tmpMat);
    }
}

function draw3D() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, persProjMat);
    gl.uniformMatrix4fv(viewUnif, false, viewMat)
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    drawScene();
}

/*
  function drawTopView() {
  // We must update the projection and view matrices in the shader 
  gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
  gl.uniformMatrix4fv(viewUnif, false, topViewMat);
  gl.viewport(glCanvas.width/2, 0, glCanvas.width/2, glCanvas.height);
  drawScene();
  }
*/
