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
    image(video, 0, 0, width, height);
    if (poses.length > 0) {
        drawSkeleton(poses);
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

    stroke(255, 100, 100);
    line(p["rightWrist"].x, p["rightWrist"].y, p["rightElbow"].x, p["rightElbow"].y);
    line(p["rightElbow"].x, p["rightElbow"].y, p["rightShoulder"].x, p["rightShoulder"].y);
    line(p["rightShoulder"].x, p["rightShoulder"].y, p["leftShoulder"].x, p["leftShoulder"].y);
    line(p["leftShoulder"].x, p["leftShoulder"].y, p["leftElbow"].x, p["leftElbow"].y);
    line(p["leftElbow"].x, p["leftElbow"].y, p["leftWrist"].x, p["leftWrist"].y);
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