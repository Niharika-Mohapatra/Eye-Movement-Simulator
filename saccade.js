let eye;
let fixationPoints = [];
let velocityProfile = [];
let mainSequenceData = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  eye = new EyeSystem();
}

function draw() {
  background(0);

  eye.update();
  eye.draw();

  drawMainSequenceGraph();
}

// =============================
// Eye System Class
// =============================
class EyeSystem {
  constructor() {
    this.centre = createVector(width / 2, height / 2);
    this.target = this.randomTarget();
    this.prevTarget = this.target.copy();
    this.currentPeakVelocity = 0;
    this.currentAmplitude = 0;

    // Second-order system states
    this.theta = 0;       // position (0 → 1 normalized)
    this.omega = 0;       // velocity
    this.J = 1.0;         // inertia
    this.B = 6.0;         // damping
    this.K = 25.0;        // stiffness

    this.torque = 0;
    this.t = 0;
    this.pulseDuration = 8;
    this.holdDuration = 60;
    this.saccadeActive = false;
  }

  update() {
    if (this.saccadeActive) {
      this.applyPulseStep();
      this.integrate();

      this.currentPeakVelocity = max(
        this.currentPeakVelocity,
        abs(this.omega)
      );

      velocityProfile.push(abs(this.omega));
      if (velocityProfile.length > 200) velocityProfile.shift();

      this.t++;

      // Stop when close enough
      if (this.theta >= 0.999) {
        this.saccadeActive = false;
        this.theta = 1;
        this.omega = 0;
      
        // Store main sequence point
        mainSequenceData.push({
          amplitude: this.currentAmplitude,
          peakVelocity: this.currentPeakVelocity
        });
      
        if (mainSequenceData.length > 100) {
          mainSequenceData.shift();
        }
      
        this.t = 0;
      }
    } else {
      this.t++;
      if (this.t > this.holdDuration) {
        fixationPoints.push(this.target.copy());
        if (fixationPoints.length > 10) fixationPoints.shift();

        this.prevTarget = this.target.copy();
        this.target = this.randomTarget();

        this.currentAmplitude = p5.Vector.dist(this.prevTarget, this.target);
        this.currentPeakVelocity = 0;

        this.theta = 0;
        this.omega = 0;
        this.t = 0;
        this.saccadeActive = true;
      }
    }
  }

  applyPulseStep() {
    if (this.t < this.pulseDuration) {
      this.torque = 60;   // pulse
    } else {
      this.torque = 15;   // step
    }
  }

  integrate() {
    let dt = 1.0;

    // α = (T - Bω - Kθ) / J
    let alpha = (this.torque - this.B * this.omega - this.K * this.theta) / this.J;

    this.omega += alpha * dt;
    this.theta += this.omega * dt;

    this.theta = constrain(this.theta, 0, 1.2);
  }

  draw() {
    let movement = p5.Vector.sub(this.target, this.prevTarget);
    let gaze = p5.Vector.add(this.prevTarget, movement.mult(this.theta));

    // Draw target
    noStroke();
    fill(255, 0, 0);
    ellipse(this.target.x, this.target.y, 10);

    // Draw fixation points
    fill(150, 150, 150, 120);
    for (let pt of fixationPoints) {
      ellipse(pt.x, pt.y, 8);
    }

    this.drawEye(this.centre.x, this.centre.y, gaze);
  }

  drawEye(x, y, gazePos) {
    let eyeW = 100;
    let eyeH = 70;
    let irisR = 40;
    let pupilR = 20;

    let dx = constrain(gazePos.x - x, -30, 30);
    let dy = constrain(gazePos.y - y, -20, 20);

    fill(255);
    stroke(0);
    strokeWeight(2);
    ellipse(x, y, eyeW, eyeH);

    fill(100, 60, 30);
    noStroke();
    ellipse(x + dx, y + dy, irisR);

    fill(0);
    ellipse(x + dx, y + dy, pupilR);
  }

  randomTarget() {
    return createVector(random(width), random(height));
  }
}

// =============================
// Velocity Graph
// =============================
function drawMainSequenceGraph() {
  let graphX = width - 300;
  let graphY = height - 200;
  let graphW = 250;
  let graphH = 150;

  push();
  translate(graphX, graphY);

  stroke(255);
  fill(0);
  rect(0, 0, graphW, graphH);

  // Find scaling
  let maxAmp = 1;
  let maxVel = 1;

  for (let d of mainSequenceData) {
    maxAmp = max(maxAmp, d.amplitude);
    maxVel = max(maxVel, d.peakVelocity);
  }

  // Plot points
  noStroke();
  fill(0, 255, 0);

  for (let d of mainSequenceData) {
    let x = map(d.amplitude, 0, maxAmp, 0, graphW);
    let y = map(d.peakVelocity, 0, maxVel, graphH, 0);
    ellipse(x, y, 5, 5);
  }

  // Labels
  fill(255);
  textSize(12);
  text("Amplitude", graphW / 2 - 30, graphH + 20);

  push();
  translate(-30, graphH / 2);
  rotate(-HALF_PI);
  text("Peak Velocity", 0, 0);
  pop();

  pop();
}






