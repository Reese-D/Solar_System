/**
 * Created by Hans Dulimarta on 1/31/17.
 */

var gl;
var glCanvas;
var orthoProjMat, persProjMat, viewMat, viewMatInverse, topViewMat,topViewMatInverse, normalMat;
var ringCF, lightCF, eyePos;
var axisBuff, tmpMat;
//var globalAxes;
var object_hash;
/* Vertex shader attribute variables */
var posAttr, colAttr, normalAttr;

/* Shader uniform variables */
var projUnif, viewUnif, modelUnif, lightPosUnif;
var objAmbientUnif, objTintUnif, normalUnif, isEnabledUnif;
var ambCoeffUnif, diffCoeffUnif, specCoeffUnif, shininessUnif;
var lightPos, useLightingUnif;
const IDENTITY = mat4.create();
var objArr, lineBuff, normBuff, objTint, pointLight;
var shaderProg, redrawNeeded, showNormal, showLightVectors;
var lightingComponentEnabled = [true, true, true];
var object_hash;
var timeStamp;
var sumElapse = 0;
const DEFAULT_LIST_TEXT = "Select an object";
function main() {
    glCanvas = document.getElementById("gl-canvas");

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
    // let redSlider = document.getElementById("redslider");
    // let greenSlider = document.getElementById("greenslider");
    // let blueSlider = document.getElementById("blueslider");
    // redSlider.addEventListener('input', colorChanged, false);
    // greenSlider.addEventListener('input', colorChanged, false);
    // blueSlider.addEventListener('input', colorChanged, false);

    let objxslider = document.getElementById("objx");
    let objyslider = document.getElementById("objy");
    let objzslider = document.getElementById("objz");
    objxslider.addEventListener('input', objPosChanged, false);
    objyslider.addEventListener('input', objPosChanged, false);
    objzslider.addEventListener('input', objPosChanged, false);

    // let lightxslider = document.getElementById("lightx");
    // let lightyslider = document.getElementById("lighty");
    // let lightzslider = document.getElementById("lightz");
    // lightxslider.addEventListener('input', lightPosChanged, false);
    // lightyslider.addEventListener('input', lightPosChanged, false);
    // lightzslider.addEventListener('input', lightPosChanged, false);

    let eyexslider = document.getElementById("eyex");
    let eyeyslider = document.getElementById("eyey");
    let eyezslider = document.getElementById("eyez");
    eyexslider.addEventListener('input', eyePosChanged, false);
    eyeyslider.addEventListener('input', eyePosChanged, false);
    eyezslider.addEventListener('input', eyePosChanged, false);

    gl = WebGLUtils.setupWebGL(glCanvas, null);
    window.addEventListener("resize", resizeHandler, false);
    ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
	.then (prog => {
	    shaderProg = prog;
	    gl.useProgram(prog);
	    gl.clearColor(0.3, 0.3, 0.3, 1);
	    gl.enable(gl.DEPTH_TEST);    /* enable hidden surface removal */
	    gl.enable(gl.CULL_FACE);     /* cull back facing polygons */
	    gl.cullFace(gl.BACK);
	    axisBuff = gl.createBuffer();
	    lineBuff = gl.createBuffer();
	    normBuff = gl.createBuffer();
	    posAttr = gl.getAttribLocation(prog, "vertexPos");
	    colAttr = gl.getAttribLocation(prog, "vertexCol");
	    normalAttr = gl.getAttribLocation(prog, "vertexNormal");
	    lightPosUnif = gl.getUniformLocation(prog, "lightPosWorld");
	    projUnif = gl.getUniformLocation(prog, "projection");
	    viewUnif = gl.getUniformLocation(prog, "view");
	    modelUnif = gl.getUniformLocation(prog, "modelCF");
	    normalUnif = gl.getUniformLocation(prog, "normalMat");
	    useLightingUnif = gl.getUniformLocation (prog, "useLighting");
	    //objTintUnif = gl.getUniformLocation(prog, "objectTint");
	    ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
	    diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
	    specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
	    shininessUnif = gl.getUniformLocation(prog, "shininess");
	    isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");
	    /* Enable only posAttr here. In drawScene() we will selectively switch
	     * between colorAttr and normalAttr, so we don't want to enable them now */
	    gl.enableVertexAttribArray(posAttr);
	    // gl.enableVertexAttribArray(colAttr);
	    // gl.enableVertexAttribArray(normalAttr);

	    orthoProjMat = mat4.create();
	    persProjMat = mat4.create();
	    viewMat = mat4.create();
	    viewMatInverse = mat4.create();
	    topViewMat = mat4.create();
	    topViewMatInverse = mat4.create();
	    ringCF = mat4.create();
	    normalMat = mat3.create();
	    lightCF = mat4.create();
	    tmpMat = mat4.create();
	    eyePos = vec3.fromValues(3, 2, 3);
	    mat4.lookAt(viewMat,
			eyePos,
			vec3.fromValues(0, 0, 0), /* focal point */
			vec3.fromValues(0, 0, 1)); /* up */
	    mat4.invert (viewMatInverse, viewMat);
	    mat4.lookAt(topViewMat,
			vec3.fromValues(0,0,2),
			vec3.fromValues(0,0,0),
			vec3.fromValues(0,1,0)
		       );
	    mat4.invert (topViewMatInverse, topViewMat);
	    gl.uniformMatrix4fv(modelUnif, false, IDENTITY);

	    lightPos = vec3.fromValues(0, 2, 2);
	    eyexslider.value = lightPos[0];
	    eyeyslider.value = lightPos[1];
	    eyezslider.value = lightPos[2];
	    mat4.fromTranslation(lightCF, lightPos);
	    lightx.value = lightPos[0];
	    lighty.value = lightPos[1];
	    lightz.value = lightPos[2];
	    //gl.uniform3fv (lightPosUnif, lightPos);
	    let vertices = [0, 0, 0, 1, 1, 1,
			    lightPos[0], 0, 0, 1, 1, 1,
			    lightPos[0], lightPos[1], 0, 1, 1, 1,
			    lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
	    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
	    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

	    // redSlider.value = Math.random();
	    // greenSlider.value = Math.random();
	    // blueSlider.value = Math.random();
	    //objTint = vec3.fromValues(redSlider.value, greenSlider.value, blueSlider.value);
	    //gl.uniform3fv(objTintUnif, objTint);
	    gl.uniform1f(ambCoeffUnif, ambCoeffSlider.value);
	    gl.uniform1f(diffCoeffUnif, diffCoeffSlider.value);
	    gl.uniform1f(specCoeffUnif, specCoeffSlider.value);
	    gl.uniform1f(shininessUnif, shinySlider.value);

            //create a hash of all initial objects
	    let yellow = vec3.fromValues (0xe7/255, 0xf2/255, 0x4d/255);
	    let white = vec3.fromValues(1,1,1);
	    object_hash = {};
	    //object_hash["spaceship0"] = new DilbySpaceship(gl, tmpMat);
	    object_hash["planet0"] = new Planet(gl, 0, 0, 0, 0.2, 75, yellow, 112442, 1, 4, 0.5, mat4.clone(tmpMat));
	    object_hash["planet1"] = new Planet(gl, 0, 0, 0, 0.1, 75, white, 11221442, 1, 4, 0.5, mat4.clone(tmpMat));
	    object_hash["planet2"] = new Planet(gl, 0, 0, 0, 0.1, 75, white, 1121442, 1, 4, 0.5, mat4.clone(tmpMat));
	    object_hash["planet3"] = new Planet(gl, 0, 0, 0, 0.1, 75, white, 12421442, 1, 4, 0.5, mat4.clone(tmpMat));
	    object_hash["planet4"] = new Planet(gl, 0, 0, 0, 0.125, 75, yellow, 11221442, 1, 4, 0.5, mat4.clone(tmpMat));
	    object_hash["planet5"] = new Planet(gl, 0, 0, 0, 0.0333, 75, white, 21442, 1, 4, 0.5, mat4.clone(tmpMat));

	    object_hash["planet1"].coordFrame = mat4.fromTranslation(object_hash["planet1"].coordFrame, vec3.fromValues(-1,0,0));
	    object_hash["planet2"].coordFrame = mat4.fromTranslation(object_hash["planet2"].coordFrame, vec3.fromValues(0.6,0,0));
	    //mat4.translate(object_hash["planet2"].coordFrame, object_hash["planet2"].coordFrame, vec3.fromValues(0,0.6,0));
	    object_hash["planet3"].coordFrame = mat4.fromTranslation(object_hash["planet3"].coordFrame, vec3.fromValues(0,0,-0.3));
	    object_hash["planet4"].coordFrame = mat4.fromTranslation(object_hash["planet4"].coordFrame, vec3.fromValues(0,-0.3,0.3));
	    object_hash["planet5"].coordFrame = mat4.fromTranslation(object_hash["planet5"].coordFrame, vec3.fromValues(-0.3,0.3,0));
	    
	    //tempShip = mat4.create();
	    //mat4.fromTranslation(tempShip, object_hash["spaceship0"].coordFrame, vec3.fromValues(1, 1, 0));
	    //mat4.fromScaling(object_hash["spaceship0"].coordFrame, vec3.fromValues(.1, .1, .1));
	    //mat4.multiply(object_hash["spaceship0"].coordFrame, tempShip,object_hash["spaceship0"].coordFrame);
	    // modelUnif = gl.getUniformLocation(prog, "shield");
	    addListToView();
	    //mat4.rotateX(ringCF, ringCF, -Math.PI/2);
	    


	    gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
	    //objArr = []
	    //objArr.push(new Torus(gl, 1.0, 0.3, 36, 24));
	    //pointLight = new UniSphere(gl, 0.03, 3, yellow, yellow);
	    //globalAxes = new Axes(gl);
	    timeStamp = Date.now();
	    redrawNeeded = true;
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


function resizeHandler() {
    glCanvas.width = window.innerWidth;
    glCanvas.height = 0.75 * window.innerHeight;
    if (glCanvas.width > glCanvas.height) { /* landscape */
	let ratio = 2 * glCanvas.height / glCanvas.width;
	mat4.ortho(orthoProjMat, -3, 3, -3 * ratio, 3 * ratio, -5, 5);
	mat4.perspective(persProjMat,
			 Math.PI/3,  /* 60 degrees vertical field of view */
			 1/ratio,    /* must be width/height ratio */
			 1,          /* near plane at Z=1 */
			 20);        /* far plane at Z=20 */
	redrawNeeded = true;
    } else {
	alert ("Window is too narrow!");
    }

}

function orbit(planet){
    let rotateX = 0.00;
    let rotateY = 0.00;
    let orbitSpeed = 1;

    let now = Date.now();
    let elapse = (now - timeStamp)/1000;
    timeStamp = now; 
    sumElapse = sumElapse + elapse;
    
    switch(planet){
    case "planet0":
	return;
    case "planet1":
	rotateY = 0.5
	orbitSpeed = 1.6
	break;
    case "planet2":
	rotateY = 0.8
	orbitSpeed = 0.3
	break;
    case "planet3":
	orbitSpeed = 0.6
	rotateY = 0.4
	roateX = 0.4
	break;
    case "planet4":
	rotateX = 0;
	rotateY = 0.3;
	orbitSpeed = 2;
	break;
    case "planet5":
	rotateY = 0.2;
	orbitSpeed = 1.1
	break;
    default:
	break;
    }
    rotateX = (rotateX * sumElapse) % 2*Math.PI
    rotateY = (rotateY * sumElapse) % 2*Math.PI
    
    let x = 0 + orbitSpeed * Math.cos(rotateX) * Math.sin(rotateY);
    let y = 0 + orbitSpeed * Math.sin(rotateX) * Math.sin(rotateY);
    let z = 0 + orbitSpeed * Math.cos(rotateY);
    let axisRot = vec3.fromValues(x,y,z);
    console.log(axisRot);
    let crdFrame = object_hash[planet].coordFrame;
    if(planet == "planet2"){
	mat4.translate(crdFrame, object_hash["planet1"].coordFrame, axisRot);
    }else{
	mat4.translate(crdFrame, object_hash["planet0"].coordFrame, axisRot);
    }


    // let now = Date.now();
    // let elapse = (now - timeStamp)/1000;
    // timeStamp = now; 
    // sumElapse = sumElapse + elapse;
    // let crdFrame = object_hash[planet].coordFrame
    // if(sumElapse >=80){
    // 	sumElapse = 0;
    // }
    // if(planet == "planet0"){
    // 	mat4.rotateX(crdFrame, crdFrame, Math.PI/5000);
    // }
    // if(planet == "planet1"){	
    // 	let axisRot = vec3.fromValues(1, 1, 0);
    // 	let orbitDistance = 0.01//sumElapse/40 * Math.PI;
    // 	let rotate = mat4.fromRotation(mat4.create(), Math.PI/8, vec3.fromValues(1,0,0));
    // 	//mat4.multiply(crdFrame, mat4.create(),rotate);
    // 	//mat4.rotate(crdFrame, crdFrame, orbitDistance, axisRot);
    // 	mat4.translate(crdFrame,crdFrame, vec3.fromValues(0.001,0,0))
    // }
    // if(planet == "planet2"){
    // 	let axisRot = vec3.fromValues(1, 1, 0);
    // 	let orbitDistance = 0.01//sumElapse/10 * Math.PI;
    // 	mat4.rotate(crdFrame, crdFrame, orbitDistance, axisRot);
    // }
    // if(planet == "planet3"){
    // 	let axisRot = vec3.fromValues(1, .4, 0);
    // 	let orbitDistance = 0.02//sumElapse/20 * Math.PI;
    // 	mat4.rotate(crdFrame, crdFrame, orbitDistance, axisRot);
    // }
    // if(planet == "planet4"){
    // 	let axisRot = vec3.fromValues(0, 0, 0.25);
    // 	let orbitDistance = 0.03//sumElapse/40 * Math.PI;
    // 	mat4.rotate(crdFrame, crdFrame, orbitDistance, axisRot);
    // }
    // if(planet == "planet5"){
    // 	//mat4.copy(crdFrame, object_hash["planet1"].coordFrame);
    // 	let axisRot = vec3.fromValues(-.2, 1, 0);
    // 	let orbitDistance = 0.1//sumElapse/5 * Math.PI;
    // 	mat4.rotate(crdFrame, crdFrame, orbitDistance, axisRot);  
	
    // 	let tempCoord = mat4.create();
    // 	//mat4.rotateX(tempCoord, tempCoord, .5 * Math.PI);
    // 	//mat4.multiply(crdFrame, tempCoord, crdFrame);
	
    // }
     redrawNeeded = true;
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

// function colorChanged(ev) {
//   switch (ev.target.id) {
//     case 'redslider':
//       objTint[0] = ev.target.value;
//       break;
//     case 'greenslider':
//       objTint[1] = ev.target.value;
//       break;
//     case 'blueslider':
//       objTint[2] = ev.target.value;
//       break;
//   }
//   gl.uniform3fv(objTintUnif, objTint);
//   redrawNeeded = true;
// }

// function lightPosChanged(ev) {
//   switch (ev.target.id) {
//     case 'lightx':
//       lightPos[0] = ev.target.value;
//       break;
//     case 'lighty':
//       lightPos[1] = ev.target.value;
//       break;
//     case 'lightz':
//       lightPos[2] = ev.target.value;
//       break;
//   }
//   mat4.fromTranslation(lightCF, lightPos);
//   gl.uniform3fv (lightPosUnif, lightPos);
//   let vertices = [
//     0, 0, 0, 1, 1, 1,
//     lightPos[0], 0, 0, 1, 1, 1,
//     lightPos[0], lightPos[1], 0, 1, 1, 1,
//     lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
//   gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
//   gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
//   redrawNeeded = true;
// }


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

function render() {
    if (redrawNeeded) {
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	draw3D();
	drawTopView();
	/* looking at the XY plane, Z-axis points towards the viewer */
	// coneSpinAngle += 1;  /* add 1 degree */
	redrawNeeded = false;
    }
    orbit("planet0");
    orbit("planet1");
    orbit("planet2");
    orbit("planet3");
    orbit("planet4");
    orbit("planet5");

    requestAnimationFrame(render);
}

function drawScene() {
    gl.uniform1i (useLightingUnif, false);
    //  gl.disableVertexAttribArray(normalAttr);
    gl.enableVertexAttribArray(colAttr);

    /* Use LINE_STRIP to mark light position */
    gl.uniformMatrix4fv(modelUnif, false, IDENTITY);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
    gl.vertexAttribPointer(posAttr, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colAttr, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.LINE_STRIP, 0, 4);

    /* draw the global coordinate frame */
    //  globalAxes.draw(posAttr, colAttr, modelUnif, IDENTITY);

    /* Draw the light source (a sphere) using its own coordinate frame */
    //pointLight.draw(posAttr, colAttr, modelUnif, lightCF);
    ///* calculate normal matrix from ringCF */
    gl.uniform1i (useLightingUnif, true);
    //    gl.disableVertexAttribArray(colAttr);
    gl.enableVertexAttribArray(normalAttr);
    let planet1 = object_hash["planet0"]
    let planet2 = object_hash["planet4"]
    planet1Origin = vec3.fromValues(planet1.x, planet1.y, planet1.z);
     vec3.transformMat4(planet1Origin, planet1Origin, planet1.coordFrame);

    planet2Origin = vec3.fromValues(planet2.x, planet2.y, planet2.z); 
     vec3.transformMat4(planet2Origin, planet2Origin, planet2.coordFrame);


    let arr = [planet1Origin[0], planet1Origin[1], planet1Origin[2], planet2Origin[0], planet2Origin[1], planet2Origin[2]]
    //    let arr = [planet1Origin[0], planet1Origin[1], planet1Origin[2],planet1Origin[0], planet1Origin[1], planet1Origin[2]]
//    let arr = [0.1,0.1,0.1,0.1,0.1,0.1]
    gl.uniform3fv(lightPosUnif, arr);
    for(key in object_hash){
        object_hash[key].draw(posAttr, colAttr, normalAttr, modelUnif);
    }
    orbit("planet0");
    orbit("planet1");
    orbit("planet2");
    orbit("planet3");
    orbit("planet4");
    orbit("planet5");
}

function draw3D() {
    /* We must update the projection and view matrices in the shader */
    //-2,-2,-2]

    
    
    gl.uniformMatrix4fv(projUnif, false, persProjMat);
    gl.uniformMatrix4fv(viewUnif, false, viewMat);
    mat4.mul (tmpMat, viewMat, ringCF);
    mat3.normalFromMat4 (normalMat, tmpMat);
    gl.uniformMatrix3fv (normalUnif, false, normalMat);
    gl.viewport(0, 0, glCanvas.width/2, glCanvas.height);
    drawScene();
    if (typeof obj !== 'undefined') {
        gl.uniform1i(useLightingUnif, false);
        //    gl.disableVertexAttribArray(normalAttr);
        gl.enableVertexAttribArray(colAttr);
        if (showNormal)
	    obj.drawNormal(posAttr, colAttr, modelUnif, ringCF);
        if (showLightVectors)
 	    obj.drawVectorsTo(gl, lightPos, posAttr, colAttr, normalAttr, modelUnif, ringCF);
    }
}

function drawTopView() {
    let arr = [0,0,0,0,0,0]

    gl.uniform3fv(lightPosUnif, arr);

    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
    gl.uniformMatrix4fv(viewUnif, false, topViewMat);
    mat4.mul (tmpMat, topViewMat, ringCF);
    mat3.normalFromMat4 (normalMat, tmpMat);
    gl.uniformMatrix3fv (normalUnif, false, normalMat);
    gl.viewport(glCanvas.width/2, 0, glCanvas.width/2, glCanvas.height);
    drawScene();
}
