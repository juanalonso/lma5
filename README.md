# lma5.js
### A Javascript library for realtime Laban Movement Analysis 

#### Mini project for Embodied Interaction (Sound and Music Computing, Aalborg University)

## Elevator pitch
- Written in JavaScript.
- Relies on p5.js for vector mathematics and making your life easier.
- No need for package managers.
- Only 7.5kB in size.
- OpenSource, MIT license.
- Examples included for JSON and TSV 2D and 3D data.

## lma5.js - Kinematic descriptors

The class Kinematic computes **velocity**, **acceleration** and **jerk** using the formulas proposed by Larboulette and Gibet.

The programmer can define the time interval between frames (dt) and whether to use **raw** or **smoothed** coordinates using the algorithm proposed by Clarke.

## lma5.js - Effort descriptors

The class Effort computes **Weight**, **Time**, **Space** and **Flow** using the formulas proposed by Larboulette and Gibet.

The programmer can define the number of frames (T), and the list of joints and weights used to compute the descriptors.
