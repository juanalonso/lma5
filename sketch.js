let video;
let poseNet;
let poses = [];
let options = {
    imageScaleFactor: 1,
    minConfidence: 0.3
}

let logButton;
let playFrom = 140.6;



function setup() {

    createCanvas(480, 360);
    video = createVideo(['data/Franco Battiato - La stagione dell\'amore - 360.mp4'], videoReady);
    //video.onended(videoEnded);
    video.volume(0);
    video.hide();

    logButton = createButton('log');
    logButton.mousePressed(logPose);

}



function draw() {
    background(255);
    //image(video, 0, 0, width, height);
    if (poses.length > 0) {
        //drawSkeleton(poses);
        drawKeypoints(poses);
        drawBezier(poses);
    }
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
    if (poses.length > 0) {
        console.log(poses[0]);
    }
}



function drawKeypoints() {
    fill(255);
    stroke(20);
    strokeWeight(4);
    let pose = poses[0].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
        let keypoint = pose.keypoints[j];
        if (keypoint.score > 0.2) {
            ellipse(round(keypoint.position.x), round(keypoint.position.y), 8, 8);
        }
    }
}



function drawBezier() {

    let p = poses[0].pose;
    noFill();

    strokeWeight(4);
    stroke(100, 255, 100);

    curve(p["rightShoulder"].x, p["rightShoulder"].y,
        p["leftShoulder"].x, p["leftShoulder"].y,
        p["leftHip"].x, p["leftHip"].y,
        p["rightHip"].x, p["rightHip"].y);

    curve(p["leftShoulder"].x, p["leftShoulder"].y,
        p["leftHip"].x, p["leftHip"].y,
        p["rightHip"].x, p["rightHip"].y,
        p["rightShoulder"].x, p["rightShoulder"].y);

    curve(p["leftHip"].x, p["leftHip"].y,
        p["rightHip"].x, p["rightHip"].y,
        p["rightShoulder"].x, p["rightShoulder"].y,
        p["leftShoulder"].x, p["leftShoulder"].y);
    curve(
        p["rightHip"].x, p["rightHip"].y,
        p["rightShoulder"].x, p["rightShoulder"].y,
        p["leftShoulder"].x, p["leftShoulder"].y,
        p["leftHip"].x, p["leftHip"].y);    

    stroke(255, 100, 100);
    strokeWeight(4);
    noFill();

    curve(p["rightWrist"].x, p["rightWrist"].y,
        p["rightWrist"].x, p["rightWrist"].y,
        p["rightElbow"].x, p["rightElbow"].y,
        p["rightShoulder"].x, p["rightShoulder"].y);

    curve(p["rightWrist"].x, p["rightWrist"].y,
        p["rightElbow"].x, p["rightElbow"].y,
        p["rightShoulder"].x, p["rightShoulder"].y,
        p["leftShoulder"].x, p["leftShoulder"].y);

    curve(p["rightElbow"].x, p["rightElbow"].y,
        p["rightShoulder"].x, p["rightShoulder"].y,
        p["leftShoulder"].x, p["leftShoulder"].y,
        p["leftElbow"].x, p["leftElbow"].y);

    curve(p["rightShoulder"].x, p["rightShoulder"].y,
        p["leftShoulder"].x, p["leftShoulder"].y,
        p["leftElbow"].x, p["leftElbow"].y,
        p["leftWrist"].x, p["leftWrist"].y);

    curve(p["leftShoulder"].x, p["leftShoulder"].y,
        p["leftElbow"].x, p["leftElbow"].y,
        p["leftWrist"].x, p["leftWrist"].y,
        p["leftWrist"].x, p["leftWrist"].y);

    //
    //
    //
    curve(p["rightAnkle"].x, p["rightAnkle"].y,
        p["rightAnkle"].x, p["rightAnkle"].y,
        p["rightKnee"].x, p["rightKnee"].y,
        p["rightHip"].x, p["rightHip"].y);

    curve(p["rightAnkle"].x, p["rightAnkle"].y,
        p["rightKnee"].x, p["rightKnee"].y,
        p["rightHip"].x, p["rightHip"].y,
        p["leftHip"].x, p["leftHip"].y);

    curve(p["rightKnee"].x, p["rightKnee"].y,
        p["rightHip"].x, p["rightHip"].y,
        p["leftHip"].x, p["leftHip"].y,
        p["leftKnee"].x, p["leftKnee"].y);

    curve(p["rightHip"].x, p["rightHip"].y,
        p["leftHip"].x, p["leftHip"].y,
        p["leftKnee"].x, p["leftKnee"].y,
        p["leftAnkle"].x, p["leftAnkle"].y);

    curve(p["leftHip"].x, p["leftHip"].y,
        p["leftKnee"].x, p["leftKnee"].y,
        p["leftAnkle"].x, p["leftAnkle"].y,
        p["leftAnkle"].x, p["leftAnkle"].y);


    //
    //
    //           



}



function drawSkeleton() {
    stroke(255);
    strokeWeight(1);
    let skeleton = poses[0].skeleton;
    for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
}