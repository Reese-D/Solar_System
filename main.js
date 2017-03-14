/**
 * Created by Hans Dulimarta on 1/31/17.
 */

var gl;
var glCanvas, textOut;
var orthoProjMat, persProjMat, viewMat, topViewMat, view3Mat, view4mat, ringCF;
var axisBuff, tmpMat;
var globalAxes;
var current_view;
/* Vertex shader attribute variables */
var posAttr, colAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif;

const IDENTITY = mat4.create();
var coneSpinAngle;
var shaderProg;
var object_hash;

const DEFAULT_LIST_TEXT = "Select an object";

function main() {
    glCanvas = document.getElementById("gl-canvas");
    textOut = document.getElementById("msg");
    gl = WebGLUtils.setupWebGL(glCanvas, null);
    axisBuff = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBuff);
    window.addEventListener("resize", resizeHandler, false);
    window.addEventListener("keypress", keyboardHandler, false);
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
	    orthoProjMat = mat4.create();
	    persProjMat = mat4.create();
	    viewMat = mat4.create();
	    topViewMat = mat4.create();
	    view3Mat = mat4.create();
	    view4Mat = mat4.create();	
	    ringCF = mat4.create();
	    tmpMat = mat4.create();
	    mat4.lookAt(viewMat,
			vec3.fromValues(2, 2, 2), /* eye */
			vec3.fromValues(0, 0, 0), /* focal point */
			vec3.fromValues(0, 0, 1)); /* up */
	    mat4.lookAt(topViewMat,
			vec3.fromValues(0, 0, 2), 
			vec3.fromValues(0, 0, 0), 
			vec3.fromValues(0, 1, 0));	
	    mat4.lookAt(view3Mat,
			vec3.fromValues(2, -0.5, .5), 
			vec3.fromValues(0, 0, 0), 
			vec3.fromValues(0, 0, 1)); 
	    mat4.lookAt(view4Mat,
			vec3.fromValues(-2, .5, 0.5), 
			vec3.fromValues(0, 0, 0), 
			vec3.fromValues(0, 0, 1));
	    current_view = viewMat; 
	    gl.uniformMatrix4fv(modelUnif, false, ringCF);
	    object_hash = {};
	    object_hash["original spaceship"] = new DilbySpaceship(gl);
	    object_hash["shield"] = new Planet(gl,0,0,0,1.0,75,undefined,112421442,1,4,0.5);
	   // modelUnif = gl.getUniformLocation(prog, "shield");
	    addListToView();
	    //mat4.rotateX(ringCF, ringCF, -Math.PI/2);
	    coneSpinAngle = 0;
	    resizeHandler();
	    render();
	});

}

function addListToView(){
    selector = $(".object_list");
    selector.empty();
    selector.append("<option disabled selected>" + DEFAULT_LIST_TEXT + "</option>");
    for(key in object_hash){
	selector.append("<option>" + key + "</option>");
    }
}

function getCurrentListObject(){
    selector = $("option:selected");
    return object_hash[selector.text()];
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


function keyboardHandler(event) {
  //var unif;
 // unif = gl.getUniformLocation(getCurrentListObject(), "object");
 // gl.uniformMatrix4fv(unif, false, ringCF);
  const transXpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 1, 0, 0));
  const transXneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(-1, 0, 0));
  const transYpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 1, 0));
  const transYneg = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0,-1, 0));
  const transZpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 0, 1));
  const transZneg = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 0,-1));
  switch (event.key) {
    case "x":
      mat4.multiply(ringCF, transXneg, ringCF);  // ringCF = Trans * ringCF
      break;
    case "X":
      mat4.multiply(ringCF, transXpos, ringCF);  // ringCF = Trans * ringCF
      break;
    case "y":
      mat4.multiply(ringCF, transYneg, ringCF);  // ringCF = Trans * ringCF
      break;
    case "Y":
      mat4.multiply(ringCF, transYpos, ringCF);  // ringCF = Trans * ringCF
      break;
    case "z":
      mat4.multiply(ringCF, transZneg, ringCF);  // ringCF = Trans * ringCF
      break;
    case "Z":
      mat4.multiply(ringCF, transZpos, ringCF);  // ringCF = Trans * ringCF
      break;
  }
  textOut.innerHTML = "Ring origin (" + ringCF[12].toFixed(1) + ", "
      + ringCF[13].toFixed(1) + ", "
      + ringCF[14].toFixed(1) + ")";
}

function render() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    draw3D();;
    requestAnimationFrame(render);
}

function drawScene() {
    var yPos = 0.0;
    mat4.fromTranslation(tmpMat, vec3.fromValues(0, yPos, 0));
    mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat
    for(key in object_hash){
      object_hash[key].draw(posAttr, colAttr, modelUnif, tmpMat);
    }
}

function draw3D() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, persProjMat);
    gl.uniformMatrix4fv(viewUnif, false, current_view)
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    drawScene();
}


