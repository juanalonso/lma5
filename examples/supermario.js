let pose;
let posedata;

let smoothValue = {};

let dt = 1 / 6;
let k = new Kinematic(dt);


let jointList = {
    "mario": 1,
};
let T = 10;
let e = new Effort(T, jointList);


let index = 0;
let trail = [];
let TRAIL_LENGTH = 10;
let SCREEN_CENTER = 80;
let backgroundImg;


function preload() {
    posedata = loadTable('data/SuperMarioBros.tsv', 'tsv');
    backgroundImg = loadImage('data/SuperMarioBros_1-1.png');

}


function setup() {

    frameRate(60);

    var canvas = createCanvas(512, 480);
    canvas.parent('canvas-placeholder');
    background('#5c94fc');

    select('#T').html('dt=' + dt.toFixed(2) + ' T=' + T);

}


function draw() {

    pose = Utils.fromTSV(posedata.getRow(index), e.joints);
    //console.log(pose);

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

    let frame = {
        x: pose.mario.x,
        y: pose.mario.y,
        v: velocity.mario === undefined ? 0 : velocity.mario
    }

    trail.unshift(frame);
    if (trail.length > TRAIL_LENGTH) {
        trail.pop();
    }

    let backgroundPos = 0;
    if (frame.x > SCREEN_CENTER) {
        backgroundPos = SCREEN_CENTER - frame.x;
    }

    background('#5c94fc');
    image(backgroundImg, backgroundPos * 2, 0);
    drawAvatar(trail);

}


function drawAvatar(trail) {

    let v;
    let marioOffset = 0;
    if (trail[0].x > SCREEN_CENTER) {
        marioOffset = SCREEN_CENTER - trail[0].x;
    }

    noStroke();
    for (let j = 0; j < trail.length; j++) {
        v = trail[j].v;
        v = max(2, v);
        fill(255, map(j, 0, TRAIL_LENGTH - 1, 255, 0));
        circle(trail[j].x * 2 + 20 + marioOffset * 2, trail[j].y * 2 - 480 + 16, v);
    }

}