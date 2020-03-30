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

let logButton;
//let playFrom = 140.6;

let maxPoses = 10;
let poseList = [];

let dt = 0.8;
let T = 10;
let Tcounter = 0;


function setup() {

    var canvas = createCanvas(720, 480);
    canvas.parent('canvas-placeholder');

    //video = createVideo(['data/Franco Battiato - La stagione dell\'amore - 360.mp4'], videoReady);
    video = createVideo(['data/test_posenet.mp4'], videoReady);
    //video.onended(videoEnded);
    video.volume(0);
    video.hide();

    var logButton = createButton('log');
    logButton.mousePressed(logPose);
    logButton.parent('button-placeholder');

    select('#T').html("T=" + T);
}



function draw() {

    let fps = frameRate();

    if (poses.length > 0) {
        delete poses[0].pose.keypoints;
        poseList.unshift(poses[0].pose);
    }

    if (poseList.length > maxPoses) {
        poseList.pop();
    }

    //Kinematic
    let velocity, acceleration, jerk;

    //Effort
    let weight, time, space, flow;

    if (poseList.length >= 5) {
        [velocity, acceleration, jerk] = getVAJ();
        weight = getWeight(velocity, weightJoints);
        Tcounter++;
    }

    if (Tcounter >= T) {
        Tcounter = 0;
        select('#weight-effort').html("Weight = " + weight.toFixed(2));
    }

    background(255);
    // image(video, 0, 0, width, height);
    for (let f = 0; f < min(poseList.length, 1); f++) {
        drawBezier(poseList[f], map(f, 0, maxPoses - 1, 255, 15));
        drawKeypoints(poseList[f], map(f, 0, maxPoses - 1, 255, 15), velocity);
    }

    select('#status').html(fps.toFixed(1));
    if (typeof velocity !== 'undefined') {
        select('#monitor').html(JSON.stringify(velocity));
    }
}



function vectorFromKeypoint(kp) {
    return createVector(kp.x, kp.y);
}

function getVAJ() {

    let keys = Object.keys(poseList[0]);
    let v = {}
    let a = {}
    let j = {}

    for (let f = 0; f < keys.length; f++) {
        if (keys[f] == "score") {
            continue;
        }

        let xt0 = vectorFromKeypoint(poseList[0][keys[f]]);
        let xt1 = vectorFromKeypoint(poseList[1][keys[f]]);
        let xt2 = vectorFromKeypoint(poseList[2][keys[f]]);
        let xt3 = vectorFromKeypoint(poseList[3][keys[f]]);
        let xt4 = vectorFromKeypoint(poseList[4][keys[f]]);

        v[keys[f]] = p5.Vector.sub(xt1, xt3).div(dt * 2).mag();
        a[keys[f]] = p5.Vector.sub(xt1, xt2).sub(xt2).add(xt3).div(dt * dt).mag();
        j[keys[f]] = p5.Vector.sub(xt0, xt1).sub(xt1).add(xt3).add(xt3).sub(xt4).div(2 * dt * dt * dt).mag();
    }
    return [v, a, j];
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



function videoReady() {
    select('#status').html('Loading model...');
    poseNet = ml5.poseNet(video, modelReady, options);
    poseNet.on('pose', function(results) {
        poses = results;
    });
}

function modelReady() {
    select('#status').html('Go!');
    //video.play().time(playFrom);
    video.loop();
}

// function videoEnded() {
//     video.play().time(playFrom);
// }

function logPose() {
    if (poseList.length > 0) {
        select('#monitor').html(JSON.stringify(poseList[0]));
    }
}



function drawKeypoints(pose, opacity, v) {

    fill(55, opacity);
    noStroke();

    let keys = Object.keys(pose);
    for (let f = 0; f < keys.length; f++) {
        if (keys[f] == "score" ||
            keys[f] == "leftEar" || keys[f] == "rightEar" ||
            keys[f] == "leftEye" || keys[f] == "rightEye" ||
            keys[f] == "nose") {
            continue;
        }
        let keypoint = pose[keys[f]];
        //if (keypoint.score > 0.2) {
        //circle(keypoint.x, keypoint.y, 6, 6);
        if (typeof v !== 'undefined') {
            circle(keypoint.x, keypoint.y, max(4, v[keys[f]]));
        }
        //}
    }

    circle(pose.leftEye.x, pose.leftEye.y, 6);
    circle(pose.rightEye.x, pose.rightEye.y, 6);
    //circle(pose.nose.x, pose.nose.y, 6);

    let le = vectorFromKeypoint(pose.leftEar);
    let re = vectorFromKeypoint(pose.rightEar);
    let center = p5.Vector.sub(le, re).div(2).add(re);
    //center;

    stroke(255, 100, 100, opacity);
    noFill();

    //circle(center.x, center.y, le.dist(re));
    ellipse(center.x, center.y, le.dist(re), le.dist(re) * 1.35);
}

function drawBezier(pose, opacity) {

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
    strokeWeight(4);
    noFill();

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
}

function drawSkeleton() {
    stroke(255);
    strokeWeight(1);
    let skeleton = poses[0].skeleton;
    for (let f = 0; f < skeleton.length; f++) {
        let partA = skeleton[f][0];
        let partB = skeleton[f][1];
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
}