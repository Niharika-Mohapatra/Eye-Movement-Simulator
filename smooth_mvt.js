let eyeCentres = [];
let pupilOffset;
let targetPos, prevTargetPos;
let t = 0;
let pursuitGain = 0.6;
let deadZoneRadius = 80;

let fixationPoints = [];
let velocityProfile = [];
let pupilVelocityProfile = [];
let prevPupilOffset;
const velocityHistoryLength = 200;

function setup() {
  createCanvas(windowWidth, windowHeight);
  let offset = 60; 
  eyeCentres.push(createVector(width / 2 - offset, height / 2));
  eyeCentres.push(createVector(width / 2 + offset, height / 2)); 

  pupilOffset = createVector(0, 0);
  prevPupilOffset = pupilOffset.copy();
  targetPos = createVector(0, 0);
  prevTargetPos = createVector(0, 0);
}

function draw() {
  background(0);
  t += 0.04;

  let x = width / 2 + 300 * sin(t);
  let y = height * 0.7;
  prevTargetPos.set(targetPos);
  targetPos.set(x, y);

  
  fixationPoints.push(targetPos.copy());
  if (fixationPoints.length > 10) {
    fixationPoints.shift();
  }
  
  let pupilVel = p5.Vector.sub(pupilOffset, prevPupilOffset);
  pupilVelocityProfile.push(pupilVel.mag());
  if (pupilVelocityProfile.length > velocityHistoryLength) {
    pupilVelocityProfile.shift();
  }
  prevPupilOffset = pupilOffset.copy();

  let vel = p5.Vector.sub(targetPos, prevTargetPos);

  velocityProfile.push(vel.mag());
  if (velocityProfile.length > velocityHistoryLength) {
    velocityProfile.shift();
  }

  fill(150, 150, 150, 120);
  noStroke();
  for (let i = 0; i < fixationPoints.length - 1; i++) {
    let pt = fixationPoints[i];
    ellipse(pt.x, pt.y, 8, 8);
  }

  fill(255, 0, 0);
  noStroke();
  ellipse(targetPos.x, targetPos.y, 14, 14);

  let midEye = p5.Vector.add(eyeCentres[0], eyeCentres[1]).div(2);
  let toTarget = p5.Vector.sub(targetPos, midEye);
  let distanceToTarget = toTarget.mag();

  if (distanceToTarget > deadZoneRadius && vel.dot(toTarget) > 0) {
    pupilOffset.add(p5.Vector.mult(vel, pursuitGain));
  }

  pupilOffset.x = constrain(pupilOffset.x, -30, 30);
  pupilOffset.y = constrain(pupilOffset.y, -20, 20);


  for (let i = 0; i < eyeCentres.length; i++) {
    drawEye(eyeCentres[i].x, eyeCentres[i].y, pupilOffset);  
  }
  
  drawVelocityGraph();
}

function drawEye(x, y, offset) {
  let eyeWidth = 90;
  let eyeHeight = 60;
  let irisRadius = 40;
  let pupilRadius = 20;

  let maxOffsetX = (eyeWidth - irisRadius) / 2;
  let maxOffsetY = (eyeHeight - irisRadius) / 2;

  pupilOffset.x = constrain(pupilOffset.x, -maxOffsetX, maxOffsetX);
  pupilOffset.y = constrain(pupilOffset.y, -maxOffsetY, maxOffsetY);

  fill(255);
  stroke(0);
  strokeWeight(2);
  ellipse(x, y, eyeWidth, eyeHeight);

  noStroke();
  fill(100, 60, 30);
  ellipse(x + offset.x, y + offset.y, irisRadius, irisRadius);

  fill(0);
  ellipse(x + offset.x, y + offset.y, pupilRadius, pupilRadius);
}

function drawVelocityGraph() {
  push();
  let graphX = 20;
  let graphY = height - 140;
  let graphW = 200;
  let graphH = 100;

  translate(graphX, graphY);

  
  fill(20);
  stroke(255);
  rect(0, 0, graphW, graphH);
  stroke(255);
  line(0, graphH / 2, graphW, graphH / 2);

  noFill();
  stroke(0, 255, 0);
  beginShape();
  for (let i = 0; i < velocityProfile.length; i++) {
    let x = map(i, 0, velocityHistoryLength, 0, graphW);
    let y = map(velocityProfile[i], 0, 20, graphH, 0);
    vertex(x, y);
  }
  endShape();
 
  noFill();
  stroke(0, 150, 255);
  beginShape();
  for (let i = 0; i < pupilVelocityProfile.length; i++) {
    let x = map(i, 0, velocityHistoryLength, 0, graphW);
    let y = map(pupilVelocityProfile[i], 0, 20, graphH, 0);
    vertex(x, y);
  }
  endShape();

  noStroke();
  fill(0, 255, 0);
  text("Target", 10, graphH + 15);
  fill(0, 150, 255);
  text("Pupil", 70, graphH + 15);
}
