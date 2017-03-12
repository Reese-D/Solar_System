/*
 * Created by Miles Dewind 01/10/2017
 */

function pointFunc(subDiv, line, special){
  // note special = and array of size 2 where the first value is a radius
  // and the second value is a persentage of that radius
  

  //circles[circle number][circle points][x,y,z]
  let circles = [[[]]];
  for(index=0; index < line.length; index++){
    for(i=0; i <= subDiv; i++){
    radius = special[0];
    if(line.length % 2 == 0){
      shrink  = radius * line.length;
    }else{
      shrink = blank;
    }
    //create the points in the circle for circles
    //format: xValues[i] = (centerX + radius * 
    //Math.cos(2 * Math.PI * i/ steps-Math.Pi)
    circles[index][i][0] = (line[index][0] + radius - shrink) *
      Math.cos(2 * Math.PI * i / subDiv); 
    circles[index][i][1] = (line[index][1] + radius  - shrink) *
      Math.sin(2 * Math.Pi * i / subDiv);
    circles[index][i][2] =  line[index][2];
    }
  }
  return circles;
}
