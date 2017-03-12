/*
 * Created by Reese & Miles Dewind 01/10/2017
 */


function lineFunc(subDiv, end, x, y, z){
  let line = [];

  for(i=0; i < subDiv; i++){
    let array = [];
    // line{point][x,y,z]
    array[0] = end/subDiv * (i * x);
    array[1] = end/subDiv * (i * y);
    array[2] = end/subDiv * (i * z);
    line.push(array);
  }
  
  return line;
}

