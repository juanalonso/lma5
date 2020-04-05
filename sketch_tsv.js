let pose;
let posedata;


let dt = 0.01;
let k = new Kinematic(dt);

let jointList = ["leftHand", "rightHand", "head"];
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

    select('#T').html("T=" + T);

    print(posedata.getRowCount() + ' data points');
}


function rowToPose(row) {

    let o = new Object();
    o.head = { "x": parseFloat(row.arr[0]), "y": parseFloat(row.arr[1]), "z": parseFloat(row.arr[2]) };
    o.rightHand = { "x": parseFloat(row.arr[3]), "y": parseFloat(row.arr[4]), "z": parseFloat(row.arr[5]) };
    o.leftHand = { "x": parseFloat(row.arr[6]), "y": parseFloat(row.arr[7]), "z": parseFloat(row.arr[8]) };

    return o;
}


function draw() {

    pose = rowToPose(posedata.getRow(index));

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

    select('#weight-effort').html("Weight = " + weight.toFixed(2));
    select('#time-effort').html("Time = " + time.toFixed(2));
    select('#space-effort').html("Space = " + space.toFixed(2));
    select('#flow-effort').html("Flow = " + flow.toFixed(2));

    background(255);

    drawAvatar(pose);
    //     if (Object.keys(velocity).length !== 0) {
    //         drawKeypoints(pose, velocity);
    //     }

}



function drawKeypoints(pose, v) {

    fill(55);
    noStroke();

    let keys = Object.keys(pose);
    for (let f = 0; f < keys.length; f++) {
        let keypoint = pose[keys[f]];
        circle(keypoint.x, keypoint.y, max(4, v[keys[f]]));
    }
}

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