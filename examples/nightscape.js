let video;
let poseNet;
let pose;
let options = {
    imageScaleFactor: 1,
    minConfidence: 0.3,
    maxPoseDetections: 1,
    detectionType: 'single',
}


let smoothValue = {};

let dt = 0.8;
let k = new Kinematic(dt);


let jointList = {
    "leftWrist": 0,
    "rightWrist": 1,
};
let T = 20;
let e = new Effort(T, jointList);


//Fireflies
var MAX_FIREFLIES = 10;
var fireflies = [];


//Moths
var MAX_MOTHS = 10;
var moths = [];

var hasLight = false;
var lightRadius = 25;
var lightBounce = 3;
var lightCounter = 0;
var dangerDistance = 75;

//Owls
var MAX_OWLS = 1;
var owls = [];



function preload() {
    video = createCapture(VIDEO);
    video.hide();
}


function setup() {

    frameRate(60);

    var canvas = createCanvas(640, 480);
    canvas.parent('canvas-placeholder');

    select('#status').html('Loading model...');

    for (var f = 0; f < MAX_FIREFLIES; f++) {
        var firefly = new Vehicle(random(width), random(height),
            random(1, 2),
            random(0.05, 0.5),
            random(2, 4),
            color(random(120, 220), 255, random(60, 80)),
            false);
        fireflies.push(firefly);
    }

    for (var f = 0; f < MAX_MOTHS; f++) {
        var moth = new Vehicle(random(width), random(height),
            random(5, 7),
            random(0.5, 1),
            random(8, 12),
            color(random(150, 190)),
            false);
        moths.push(moth);
    }

    for (var f = 0; f < MAX_OWLS; f++) {
        var owl = new Vehicle(random(width), random(height),
            random(5, 7),
            random(0.5, 1),
            50,
            color(255),
            true);
        owls.push(owl);
    }

    poseNet = ml5.poseNet(video, modelReady, options);
    poseNet.on('pose', function(results) {
        pose = Utils.fromPoseNet(results);
    });

}


function draw() {

    let smoothPose = k.addPose(pose);

    //Kinematic
    [velocity, acceleration, jerk] = k.getKinematic();

    //Effort
    let weight = e.weight(velocity);
    let time = e.time(acceleration);
    let space = e.space(smoothPose);
    let flow = e.flow(jerk);

    select('#weight-effort').html(weight.toFixed(2));
    select('#time-effort').html(time.toFixed(2));
    select('#space-effort').html(space.toFixed(2));
    select('#flow-effort').html(flow.toFixed(2));

    background('#101020');
    translate(video.width, 0);
    scale(-1, 1);

    image(video, 0, 0, 96, 72);

    if (typeof smoothPose !== 'undefined') {

        if (lightCounter > 0) {
            lightCounter--;
        }
        
        // for (o of owls) {
        //     o.applyForce(o.wander().mult(0.5));
        //     o.applyForce(o.arrive(createVector(width-75,50),150));
        //     o.applyForce(o.bounce());
        //     o.update();
        //     o.draw();
        // }

        drawAvatar(smoothPose);
        for (f of fireflies) {
            f.applyForce(f.wander());
            f.applyForce(f.bounce());
            f.update();
            f.draw();
        }

        let rightWristVector = Utils.vectorFromKeypoint(smoothPose.rightWrist);

        for (m of moths) {
            if (!hasLight) {
                let fleeForce = m.flee(rightWristVector, dangerDistance);
                if (fleeForce.x == 0 && fleeForce.y == 0) {
                    //Not fleeing, just wandering around
                    m.applyForce(m.wander().mult(5));
                } else {
                    //No wandering, just fleeing
                    m.applyForce(fleeForce.mult(15));
                }
            } else {
                m.applyForce(m.wander().mult(1.2));
                m.applyForce(m.seek(rightWristVector).mult(1.5));
            }
            m.applyForce(m.bounce());

            //m.applyForce(m.flee(Utils.vectorFromKeypoint(smoothPose.leftWrist),100).mult(50));
            //m.applyForce(m.flee(Utils.vectorFromKeypoint(smoothPose.rightWrist),100).mult(50));
            m.update();
            m.draw();
        }

        if (time > 80 && flow > 80 && lightCounter <= 0) {
            hasLight = !hasLight;
            lightCounter = lightBounce * T;
        }

    }

}


function modelReady() {
    select('#status').html('');
    video.loop();
}


function drawAvatar(p, opacity) {

    let le = Utils.vectorFromKeypoint(p.leftEar);
    let re = Utils.vectorFromKeypoint(p.rightEar);
    let center = p5.Vector.sub(le, re).div(2).add(re);
    let angle = p5.Vector.sub(le, re).heading();

    fill('#e0e0e0');
    strokeWeight(4);
    stroke(100, 200, 100, opacity);

    curve(p.rightShoulder.x, p.rightShoulder.y,
        p.leftShoulder.x, p.leftShoulder.y,
        p.leftHip.x, p.leftHip.y,
        p.rightHip.x, p.rightHip.y);

    curve(p.leftShoulder.x, p.leftShoulder.y,
        p.leftHip.x, p.leftHip.y,
        p.rightHip.x, p.rightHip.y,
        p.rightShoulder.x, p.rightShoulder.y);

    curve(p.leftHip.x, p.leftHip.y,
        p.rightHip.x, p.rightHip.y,
        p.rightShoulder.x, p.rightShoulder.y,
        p.leftShoulder.x, p.leftShoulder.y);
    curve(
        p.rightHip.x, p.rightHip.y,
        p.rightShoulder.x, p.rightShoulder.y,
        p.leftShoulder.x, p.leftShoulder.y,
        p.leftHip.x, p.leftHip.y);

    stroke('#e0e0e0');
    beginShape();
    vertex(p.rightShoulder.x, p.rightShoulder.y);
    vertex(p.leftShoulder.x, p.leftShoulder.y);
    vertex(p.leftHip.x, p.leftHip.y);
    vertex(p.rightHip.x, p.rightHip.y);
    endShape(CLOSE);


    noFill()
    stroke(255, 100, 100, opacity);

    curve(p.rightWrist.x, p.rightWrist.y,
        p.rightWrist.x, p.rightWrist.y,
        p.rightElbow.x, p.rightElbow.y,
        p.rightShoulder.x, p.rightShoulder.y);

    curve(p.rightWrist.x, p.rightWrist.y,
        p.rightElbow.x, p.rightElbow.y,
        p.rightShoulder.x, p.rightShoulder.y,
        p.leftShoulder.x, p.leftShoulder.y);

    curve(p.rightElbow.x, p.rightElbow.y,
        p.rightShoulder.x, p.rightShoulder.y,
        p.leftShoulder.x, p.leftShoulder.y,
        p.leftElbow.x, p.leftElbow.y);

    curve(p.rightShoulder.x, p.rightShoulder.y,
        p.leftShoulder.x, p.leftShoulder.y,
        p.leftElbow.x, p.leftElbow.y,
        p.leftWrist.x, p.leftWrist.y);

    curve(p.leftShoulder.x, p.leftShoulder.y,
        p.leftElbow.x, p.leftElbow.y,
        p.leftWrist.x, p.leftWrist.y,
        p.leftWrist.x, p.leftWrist.y);

    //
    //
    //
    curve(p.rightAnkle.x, p.rightAnkle.y,
        p.rightAnkle.x, p.rightAnkle.y,
        p.rightKnee.x, p.rightKnee.y,
        p.rightHip.x, p.rightHip.y);

    curve(p.rightAnkle.x, p.rightAnkle.y,
        p.rightKnee.x, p.rightKnee.y,
        p.rightHip.x, p.rightHip.y,
        p.leftHip.x, p.leftHip.y);

    curve(p.rightKnee.x, p.rightKnee.y,
        p.rightHip.x, p.rightHip.y,
        p.leftHip.x, p.leftHip.y,
        p.leftKnee.x, p.leftKnee.y);

    curve(p.rightHip.x, p.rightHip.y,
        p.leftHip.x, p.leftHip.y,
        p.leftKnee.x, p.leftKnee.y,
        p.leftAnkle.x, p.leftAnkle.y);

    curve(p.leftHip.x, p.leftHip.y,
        p.leftKnee.x, p.leftKnee.y,
        p.leftAnkle.x, p.leftAnkle.y,
        p.leftAnkle.x, p.leftAnkle.y);



    stroke(255, 100, 100, opacity);
    fill('#e0e0e0');

    push();
    translate(center.x, center.y);
    rotate(angle);
    ellipse(0, 0, le.dist(re), le.dist(re) * 1.35);
    pop();

    fill(55, opacity);
    noStroke();

    circle(p.leftEye.x, p.leftEye.y, 6);
    circle(p.rightEye.x, p.rightEye.y, 6);

    if (hasLight) {
        fill(255, 255, 150, 100)
        circle(p.rightWrist.x, p.rightWrist.y, lightRadius * 1.5 * 2)
        fill(255, 255, 150, 150)
        circle(p.rightWrist.x, p.rightWrist.y, lightRadius * 2)
        fill(255, 255, 255)
        circle(p.rightWrist.x, p.rightWrist.y, lightRadius / 2)
    }
}