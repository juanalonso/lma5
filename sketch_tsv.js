let pose;
let posedata;


let dt = 0.02;
let k = new Kinematic(dt);

let jointList = ["head", "rightHand", "leftHand"];
let T = 10;
let e = new Effort(T, jointList);


let index = 0;


function preload() {
    posedata = loadTable('data/SmoothedPos.tsv', 'tsv');
}


function setup() {

    var canvas = createCanvas(720, 480);
    canvas.parent('canvas-placeholder');

    frameRate(100);

    select('#T').html("dt=" + dt + " T=" + T);

    print(posedata.getRowCount() + ' data points');
}


function draw() {

    pose = Utils.fromTSV(posedata.getRow(index), jointList);

    index += 1;
    if (index >= posedata.getRowCount()) {
        index = 0;
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

    drawAvatar(pose);

}



// function drawKeypoints(pose, v) {

//     fill(55);
//     noStroke();

//     let keys = Object.keys(pose);
//     for (let f = 0; f < keys.length; f++) {
//         let keypoint = pose[keys[f]];
//         circle(keypoint.x, keypoint.y, max(4, v[keys[f]]));
//     }
// }

function drawAvatar(pose, opacity) {

    translate(width / 2, height * 1.5);
    scale(400, -400);
    strokeWeight(1 / 150);
    noFill();

    stroke(100, 200, 100, opacity);
    circle(pose.rightHand.x, pose.rightHand.z, 0.035);
    circle(pose.leftHand.x, pose.leftHand.z, 0.035);

    stroke(255, 100, 100, opacity);
    ellipse(pose.head.x, pose.head.z, 0.075, 0.075 * 1.35);

}