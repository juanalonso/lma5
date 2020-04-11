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
let SNAP_MULTIPLIER = 0.02;

let dt = 0.8;
let k = new Kinematic(dt);


let jointList = {
    "leftWrist": 0.5,
    "leftElbow": 0.5,
    "leftShoulder": 0.5,
    "rightWrist": 0.5,
    "rightElbow": 0.5,
    "rightShoulder": 0.5,
};
let T = 10;
let e = new Effort(T, jointList);


function preload() {
    video = createVideo(['data/test_posenet.mp4']);
}


function setup() {

    var canvas = createCanvas(720, 480);
    canvas.parent('canvas-placeholder');

    video.volume(0);
    video.hide();

    select('#status').html('Loading model...');
    poseNet = ml5.poseNet(video, modelReady, options);
    poseNet.on('pose', function(results) {
        pose = Utils.fromPoseNet(results);
    });

    frameRate(60);

    for (let k = 0; k < e.joints.length; k++) {
        var button = createElement('button', e.alpha[k].toFixed(2) + ' * ' + e.joints[k]);
        button.attribute('data-idx', k);
        button.attribute('data-value', e.alpha[k].toFixed(2));
        button.mousePressed(updateAlpha);
        button.parent('jointlist');
    }

    select('#T').html("dt=" + dt + " T=" + T);

}


function updateAlpha() {
    let alpha = parseFloat(this.attribute('data-value')) + 0.25;
    if (alpha > 1) {
        alpha = 0;
    }
    e.updateAlpha(e.joints[this.attribute('data-idx')], alpha)
    this.attribute('data-value', alpha.toFixed(2));
    this.html(alpha.toFixed(2) + ' * ' + e.joints[this.attribute('data-idx')]);
}


function responsiveAnalogRead(newVal, smoothVal) {

    var diff = p5.Vector.sub(Utils.vectorFromKeypoint(newVal), Utils.vectorFromKeypoint(smoothVal));

    var x = smoothVal.x + diff.x * snapCurve(diff.x);
    var y = smoothVal.y + diff.y * snapCurve(diff.y);
    var z = smoothVal.z + diff.z * snapCurve(diff.z);

    return { "x": x, "y": y, "z": z };
}

var snapCurve = function(x) {
    var y = 1 / (abs(x * SNAP_MULTIPLIER) + 1);
    y = (1 - y) * 2;
    if (y > 1) {
        return 1;
    }
    return y;
};


function draw() {

    if (typeof pose !== 'undefined') {

        let keys = Object.keys(pose);

        for (let j = 0; j < keys.length; j++) {
            if (typeof smoothValue[keys[j]] === 'undefined') {
                smoothValue[keys[j]] = pose[keys[j]];
            }
            smoothValue[keys[j]] = responsiveAnalogRead(pose[keys[j]], smoothValue[keys[j]]);
        }
    }

    k.addPose(pose);

    //Kinematic
    [velocity, acceleration, jerk] = k.getKinematic();

    //Effort
    let weight = e.weight(velocity);
    let time = e.time(acceleration);
    let space = e.space(pose);
    let flow = e.flow(jerk);

    select('#weight-effort').html(weight.toFixed(2));
    select('#time-effort').html(time.toFixed(2));
    select('#space-effort').html(space.toFixed(2));
    select('#flow-effort').html(flow.toFixed(2));

    background(248);
    // image(video, 0, 0, width, height);

    if (typeof pose !== 'undefined') {
        drawAvatar(smoothValue);
        if (Object.keys(velocity).length !== 0) {
            drawKeypoints(pose, velocity);
            drawKeypoints(smoothValue, velocity);
        }
    }


}


function modelReady() {
    select('#status').html('');
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
        circle(keypoint.x, keypoint.y, max(4, v[keys[f]]));
    }
}


function drawAvatar(pose, opacity) {

    let le = Utils.vectorFromKeypoint(pose.leftEar);
    let re = Utils.vectorFromKeypoint(pose.rightEar);
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