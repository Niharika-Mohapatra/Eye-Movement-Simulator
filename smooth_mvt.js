let eyeCentres = [];
let pupilOffset;
let targetPos, prevTargetPos;
let t = 0;
let pursuitGain = 0.6;
let deadZoneRadius = 80;

let fixationPoints = [];
let velocityProfile = [];
const velocityHistoryLength = 200;

function setup() {
  createCanvas(windowWidth, windowHeight);
  let offset = 60; // or whatever you're using
  eyeCentres.push(createVector(width / 2 - offset, height / 2)); // left
  eyeCentres.push(createVector(width / 2 + offset, height / 2)); // right

  pupilOffset = createVector(0, 0);
  targetPos = createVector(0, 0);
  prevTargetPos = createVector(0, 0);
}

function draw() {
  background(0);
  t += 0.04;

  // Moving red dot
  let x = width / 2 + 300 * sin(t);
  let y = height * 0.7;
  prevTargetPos.set(targetPos);
  targetPos.set(x, y);

  // Save trail/fixation points
  fixationPoints.push(targetPos.copy());
  if (fixationPoints.length > 10) {
    fixationPoints.shift();
  }

  // Dot velocity
  let vel = p5.Vector.sub(targetPos, prevTargetPos);

  // Track gaze velocity magnitude
  velocityProfile.push(vel.mag());
  if (velocityProfile.length > velocityHistoryLength) {
    velocityProfile.shift();
  }

  // Draw fixation trail
  fill(150, 150, 150, 120);
  noStroke();
  for (let i = 0; i < fixationPoints.length - 1; i++) {
    let pt = fixationPoints[i];
    ellipse(pt.x, pt.y, 8, 8);
  }

  // Draw red dot
  fill(255, 0, 0);
  noStroke();
  ellipse(targetPos.x, targetPos.y, 14, 14);

  // Eye movement
  let midEye = p5.Vector.add(eyeCentres[0], eyeCentres[1]).div(2);
  let toTarget = p5.Vector.sub(targetPos, midEye);
  let distanceToTarget = toTarget.mag();

  if (distanceToTarget > deadZoneRadius && vel.dot(toTarget) > 0) {
    pupilOffset.add(p5.Vector.mult(vel, pursuitGain));
  }

  // Limit pupil motion
  pupilOffset.x = constrain(pupilOffset.x, -30, 30);
  pupilOffset.y = constrain(pupilOffset.y, -20, 20);


  for (let i = 0; i < eyeCentres.length; i++) {
    drawEye(eyeCentres[i].x, eyeCentres[i].y, pupilOffset);  
  }
  

  drawVelocityGraph();
}

function drawEye(x, y, offset) {
  let eyeWidth = 120;
  let eyeHeight = 80;
  let irisRadius = 45;
  let pupilRadius = 20;

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

  // Background and axis
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
    let y = map(velocityProfile[i], 0, 20, graphH, 0); // Adjust scaling as needed
    vertex(x, y);
  }
  endShape();

  // Labels
  noStroke();
  fill(255);
  textSize(12);
  text("Velocity Profile", 10, -10);
  pop();
}
