/*
 * Created by Reese & Miles Dewind 01/10/2017
 */


function ringLineFunc(subDiv, end, x, y, z){
  let line = [];

  for(i=0; i < 2; i++){
    let array = [];
    // line{point][x,y,z]
    for(index = 0; index < 2; index++){
      array[0] = end/subDiv * (i * x);
      array[1] = end/subDiv * (i * y);
      array[2] = end/subDiv * (i * z);
      line.push(array);
    }
  }
  let array = [];
  array[0] = 0;
  array[1] = 0;
  array[2] = 0;
  line.push(array);
  return line;
}

