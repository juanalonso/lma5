let img;
let poseNet;
let poses = [];
let options = {
    imageScaleFactor: 1,
    minConfidence: 0.1
}



function setup() {
    createCanvas(640, 360);
    img = createImg('data/runner.jpg', '', '', imageReady);
    img.size(width, height);
    img.hide();
}



function imageReady() {
    select('#status').html('Loading model...');
    poseNet = ml5.poseNet(modelReady, options);
    poseNet.on('pose', function(results) {
        poses = results;
    });
}



function modelReady() {
    select('#status').html('Go!');
    poseNet.singlePose(img)
}



function draw() {
    image(img, 0, 0, width, height);
    if (poses.length > 0) {
        drawSkeleton(poses);
        drawKeypoints(poses);
        noLoop();
    }
}



function drawKeypoints() {
    fill(255);
    stroke(20);
    strokeWeight(4);
    for (let i = 0; i < poses.length; i++) {
        let pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j++) {
            let keypoint = pose.keypoints[j];
            if (keypoint.score > 0.2) {
                ellipse(round(keypoint.position.x), round(keypoint.position.y), 8, 8);
            }
        }
    }
}



function drawSkeleton() {
    stroke(255);
    strokeWeight(1);
    for (let i = 0; i < poses.length; i++) {
        let skeleton = poses[i].skeleton;
        for (let j = 0; j < skeleton.length; j++) {
            let partA = skeleton[j][0];
            let partB = skeleton[j][1];
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}