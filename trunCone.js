/*
 * Created by Miles Dewind 01/10/2017
 */

function conePointFunc(subDiv, line, special){
  // note special = and array of size 2 where the first value is a radius
  // and the second value is a persentage of that radius
   
  console.log("line length: " +  line.length);
  console.log("special: " +  special[0] + " and  " + special[1]);
  //circles[circle number][circle points][x,y,z]
  let circles = [];
  for(index=0; index < line.length; index++){
    console.log(line[index]);
    let circlePoints = [];
    for(i=0; i < subDiv; i++){
      let radius = special[0];
      let shrink  = (radius * special[1]) / line.length;
      //let shrink = 0;
      //console.log(shrink);
      let xyz = [];
  
      //create the points in the circle for circles
      //format: xValues[i] = (centerX + radius * 
      //Math.cos(2 * Math.PI * i/ steps-Math.Pi)
      xyz[0] = (line[index][0] + radius - (shrink * (index + 1))) *
        Math.cos(2 * Math.PI * i / subDiv); 
      xyz[1] = (line[index][1] + radius  - (shrink * (index + 1))) *
        Math.sin(2 * Math.PI * i / subDiv);
      xyz[2] =  line[index][2];
      circlePoints.push(xyz);
    }
    circles.push(circlePoints); 
  }
  console.log(circles);
  return circles;
}
