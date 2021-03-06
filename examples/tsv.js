let pose;
let posedata;

let smoothValue = {};

let dt = 0.02;
let k = new Kinematic(dt);


let jointList = {
    "head": 0.5,
    "rightHand": 0.5,
    "leftHand": 0.5,
};
let T = 10;
let e = new Effort(T, jointList);


let index = 0;


function preload() {
    posedata = loadTable('data/SmoothedPos.tsv', 'tsv');
}


function setup() {

    frameRate(100);

    var canvas = createCanvas(720, 480);
    canvas.parent('canvas-placeholder');

    select('#T').html('dt=' + dt + ' T=' + T);

    for (let k = 0; k < e.joints.length; k++) {
        var button = createElement('button', e.alpha[k].toFixed(2) + ' * ' + e.joints[k]);
        button.attribute('data-idx', k);
        button.attribute('data-value', e.alpha[k].toFixed(2));
        button.mousePressed(updateAlpha);
        button.parent('jointlist');
    }

}


function draw() {

    pose = Utils.fromTSV(posedata.getRow(index), e.joints);

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

    drawAvatar(pose,255);

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


function drawAvatar(p, opacity) {

    push();

    translate(width / 2, height * 1.5);
    scale(400, -400);
    strokeWeight(1 / 150);
    noFill();

    stroke(100, 200, 100, opacity);
    circle(p.rightHand.x, p.rightHand.z, 0.035);
    circle(p.leftHand.x, p.leftHand.z, 0.035);

    stroke(255, 100, 100, opacity);
    ellipse(p.head.x, p.head.z, 0.075, 0.075 * 1.35);

    pop();

}