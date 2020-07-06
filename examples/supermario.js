let pose;
let posedata;

let smoothValue = {};

let dt = 1/6;
let k = new Kinematic(dt);


let jointList = {
    "mario": 1,
};
let T = 10;
let e = new Effort(T, jointList);


let index = 0;


function preload() {
    posedata = loadTable('data/SuperMarioBros.tsv', 'tsv');
}


function setup() {

    frameRate(60);

    var canvas = createCanvas(720, 240);
    canvas.parent('canvas-placeholder');
    background('#5c94fc');

    select('#T').html('dt=' + dt.toFixed(2) + ' T=' + T);

}


function draw() {

    pose = Utils.fromTSV(posedata.getRow(index), e.joints);
    console.log(pose);

    index += 1;
    if (index >= posedata.getRowCount()) {
        index = 0;
    }

    k.addPose(pose);

    //Kinematic
    [velocity, acceleration, jerk] = k.getKinematic(false);

    //Effort
    let weight = e.weight(velocity);
    let time = e.time(acceleration);
    let space = e.space(pose);
    let flow = e.flow(jerk);

    select('#weight-effort').html(weight.toFixed(2));
    select('#time-effort').html(time.toFixed(2));
    select('#space-effort').html(space.toFixed(2));
    select('#flow-effort').html(flow.toFixed(2));

    //background(248);

    drawAvatar(pose,255);

}


function drawAvatar(p, opacity) {

    stroke(255, 255, 255, opacity);
    ellipse(p.mario.x, p.mario.y-240, 1, 1);

}