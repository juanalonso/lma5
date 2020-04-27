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
    "leftWrist": 1,
    "rightWrist": 1,
};
let T = 10;
let e = new Effort(T, jointList);

var vehicles = [];
var MAX_VEHICLES = 500;

function preload() {
    video = createCapture(VIDEO);
    video.hide();
    print(video);
}


function setup() {

    frameRate(60);

    var canvas = createCanvas(640, 480);
    canvas.parent('canvas-placeholder');

    select('#status').html('Loading model...');

    for (var f = 0; f < MAX_VEHICLES; f++) {
        var vehicle = new Vehicle(Math.random() * width, Math.random() * height, 5);
        vehicles.push(vehicle);
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

    background(248);
    translate(video.width, 0);
    scale(-1, 1);

    image(video, 0, 0, 96,72);

    if (typeof smoothPose !== 'undefined') {
        drawAvatar(smoothPose);
        for (var f = 0; f < MAX_VEHICLES; f++) {
            vehicles[f].target = Utils.vectorFromKeypoint(f % 2 == 0 ? smoothPose.leftWrist : smoothPose.rightWrist);
            vehicles[f].update();
            vehicles[f].draw();
        }
    }


}


function modelReady() {
    select('#status').html('');
    video.loop();
}


function drawKeypoints(p, v, opacity) {

    fill(55, opacity);
    noStroke();

    let keys = Object.keys(p);
    for (let f = 0; f < keys.length; f++) {
        if (keys[f] == "leftEar" || keys[f] == "rightEar" ||
            keys[f] == "leftEye" || keys[f] == "rightEye" ||
            keys[f] == "nose") {
            continue;
        }
        let keypoint = p[keys[f]];
        circle(keypoint.x, keypoint.y, max(4, v[keys[f]]));
    }
}


function drawAvatar(p, opacity) {

    let le = Utils.vectorFromKeypoint(p.leftEar);
    let re = Utils.vectorFromKeypoint(p.rightEar);
    let center = p5.Vector.sub(le, re).div(2).add(re);
    let angle = p5.Vector.sub(le, re).heading();

    noFill();
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
    noFill();

    push();
    translate(center.x, center.y);
    rotate(angle);
    ellipse(0, 0, le.dist(re), le.dist(re) * 1.35);
    pop();

    fill(55, opacity);
    noStroke();

    circle(p.leftEye.x, p.leftEye.y, 6);
    circle(p.rightEye.x, p.rightEye.y, 6);
}