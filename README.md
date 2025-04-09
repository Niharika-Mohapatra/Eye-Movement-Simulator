# Eye Movement Simulation

This visualization demonstrates two major types of human eye movements:

* **Smooth Pursuit**: where the eyes smoothly track a moving target.

* **Saccades**: rapid, jerky movements the eye makes to shift focus between points.

Built with p5.js. 

## Why do eye movements matter?
Our eyes are constantly moving even when we think we're staring at something still. These movements are crucial for gathering visual information and for how we perceive the world.

Saccades are rapid, ballistic jumps the eye makes when shifting focus from one object to another. Fixations occur when the eye focuses on a target where visual information is actually gathered. These two movements help the eye gather integrated visual information needed for scanning an environment or reading. This is the most common form of eye movement for humans

In contrast, we have smooth pursuit in which the eye moves smoothly and uniformly. This is used to track moving objects (in fact smooth pursuit cannot be performed without a moving target).

Understanding these movements helps in fields like vision science, cognitive neuroscience, and clinical diagnosis (e.g., tracking disorders, concussions, or neurological diseases).

## How does this project simulate real eye movements?

### Saccadic model:

### Smooth Pursuit model:
This simulation models basic eye behavior using vector math and physics-inspired logic. 

The red dot moves with a smooth, sine-wave trajectory.

The eyes (pupils) only follow when:
* The target is far enough away from gaze (dead zone)

* The target is moving in a direction that justifies pursuit

### What does the graph reveal?

These approximations allow users to intuitively understand how our visual system balances precision, delay, and effort when tracking moving objects.

* Green Line (Target Velocity): A continuous sine wave, representing the consistent motion of the stimulus.

* Blue Line (Pupil Velocity): Step-like changes in velocity that occur only when the system deems pursuit necessary.

This stepped profile captures the all-or-nothing nature of biological smooth pursuit. The eyes don’t constantly follow, they wait until the target moves too far or fast, then "snap" to catch up.

## Features:
Visual simulation of eye tracking behavior.

Custom-coded models for:

* Smooth pursuit using velocity-based motion and pursuit gain.
* Saccades using biologically inspired velocity profiles (minimum jerk).

Visual graphs:

* Velocity over time
* Amplitude vs. duration of saccades. 

Tech Stack:
* p5.js
* HTML5 Canvas
* Javascript

## View Online:
You can view the simulation here:
https://niharika-mohapatra.github.io/Eye-Movement-Simulator/

## Background:
This project was created to visualize oculomotor behavior as part of a cognitive science project. The models are simplified but grounded in the neurophysiology of eye movement.
