/*
 * Created by Miles Dewind 01/10/2017
 */

function ringPointFunc(subDiv, line, special){
  // note special = and array of size 2 where the first value is
  // the radius of the inner circles, and the secon value is the
  // radius of the outer circles.  


  //circles[circle number][circle points][x,y,z]
  let circles = [];
 
  let innerRadius = special[0];
  let outerRadius = special[1];
  for(index=0; index < 4; index++){
    let circlePoints = [];
    for(i=0; i < subDiv; i++){
      let xyz = [];
      //create the points in the circle for circles
      //format: xValues[i] = (centerX + radius * 
      //Math.cos(2 * Math.PI * i/ subDiv)
      if((index % 3) == 0){
        console.log(index);
        xyz[0] = (line[index][0] + outerRadius) *
          Math.cos(2 * Math.PI * i / subDiv); 
        xyz[1] = (line[index][1] + outerRadius) *
          Math.sin(2 * Math.PI * i / subDiv);
        xyz[2] =  line[index][2];
      }else{ 
        xyz[0] = (line[index][0] + innerRadius ) *
          Math.cos(2 * Math.PI * i / subDiv); 
        xyz[1] = (line[index][1] + innerRadius) *
          Math.sin(2 * Math.PI * i / subDiv);
        xyz[2] =  line[index][2];
      } 
      circlePoints.push(xyz);
      
    }
    circles.push(circlePoints); 
  }
  
  let circlePoints = [];
  for(i=0; i < subDiv; i++){
    let xyz = [];
    xyz[0] = (line[0][0] + outerRadius) *
      Math.cos(2 * Math.PI * i / subDiv); 
    xyz[1] = (line[0][1] + outerRadius) *
      Math.sin(2 * Math.PI * i / subDiv);
    xyz[2] =  line[0][2];
    circlePoints.push(xyz);
  }
  circles.push(circlePoints); 
  
  return circles;
}
