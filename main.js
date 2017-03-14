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

	    //translate everything
	    var yPos = 0.0;
	    mat4.fromTranslation(tmpMat, vec3.fromValues(0, yPos, 0));
	    mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat

	    //create a hash of all initial objects
	    object_hash = {};
	    object_hash["spaceship0"] = new DilbySpaceship(gl, tmpMat);
	    object_hash["shield0"] = new Planet(gl, 0, 0, 0, 1.0, 75, undefined, 112421442, 1, 4, 0.5, mat4.clone(tmpMat));
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
    if(!(selector.text() in object_hash)){
	return undefined;
    }
    return object_hash[selector.text()];
}

function getCurrentListObjectName(){
    return $("option:selected").text();
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


function cloneObject(){
	var objName = getCurrentListObjectName();
	console.log(objName);
	var currentNum = objName.split("spaceship");
	console.log(currentNum[1]);
	var offset = -2;
	for(let i =1; i < 3; i++){
		var tmpMat2 = mat4.clone(current_object.coordFrame);
		mat4.fromTranslation(tmpMat2, vec3.fromValues(0, offset, 0));
		if (current_object instanceof DilbySpaceship){
			object_hash["spaceship" +i] = new DilbySpaceship(gl, tmpMat2);
		}else{
			object_hash["shield" + i] = new Planet(gl, 0, offset, 0, 1.0, 75, undefined, 112421442, 1, 4, 0.5, tmpMat2);
		}
		offset++;
	}
	addListToView(); 
}




function keyboardHandler(event) {
    //var unif;
    // unif = gl.getUniformLocation(getCurrentListObject(), "object");
    // gl.uniformMatrix4fv(unif, false, ringCF);
    var translations = [];
    var rotations = [];
    var scalings = [];
    for(let i = 0; i < 3; i++){
	var current = [0,0,0];
	for(let k = -1; k < 2; k+=2){
	    current[i] = k
	    translations.push(mat4.fromTranslation(mat4.create(), vec3.fromValues(current[0], current[1], current[2])));
	    rotations.push(mat4.fromRotation(mat4.create(),Math.PI/9, vec3.fromValues(current[0], current[1], current[2])));
	    current[i] = k*0.1 + 1;
	    current[i]--;
	    scalings.push(mat4.fromScaling(mat4.create(), vec3.fromValues(1 + current[0], 1 + current[1], 1 + current[2])));
	}
    }
    current_object = getCurrentListObject();
    if(typeof current_object === 'undefined'){
	return;
    }
    var transition = undefined;
    switch (event.key) {
	
    case "x":
	transition = translations[0]
	break;
    case "X":
	transition = translations[1]
	break;
    case "y":
	transition = translations[2]
	break;
    case "Y":
	transition = translations[3]
	break;
    case "z":
	transition = translations[4]
	break;
    case "Z":
	transition = translations[5]
	break;

    case "q":
	transition = rotations[0]
	break;
    case "Q":
	transition = rotations[1]
	break;
    case "w":
	transition = rotations[2]
	break;
    case "W":
	transition = rotations[3]
	break;
    case "e":
	transition = rotations[4]
	break;
    case "E":
	transition = rotations[5]
	break;

    case "i":
	transition = scalings[0]
	break;
    case "I":
	transition = scalings[1]
	break;
    case "o":
	transition = scalings[2]
	break;
    case "O":
	transition = scalings[3]
	break;
    case "p":
	transition = scalings[4]
	break;
    case "P":
	transition = scalings[5]
	break;

    case "1":
	current_view = viewMat;
	break;
    case "2":
	current_view = topViewMat;
	break;
    case "3":
	current_view = view3Mat;
	break;
    case "4":
	current_view = view4Mat;
	break;
    case "c":
	cloneObject();
	break;

     }
    if(typeof transition !== 'undefined'){
	let origin = [];
	origin.push(current_object.coordFrame[12], current_object.coordFrame[13], current_object.coordFrame[14]);
	translate_to_origin = mat4.fromTranslation(mat4.create(), vec3.fromValues(origin[0]*-1, origin[1]*-1, origin[2]*-1))
	mat4.multiply(current_object.coordFrame, translate_to_origin, current_object.coordFrame);
	mat4.multiply(current_object.coordFrame, transition, current_object.coordFrame);  // ringCF = Trans * ringCF
	translate_to_origin = mat4.fromTranslation(mat4.create(), vec3.fromValues(origin[0], origin[1], origin[2]))
	mat4.multiply(current_object.coordFrame, translate_to_origin, current_object.coordFrame);
    }
    textOut.innerHTML = "Ring origin (" + ringCF[12].toFixed(1) + ", "
	+ ringCF[13].toFixed(1) + ", "
	+ ringCF[14].toFixed(1) + ")";
}

function render() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    draw3D();
    requestAnimationFrame(render);
}

function drawScene() {
    for(key in object_hash){
	object_hash[key].draw(posAttr, colAttr, modelUnif);
    }
}

function draw3D() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, persProjMat);
    gl.uniformMatrix4fv(viewUnif, false, current_view)
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    drawScene();
}


