/**
 * Created by Hans Dulimarta on 1/31/17.
 * Heavily edited by Reese & Miles De Wind - 03/10/2017
 */

var gl;
var glCanvas, textOut;
var orthoProjMat, persProjMat, viewMat, topViewMat, view3Mat, view4mat, ringCF;
var lightCF, lightPos, pointofLight, eyePos;
var axisBuff, tmpMat, lineBuff;
var globalAxes;
var current_view;
/* Vertex shader attribute variables */
var posAttr, colAttr, normalAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif, lightPosUnif, normalUnif, useLightingUnif;
var objTintUnif, ambCoeffUnif, diffCoeffUnif, specCoeffUnif, shininessUnif, isEnabledUnif;

const IDENTITY = mat4.create();
var coneSpinAngle;
var shaderProg;
var object_hash, obj;
var lightingComponentEnabled = [true, true, true];

const DEFAULT_LIST_TEXT = "Select an object";

function main() {
    glCanvas = document.getElementById("gl-canvas");
    textOut = document.getElementById("msg");
    gl = WebGLUtils.setupWebGL(glCanvas, null);
    axisBuff = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBuff);
     let normalCheckBox = document.getElementById("shownormal");
    normalCheckBox.addEventListener('change', ev => {
      showNormal = ev.target.checked;
      redrawNeeded = true;
    }, false);
    let lightCheckBox = document.getElementById("showlightvector");
    lightCheckBox.addEventListener('change', ev => {
      showLightVectors = ev.target.checked;
      redrawNeeded = true;
    }, false);
    let ambientCheckBox = document.getElementById("enableAmbient");
    ambientCheckBox.addEventListener('change', ev => {
      lightingComponentEnabled[0] = ev.target.checked;
      gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
      redrawNeeded = true;
    }, false);
    let diffuseCheckBox = document.getElementById("enableDiffuse");
    diffuseCheckBox.addEventListener('change', ev => {
      lightingComponentEnabled[1] = ev.target.checked;
      gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
      redrawNeeded = true;
    }, false);
    let specularCheckBox = document.getElementById("enableSpecular");
    specularCheckBox.addEventListener('change', ev => {
      lightingComponentEnabled[2] = ev.target.checked;
      gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
      redrawNeeded = true;
    }, false);
    let ambCoeffSlider = document.getElementById("amb-coeff");
    ambCoeffSlider.addEventListener('input', ev => {
      gl.uniform1f(ambCoeffUnif, ev.target.value);
      redrawNeeded = true;
    }, false);
    ambCoeffSlider.value = Math.random() * 0.2;
    let diffCoeffSlider = document.getElementById("diff-coeff");
    diffCoeffSlider.addEventListener('input', ev => {
      gl.uniform1f(diffCoeffUnif, ev.target.value);
      redrawNeeded = true;
    }, false);
    diffCoeffSlider.value = 0.5 + 0.5 * Math.random();  // random in [0.5, 1.0]
    let specCoeffSlider = document.getElementById("spec-coeff");
    specCoeffSlider.addEventListener('input', ev => {
      gl.uniform1f(specCoeffUnif, ev.target.value);
      redrawNeeded = true;
    }, false);
    specCoeffSlider.value = Math.random();
    let shinySlider = document.getElementById("spec-shiny");
    shinySlider.addEventListener('input', ev => {
      gl.uniform1f(shininessUnif, ev.target.value);
      redrawNeeded = true;
    }, false);
    shinySlider.value = Math.floor(1 + Math.random() * shinySlider.max);
    let redSlider = document.getElementById("redslider");
    let greenSlider = document.getElementById("greenslider");
    let blueSlider = document.getElementById("blueslider");
    redSlider.addEventListener('input', colorChanged, false);
    greenSlider.addEventListener('input', colorChanged, false);
    blueSlider.addEventListener('input', colorChanged, false);
 
    let objxslider = document.getElementById("objx");
    let objyslider = document.getElementById("objy");
    let objzslider = document.getElementById("objz");
    objxslider.addEventListener('input', objPosChanged, false);
    objyslider.addEventListener('input', objPosChanged, false);
    objzslider.addEventListener('input', objPosChanged, false);

    let lightxslider = document.getElementById("lightx");
    let lightyslider = document.getElementById("lighty");
    let lightzslider = document.getElementById("lightz");
    lightxslider.addEventListener('input', lightPosChanged, false);
    lightyslider.addEventListener('input', lightPosChanged, false);
    lightzslider.addEventListener('input', lightPosChanged, false);

    let eyexslider = document.getElementById("eyex");
    let eyeyslider = document.getElementById("eyey");
    let eyezslider = document.getElementById("eyez");
    eyexslider.addEventListener('input', eyePosChanged, false);
    eyeyslider.addEventListener('input', eyePosChanged, false);
    eyezslider.addEventListener('input', eyePosChanged, false);

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
	    lineBuff = gl.createBuffer();
	    posAttr = gl.getAttribLocation(prog, "vertexPos");
	    colAttr = gl.getAttribLocation(prog, "vertexCol");
	    normalAttr = gl.getAttribLocation(prog, "vertexNormal");
	    lightPosUnif = gl.getUniformLocation(prog, "lightPosWorld");
	    projUnif = gl.getUniformLocation(prog, "projection");
	    viewUnif = gl.getUniformLocation(prog, "view");
	    modelUnif = gl.getUniformLocation(prog, "modelCF");
	    normalUnif = gl.getUniformLocation(prog, "normalMat");
	    useLightingUnif = gl.getUniformLocation(prog, "useLighting");
	    objTintUnif = gl.getUniformLocation(prog, "objectTint");
	    ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
	    diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
	    specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
	    shininessUnif = gl.getUniformLocation(prog, "shininess");
	    isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");
	    gl.enableVertexAttribArray(posAttr);
	    gl.enableVertexAttribArray(colAttr);
	    orthoProjMat = mat4.create();
	    persProjMat = mat4.create();
	    viewMat = mat4.create();
	    viewMatInverse = mat4.create();
	    topViewMat = mat4.create();
	    view3Mat = mat4.create();
	    view4Mat = mat4.create();	
	    ringCF = mat4.create();
	    lightCF = mat4.create();
	    tmpMat = mat4.create();
	    eyePos = vec3.fromValues(3,2,3);
	    mat4.lookAt(viewMat,
			eyePos, /* eye */
			vec3.fromValues(0, 0, 0), /* focal point */
			vec3.fromValues(0, 0, 1)); /* up */
	    mat4.invert(viewMatInverse, viewMat);
	    mat4.lookAt(topViewMat,
			vec3.fromValues(0, 0, 2), 
			vec3.fromValues(0, 0, 0), 
			vec3.fromValues(0, 1, 0));	
	    mat4.lookAt(view3Mat,
			vec3.fromValues(2, -0.5, 1.0), 
			vec3.fromValues(0, 0, 0), 
			vec3.fromValues(0, 0, 1)); 
	    mat4.lookAt(view4Mat,
			vec3.fromValues(-2, .5, 1.0), 
			vec3.fromValues(0, 0, 0), 
			vec3.fromValues(0, 0, 1));
	    current_view = viewMat; 
	    gl.uniformMatrix4fv(modelUnif, false, ringCF);
	     
	    lightPos = vec3.fromValues(0, 2, 2);
	    eyexslider.value = lightPos[0];
	    eyeyslider.value = lightPos[1];
	    eyezslider.value = lightPos[2];
	    mat4.fromTranslation(lightCF, lightPos);		
	    lightxslider.value = lightPos[0];
	    lightyslider.value = lightPos[1];
	    lightzslider.value = lightPos[2];
	    gl.uniform3fv(lightPosUnif, lightPos);
	    let vertices = [0, 0, 0, 1, 1, 1,
		lightPos[0], 0, 0, 1, 1, 1,
		lightPos[0], lightPos[1], 0, 1, 1, 1,
		lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
	    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
	    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
	    redSlider.value = Math.random();
	    blueSlider.value = Math.random();
	    greenSlider.value = Math.random();
	    objTint = vec3.fromValues(redSlider.value, greenSlider.value, redSlider.value);
	    gl.uniform3fv(objTintUnif, objTint);
	    gl.uniform1f(ambCoeffUnif, ambCoeffSlider.value);
	    gl.uniform1f(diffCoeffUnif, diffCoeffSlider.value);
	    gl.uniform1f(specCoeffUnif, specCoeffSlider.value);
	    gl.uniform1f(shininessUnif, shinySlider.value);

	    gl.uniform3iv(isEnabledUnif, lightingComponentEnabled);
	    //translate everything
	    var yPos = 0.0;
	    mat4.fromTranslation(tmpMat, vec3.fromValues(0, yPos, 0));
	    mat4.multiply(tmpMat, ringCF, tmpMat);   // tmp = ringCF * tmpMat

	    //create a hash of all initial objects
	    object_hash = {};
	    object_hash["spaceship0"] = new DilbySpaceship(gl, tmpMat);
	    object_hash["shield0"] = new Planet(gl, 0, 0, 0, 1.0, 75, undefined, 112421442, 1, 4, 0.5, mat4.clone(tmpMat));
	    let yellow = vec3.fromValues(0xe7/255, 0xf2/255, 0x4d/255);
	    pointofLight = new UniSphere(gl, 0.03, 3, yellow, yellow);
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

function deleteCurrentListObject(){
	delete object_hash[getCurrentListObjectName()];
	addListToView();
}

function getCloneNumber(){
    return $("input[name='num_clones']")[0].valueAsNumber;
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

function ambColorChanged(ev) {
  switch (ev.target.id) {
    case 'r-amb-slider':
      objAmbient[0] = ev.target.value;
      break;
    case 'g-amb-slider':
      objAmbient[1] = ev.target.value;
      break;
    case 'b-amb-slider':
      objAmbient[2] = ev.target.value;
      break;
  }
  gl.uniform3fv(objAmbientUnif, objAmbient);
  redrawNeeded = true;
}

function colorChanged(ev) {
  switch (ev.target.id) {
    case 'redslider':
      objTint[0] = ev.target.value;
      break;
    case 'greenslider':
      objTint[1] = ev.target.value;
      break;
    case 'blueslider':
      objTint[2] = ev.target.value;
      break;
  }
  gl.uniform3fv(objTintUnif, objTint);
  redrawNeeded = true;
}

function lightPosChanged(ev) {
  switch (ev.target.id) {
    case 'lightx':
      lightPos[0] = ev.target.value;
      break;
    case 'lighty':
      lightPos[1] = ev.target.value;
      break;
    case 'lightz':
      lightPos[2] = ev.target.value;
      break;
  }
  mat4.fromTranslation(lightCF, lightPos);
  gl.uniform3fv (lightPosUnif, lightPos);
  let vertices = [
    0, 0, 0, 1, 1, 1,
    lightPos[0], 0, 0, 1, 1, 1,
    lightPos[0], lightPos[1], 0, 1, 1, 1,
    lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
  gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
  redrawNeeded = true;
}

function objPosChanged(ev) {
  switch (ev.target.id) {
    case 'objx':
      ringCF[12] = ev.target.value;
      break;
    case 'objy':
      ringCF[13] = ev.target.value;
      break;
    case 'objz':
      ringCF[14] = ev.target.value;
      break;
  }
  redrawNeeded = true;
}

function eyePosChanged(ev) {
  switch (ev.target.id) {
    case 'eyex':
      eyePos[0] = ev.target.value;
      break;
    case 'eyey':
      eyePos[1] = ev.target.value;
      break;
    case 'eyez':
      eyePos[2] = ev.target.value;
      break;
  }
  mat4.lookAt(viewMat,
    eyePos,
    vec3.fromValues(0, 0, 0), /* focal point */
    vec3.fromValues(0, 0, 1)); /* up */
  mat4.invert (viewMatInverse, viewMat);
  redrawNeeded = true;
}

function parseSpaceship(objName){
	var parsedObj = objName.split("spaceship");
	var currentNum = parseInt(parsedObj[1]);
	return currentNum;
}

function parseShield(objName){
	var parsedObj = objName.split("shield");
	var currentNum = parseInt(parsedObj[1]);
	return currentNum;
}

function cloneObject(){
	var shipOrShield = 0;
	var objName = getCurrentListObjectName();
	var currentNum = objName.split("spaceship");
	if(currentNum[1] == undefined){
		currentNum = objName.split("shield");
		shipOrShield = 1;
	}
	var tmpMat2 = mat4.clone(current_object.coordFrame);
        var transpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 0, .3));
	var cloneNum = getCloneNumber();
	var largetsCurrentNumber = 0;
	var isValidNum;
	if(cloneNum === parseInt(cloneNum, 10)){
		//cloneNum is an integer
	}else{
		cloneNum = 1;
	}
	if(shipOrShield == 0){
		for(var key in object_hash){
			isValidNum  = parseSpaceship(key);
			if(isValidNum === parseInt(isValidNum, 10)){
				largestCurrentNumber = isValidNum;
			}
		}
	}else{
		for(var key in object_hash){
			isValidNum = parseShield(key);
			if(isValidNum === parseInt(isValidNum, 10)){
				largestCurrentNumber = isValidNum;
			}
		}
	}	
	var start = largestCurrentNumber + 1;
	console.log(start);
	console.log(start + cloneNum);
	console.log(tmpMat2);
	obj = new Torus(gl, 1, .3, 36, 24);
	for(let i =start; i < start + cloneNum; i++){
		var tmpMat2 = mat4.clone(tmpMat2);
		mat4.multiply (tmpMat2, transpos, tmpMat2);
		if (current_object instanceof DilbySpaceship){
			console.log(i);
			object_hash["spaceship" +i] = new DilbySpaceship(gl, tmpMat2);
		}else{
			object_hash["shield" + i] = new Planet(gl, 0, 0, 0, 1.0, 75, undefined, 112421442, 1, 4, 0.5, tmpMat2);
		}
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
    case "!":
	current_view = viewMat;
	break;
    case "@":
	current_view = topViewMat;
	break;
    case "#":
	current_view = view3Mat;
	break;
    case "$":
	current_view = view4Mat;
	break;
    case "c":
	cloneObject();
	break;
    case "d":
	deleteCurrentListObject();
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
    	textOut.innerHTML = "Ring origin (" + ringCF[12].toFixed(1) + ", "
	    + ringCF[13].toFixed(1) + ", "
	    + ringCF[14].toFixed(1) + ")";
    }
}

function render() {
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    draw3D();
    requestAnimationFrame(render);
}

function drawScene() {
    gl.disableVertexAttribArray(normalAttr);
    gl.enableVertexAttribArray(colAttr);


    // Use LINE_STRIP to mark light position
    gl.uniformMatrix4fv(modelUnif, false, ringCF);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
    gl.vertexAttribPointer(posAttr, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colAttr, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.LINE_STRIP, 0, 4);

    // Draw the light source using its own coordinate frame
    pointofLight.draw(posAttr, colAttr, modelUnif, lightCF);

    gl.disableVertexAttribArray(colAttr);
    gl.enableVertexAttribArray(normalAttr);
    for(key in object_hash){
	object_hash[key].draw(posAttr, normalAttr, modelUnif);
    }
}

function draw3D() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, persProjMat);
    gl.uniformMatrix4fv(viewUnif, false, current_view);
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    //obj.drawVectorsTo(gl, lightPos, posAttr, colAttr, modelUnif, ringCF);
    drawScene();
}


