// Global variables
let eyeCentres = [];
let pupilOffset;
let targetPos, prevTargetPos;
let saccadeActive = false;
let t = 0;
let saccadeDuration = 0;
let holdDuration = 60;
let velocityProfile = [];
let fixationPoints = [];
let mainSequenceData = [];

// Sets up the canvas, runs once in the beginning
function setup() {
  createCanvas(windowWidth, windowHeight);
  let offset = 60; // Horizontal offset between eyes
  eyeCentres = [
    createVector(width / 2 - offset, height / 2), // Left eye centre
    createVector(width / 2 + offset, height / 2)  // Right eye centre
  ];

  targetPos = createVector(random(width), random(height)); // Initial target
  prevTargetPos = targetPos.copy(); // Stores previous position for comparison
  pupilOffset = createVector(0, 0);
}

// Runs every frame
function draw() {
  background(0);

  if (saccadeActive) {
    // Saccade
    let progress = t / saccadeDuration; // Normalized
    if (progress >= 1) {
      // Saccade finished
      prevTargetPos = targetPos.copy();
      saccadeActive = false;
      t = 0;
    } else {
      // Animate piupil with minimum jerk
      let jerkAmt = minJerk(progress);
      pupilOffset = p5.Vector.sub(targetPos, prevTargetPos).mult(jerkAmt);

      // Estimate velocity
      let deltaProgress = minJerk(progress + 0.01) - jerkAmt;
      let velocity = p5.Vector.sub(targetPos, prevTargetPos).mult(deltaProgress).mag();
      velocityProfile.push(velocity);
      if (velocityProfile.length > 200) velocityProfile.shift();

      t++;
    }
  } else {
    // Fixation
    t++;
    if (t >= holdDuration) {
      fixationPoints.push(prevTargetPos.copy());
      if (fixationPoints.length > 10) fixationPoints.shift();

      // Select new target
      prevTargetPos = targetPos.copy();
      targetPos = createVector(random(width), random(height));

      // Determine saccade duration 
      let distance = p5.Vector.dist(prevTargetPos, targetPos);
      saccadeDuration = floor(2.2 * (distance / 100) + 21); 
      mainSequenceData.push({ amplitude: distance, duration: saccadeDuration });
      if (mainSequenceData.length > 100) mainSequenceData.shift();

      t = 0;
      saccadeActive = true;
    }
  }

  // Draw target
  noStroke();
  fill(255, 0, 0);
  ellipse(targetPos.x, targetPos.y, 10, 10);

  // Draw eyes
  for (let centre of eyeCentres) {
    drawEye(centre.x, centre.y, p5.Vector.add(centre, pupilOffset));
  }

  // Past fixation points
  noStroke();
  fill(150, 150, 150, 120);
  for (let pt of fixationPoints) {
    ellipse(pt.x, pt.y, 8, 8);
  }

  drawMainSequenceGraph();
  drawVelocityGraph();
}

// Minimum jerk trajectory
function minJerk(p) {
  return 10 * pow(p, 3) - 15 * pow(p, 4) + 6 * pow(p, 5);
}

function drawEye(x, y, gazePos) {
  let eyeWidth = 90;
  let eyeHeight = 60;
  let irisRadius = 40;
  let pupilRadius = 20;

  let irisLimitX = (eyeWidth / 2) - (irisRadius / 2);
  let irisLimitY = (eyeHeight / 2) - (irisRadius / 2);

  // Constrains pupil within eyeball
  let dx = constrain(gazePos.x - x, -irisLimitX, irisLimitX);
  let dy = constrain(gazePos.y - y, -irisLimitY, irisLimitY);

  // Eyeballs
  fill(255);
  stroke(0);
  strokeWeight(2);
  ellipse(x, y, eyeWidth, eyeHeight);

  // Iris
  fill(100, 60, 30);
  noStroke();
  ellipse(x + dx, y + dy, irisRadius, irisRadius);

  // Pupil
  fill(0);
  ellipse(x + dx, y + dy, pupilRadius, pupilRadius);
}

// Plotting pupil velocity
function drawVelocityGraph() {
  push();
  translate(20, height - 120);

  noFill();
  stroke(0, 150, 255);
  beginShape();
  for (let i = 0; i < velocityProfile.length; i++) {
    vertex(i, -velocityProfile[i] * 10);
  }
  endShape();

  stroke(255);
  line(0, 0, 200, 0);
  noStroke();
  fill(255);
  text("Pupil Velocity", 0, -10);

  pop();
}

// Plotting duration vs amplitude graph
function drawMainSequenceGraph() {
  const N = 50;
  let graphX = width - 300;
  let graphY = height - 200;
  let graphW = 250;
  let graphH = 150;

  push();
  translate(graphX, graphY);
  fill(0);
  stroke(255);
  rect(0, 0, graphW, graphH);

  fill(255);
  noStroke();
  textSize(12);
  text("Amplitude (px)", graphW / 2 - 30, graphH + 20);
  push();
  translate(-30, graphH / 2);
  rotate(-HALF_PI);
  text("Duration (frames)", 0, 0);
  pop();

  stroke(100);
  textSize(10);
  for (let x = 0; x <= graphW; x += 50) {
    line(x, 0, x, graphH);
    text(x, x - 10, graphH + 12);
  }
  for (let y = 0; y <= graphH; y += 30) {
    line(0, y, graphW, y);
    text((graphH - y), -25, y + 4);
  }

  noFill();
  stroke(0, 255, 0);
  let maxAmp = 0, maxDur = 0;
  for (let i = 0; i < mainSequenceData.length; i++) {
    maxAmp = max(maxAmp, mainSequenceData[i].amplitude);
    maxDur = max(maxDur, mainSequenceData[i].duration);
  }
  maxAmp = max(maxAmp, 100);
  maxDur = max(maxDur, 10);

  for (let i = max(0, mainSequenceData.length - N); i < mainSequenceData.length; i++) {
    let { amplitude, duration } = mainSequenceData[i];
    let px = map(amplitude, 0, maxAmp, 0, graphW);
    let py = map(duration, 0, maxDur, graphH, 0);
    ellipse(px, py, 4, 4);
  }
  pop();
}





