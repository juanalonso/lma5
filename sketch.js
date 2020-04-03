let video;
let poseNet;
let poses = [];
let options = {
    imageScaleFactor: 1,
    minConfidence: 0.3,
    maxPoseDetections: 1,
    detectionType: 'single',
}

let weightJoints = ["leftWrist", "leftElbow", "leftShoulder", "rightWrist", "rightElbow", "rightShoulder"];
let weightList = [];

let timeJoints = ["leftWrist", "leftElbow", "leftShoulder", "rightWrist", "rightElbow", "rightShoulder"];
let timeTemp;

let flowJoints = ["leftWrist", "leftElbow", "leftShoulder", "rightWrist", "rightElbow", "rightShoulder"];
let flowTemp;

let T = 10;
let Tcounter = 0;

let k = new Kinematic(0.8);


function setup() {

    var canvas = createCanvas(720, 480);
    canvas.parent('canvas-placeholder');

    video = createVideo(['data/test_posenet.mp4'], videoReady);
    video.volume(0);
    video.hide();

    select('#T').html("T=" + T);
}



function draw() {

    k.addPose(poses);

    //Kinematic
    [velocity, acceleration, jerk] = k.getKinematic();

    //Effort
    let weight, time, space, flow;

    // weight = getWeight(velocity, weightJoints);
    // time = getTime(acceleration, timeJoints);
    // flow = getFlow(jerk, flowJoints);
    // Tcounter++;

    // if (Tcounter >= T) {
    //     Tcounter = 0;
    //     select('#weight-effort').html("Weight = " + weight.toFixed(2));
    //     select('#time-effort').html("Time = " + time.toFixed(2));
    //     select('#flow-effort').html("Flow = " + flow.toFixed(2));
    // }

    background(255);
    // image(video, 0, 0, width, height);

    if (poses.length > 0) {
        drawAvatar(poses[0].pose);
    }
    if (velocity.length > 0) {
        drawKeypoints(poses[0].pose, velocity);
    }

    select('#status').html(frameRate().toFixed(1));
    select('#monitor').html(JSON.stringify(velocity));
}

function getWeight(v, jointList) {

    let e = 0;
    for (let f = 0; f < jointList.length; f++) {
        e = e + 1.0 * Math.pow(v[jointList[f]], 2);
    }

    weightList.unshift(e);

    if (weightList.length > T) {
        weightList.pop();
    }


    return max(weightList);
}

function getTime(a, jointList) {

    if (typeof timeTemp === 'undefined') {
        timeTemp = {}
        for (let f = 0; f < jointList.length; f++) {
            timeTemp[jointList[f]] = 0;
        }
    }

    for (let f = 0; f < jointList.length; f++) {
        timeTemp[jointList[f]] = timeTemp[jointList[f]] + 1.0 * a[jointList[f]] / T;
    }

    let t = 0;
    if (Tcounter >= T - 1) {
        for (let f = 0; f < jointList.length; f++) {
            t = t + timeTemp[jointList[f]];
            timeTemp[jointList[f]] = 0;
        }
    }

    return t;
}

function getFlow(j, jointList) {

    if (typeof flowTemp === 'undefined') {
        flowTemp = {}
        for (let f = 0; f < jointList.length; f++) {
            flowTemp[jointList[f]] = 0;
        }
    }


    for (let f = 0; f < jointList.length; f++) {
        flowTemp[jointList[f]] = flowTemp[jointList[f]] + j[jointList[f]];
    }

    let fl = 0;
    if (Tcounter >= T - 1) {
        for (let f = 0; f < jointList.length; f++) {
            fl = fl + flowTemp[jointList[f]];
            flowTemp[jointList[f]] = 0;
        }
    }

    return fl;
}



function videoReady() {
    select('#status').html('Loading model...');
    poseNet = ml5.poseNet(video, modelReady, options);
    poseNet.on('pose', function(results) {
        poses = results;
    });
}

function modelReady() {
    select('#status').html('Go!');
    //video.time(74);
    video.loop();
}


function drawKeypoints(pose, v) {

    fill(55);
    noStroke();

    let keys = Object.keys(pose);
    for (let f = 0; f < keys.length; f++) {
        if (keys[f] == "leftEar" || keys[f] == "rightEar" ||
            keys[f] == "leftEye" || keys[f] == "rightEye" ||
            keys[f] == "nose") {
            continue;
        }
        let keypoint = pose[keys[f]];
        //if (keypoint.score > 0.2) {
        circle(keypoint.x, keypoint.y, max(4, v[keys[f]]));
        //}
    }
}

function drawAvatar(pose, opacity) {

    let le = Kinematic.vectorFromKeypoint(pose.leftEar);
    let re = Kinematic.vectorFromKeypoint(pose.rightEar);
    let center = p5.Vector.sub(le, re).div(2).add(re);
    let angle = p5.Vector.sub(le, re).heading();

    noFill();
    strokeWeight(4);
    stroke(100, 200, 100, opacity);

    curve(pose.rightShoulder.x, pose.rightShoulder.y,
        pose.leftShoulder.x, pose.leftShoulder.y,
        pose.leftHip.x, pose.leftHip.y,
        pose.rightHip.x, pose.rightHip.y);

    curve(pose.leftShoulder.x, pose.leftShoulder.y,
        pose.leftHip.x, pose.leftHip.y,
        pose.rightHip.x, pose.rightHip.y,
        pose.rightShoulder.x, pose.rightShoulder.y);

    curve(pose.leftHip.x, pose.leftHip.y,
        pose.rightHip.x, pose.rightHip.y,
        pose.rightShoulder.x, pose.rightShoulder.y,
        pose.leftShoulder.x, pose.leftShoulder.y);
    curve(
        pose.rightHip.x, pose.rightHip.y,
        pose.rightShoulder.x, pose.rightShoulder.y,
        pose.leftShoulder.x, pose.leftShoulder.y,
        pose.leftHip.x, pose.leftHip.y);



    stroke(255, 100, 100, opacity);

    curve(pose.rightWrist.x, pose.rightWrist.y,
        pose.rightWrist.x, pose.rightWrist.y,
        pose.rightElbow.x, pose.rightElbow.y,
        pose.rightShoulder.x, pose.rightShoulder.y);

    curve(pose.rightWrist.x, pose.rightWrist.y,
        pose.rightElbow.x, pose.rightElbow.y,
        pose.rightShoulder.x, pose.rightShoulder.y,
        pose.leftShoulder.x, pose.leftShoulder.y);

    curve(pose.rightElbow.x, pose.rightElbow.y,
        pose.rightShoulder.x, pose.rightShoulder.y,
        pose.leftShoulder.x, pose.leftShoulder.y,
        pose.leftElbow.x, pose.leftElbow.y);

    curve(pose.rightShoulder.x, pose.rightShoulder.y,
        pose.leftShoulder.x, pose.leftShoulder.y,
        pose.leftElbow.x, pose.leftElbow.y,
        pose.leftWrist.x, pose.leftWrist.y);

    curve(pose.leftShoulder.x, pose.leftShoulder.y,
        pose.leftElbow.x, pose.leftElbow.y,
        pose.leftWrist.x, pose.leftWrist.y,
        pose.leftWrist.x, pose.leftWrist.y);

    //
    //
    //
    curve(pose.rightAnkle.x, pose.rightAnkle.y,
        pose.rightAnkle.x, pose.rightAnkle.y,
        pose.rightKnee.x, pose.rightKnee.y,
        pose.rightHip.x, pose.rightHip.y);

    curve(pose.rightAnkle.x, pose.rightAnkle.y,
        pose.rightKnee.x, pose.rightKnee.y,
        pose.rightHip.x, pose.rightHip.y,
        pose.leftHip.x, pose.leftHip.y);

    curve(pose.rightKnee.x, pose.rightKnee.y,
        pose.rightHip.x, pose.rightHip.y,
        pose.leftHip.x, pose.leftHip.y,
        pose.leftKnee.x, pose.leftKnee.y);

    curve(pose.rightHip.x, pose.rightHip.y,
        pose.leftHip.x, pose.leftHip.y,
        pose.leftKnee.x, pose.leftKnee.y,
        pose.leftAnkle.x, pose.leftAnkle.y);

    curve(pose.leftHip.x, pose.leftHip.y,
        pose.leftKnee.x, pose.leftKnee.y,
        pose.leftAnkle.x, pose.leftAnkle.y,
        pose.leftAnkle.x, pose.leftAnkle.y);



    stroke(255, 100, 100, opacity);
    noFill();

    push();
    translate(center.x, center.y);
    rotate(angle);
    ellipse(0, 0, le.dist(re), le.dist(re) * 1.35);
    pop();

    fill(55, opacity);
    noStroke();

    circle(pose.leftEye.x, pose.leftEye.y, 6);
    circle(pose.rightEye.x, pose.rightEye.y, 6);
}