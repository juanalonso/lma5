let video;
let poseNet;
let poses = [];
let options = {
    imageScaleFactor: 1,
    minConfidence: 0.3,
    maxPoseDetections: 1,
    detectionType: 'single',
}

let logButton;
//let playFrom = 140.6;

let maxPoses = 10;
let poseList = [];



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

    let v, a, j;

    if (poseList.length >= 5) {
        v = getVelocity(fps);
        select('#monitor').html(JSON.stringify(v));

        //select('#monitor').html(JSON.stringify(v));
        //a = getAcceleration(fps);
        //j = getJerk(fps);
    }

    background(255);
    // image(video, 0, 0, width, height);
    for (let f = 0; f < min(poseList.length, 1); f++) {
        drawBezier(poseList[f], map(f, 0, maxPoses - 1, 255, 15));
        drawKeypoints(poseList[f], map(f, 0, maxPoses - 1, 255, 15));
    }

    select('#status').html(fps);
}



function getVelocity(fps) {

    let realFPS = 1;
    let dt2 = 2 / realFPS;

    let keys = Object.keys(poseList[0]);
    let v = {}

    for (let f = 0; f < keys.length; f++) {
        if (keys[f] == "score") {
            continue;
        }
        let kpv = Math.sqrt(Math.pow((poseList[1][keys[f]].x - poseList[3][keys[f]].x) / dt2, 2) +
            Math.pow((poseList[1][keys[f]].y - poseList[3][keys[f]].y) / dt2, 2));
        v[keys[f]] = kpv;
    }
    return v;

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



function drawKeypoints(pose, opacity) {

    fill(55, opacity);
    noStroke();

    let keys = Object.keys(pose);
    for (let f = 0; f < keys.length; f++) {
        if (keys[f] == "score") {
            continue;
        }
        let keypoint = pose[keys[f]];
        //if (keypoint.score > 0.2) {
        ellipse(keypoint.x, keypoint.y, 6, 6);
        //}
    }
}

function drawBezier(pose, opacity) {

    noFill();

    strokeWeight(4);
    stroke(100, 255, 100, opacity);

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