/*
 * Created by Miles Dewind 01/10/2017
 */

function cubePointFunc(subDiv, line, special){
  //special is an array in which the first value is the
  //side length, and the second value is the number of
  //times the cube is split

  //circles[square number][square points][x,y,z]
  let cubeHolder = [];
  let cube = [];
  let edgeLength = line[line.length - 1][2]; 
  let aug = edgeLength /(line.length);
  let start = -edgeLength/2;
  console.log(line);
  console.log(line.length);

  for(index=0; index < line.length; index++){
    let cubePoints = [];
    for(i=0; i < line.length + 1; i++){
      let xyz = [];
      xyz[0] = start + (i * aug)
      xyz[1] = start;
      xyz[2] = line[index][2];
      
      cubePoints.push(xyz);
    }
    for(i=1; i < line.length + 1; i++){
      let xyz = [];
      xyz[0] = -start;
      xyz[1] = start + (i * aug);
      xyz[2] = line[index][2];
      
      cubePoints.push(xyz);
    }
    for(i=1; i < line.length + 1; i++){
      let xyz = [];
      xyz[0] = -start - (i * aug);
      xyz[1] = -start;
      xyz[2] = line[index][2];
      
      cubePoints.push(xyz);
    }
    for(i=1; i < line.length + 1; i++){
      let xyz = [];
      xyz[0] = start;
      xyz[1] = -start - (i * aug);
      xyz[2] = line[index][2];
      
      cubePoints.push(xyz);
    }
    cubeHolder.push(cubePoints);
  }
  let cubePoints = [];   
  for(i=1; i < line.length + 1; i++){
    let xyz = [];
    xyz[0] = -start;
    xyz[1] = start + (i * aug);
    xyz[2] = line[line.length - 1][2];
    cubePoints.push(xyz);
  }
  cubeHolder.push(cubePoints);


  console.log(cubeHolder);
  return cubeHolder;
}
