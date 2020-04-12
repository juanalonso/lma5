//@TODO: check T>= 2 if we use space
//@TODO: create a namespace
//@TODO: error if dimensions is not valid
//@TODO: error if length alpha != length joinlist
//@TODO: error in updateAlpha if joint is not valid
//@TODO: check NaN issue with z value

/*
Filtering functions are based on the work of Damien Clarke
for denoising arduino analog inputs.
https://github.com/dxinteractive/ResponsiveAnalogRead
Copyright (c) 2016, Damien Clarke
*/
class Effort {

    constructor(T = 5, jointList) {
        this.T = T;
        this.joints = Object.keys(jointList);
        this.alpha = [];
        for (let k = 0; k < this.joints.length; k++) {
            this.alpha[k] = jointList[this.joints[k]];
        }

        //Weight
        this.wCounter = 0;
        this.w = 0;
        this.wPartial = 0;

        //Time
        this.tCounter = 0;
        this.t = 0;
        this.tPartial = 0;

        //Space
        this.sCounter = 0;
        this.s = 0;
        this.sPartial = 0;
        this.sList = {};
        for (let k = 0; k < this.joints.length; k++) {
            this.sList[this.joints[k]] = [];
        }

        //Flow
        this.fCounter = 0;
        this.f = 0;
        this.fPartial = 0;
    }

    updateAlpha(joint, alpha) {
        this.alpha[this.joints.indexOf(joint)] = alpha;
    }

    weight(velocity) {

        if (Object.keys(velocity).length === 0) {
            return 0;
        }

        let e = 0;
        for (let k = 0; k < this.joints.length; k++) {
            e += this.alpha[k] * Math.pow(velocity[this.joints[k]], 2);
        }
        this.wPartial = max(this.wPartial, e);

        this.wCounter++;
        if (this.wCounter >= this.T) {
            this.wCounter = 0;
            this.w = this.wPartial;
            this.wPartial = 0;
        }

        return this.w;
    }

    time(acceleration) {

        if (Object.keys(acceleration).length === 0) {
            return 0;
        }

        for (let k = 0; k < this.joints.length; k++) {
            this.tPartial += this.alpha[k] * acceleration[this.joints[k]] / this.T;
        }

        this.tCounter++;
        if (this.tCounter >= this.T) {
            this.tCounter = 0;
            this.t = this.tPartial;
            this.tPartial = 0;
        }

        return this.t;
    }

    space(pose) {

        if (typeof pose === 'undefined') {
            return this.s;
        }

        for (let k = 0; k < this.joints.length; k++) {
            this.sList[this.joints[k]][this.sCounter] = Utils.vectorFromKeypoint(pose[this.joints[k]]);
        }

        this.sCounter++;
        if (this.sCounter >= this.T) {
            for (let k = 0; k < this.joints.length; k++) {
                let joint = 0;
                for (let i = 1; i < this.T; i++) {
                    joint += p5.Vector.sub(this.sList[this.joints[k]][i],
                        this.sList[this.joints[k]][i - 1]).mag();
                }
                joint = joint / (p5.Vector.sub(this.sList[this.joints[k]][0],
                    this.sList[this.joints[k]][this.T - 1]).mag() + Number.EPSILON);
                this.sPartial += this.alpha[k] * joint;
            }
            this.sCounter = 0;
            this.s = this.sPartial;
            this.sPartial = 0;
        }

        return this.s;
    }

    flow(jerk) {

        if (Object.keys(jerk).length === 0) {
            return 0;
        }

        for (let k = 0; k < this.joints.length; k++) {
            this.fPartial += this.alpha[k] * jerk[this.joints[k]] / this.T;
        }

        this.fCounter++;
        if (this.fCounter >= this.T) {
            this.fCounter = 0;
            this.f = this.fPartial;
            this.fPartial = 0;
        }

        return this.f;
    }

}

class Kinematic {

    constructor(dt = 0.8) {
        this.dt = dt;
        this.maxPoses = 5;
        this.poseList = [];
    }

    addPose(pose) {

        if (typeof pose !== 'undefined') {

            this.poseList.unshift(pose);

            if (this.poseList.length > this.maxPoses) {
                this.poseList.pop();
            }
        }
    }

    getKinematic() {

        if (this.poseList.length < this.maxPoses) {
            return [{}, {}, {}];
        }

        let keys = Object.keys(this.poseList[0]);
        let v = {}
        let a = {}
        let j = {}

        for (let t = 0; t < keys.length; t++) {

            let xt0 = Utils.vectorFromKeypoint(this.poseList[0][keys[t]]);
            let xt1 = Utils.vectorFromKeypoint(this.poseList[1][keys[t]]);
            let xt2 = Utils.vectorFromKeypoint(this.poseList[2][keys[t]]);
            let xt3 = Utils.vectorFromKeypoint(this.poseList[3][keys[t]]);
            let xt4 = Utils.vectorFromKeypoint(this.poseList[4][keys[t]]);

            v[keys[t]] = p5.Vector.sub(xt1, xt3).div(this.dt * 2).mag();
            a[keys[t]] = p5.Vector.sub(xt1, xt2).sub(xt2).add(xt3).div(this.dt * this.dt).mag();
            j[keys[t]] = p5.Vector.sub(xt0, xt1).sub(xt1).add(xt3).add(xt3).sub(xt4).div(2 * this.dt * this.dt * this.dt).mag();
        }
        return [v, a, j];
    }

}

class Utils {

    static vectorFromKeypoint(kp) {
        let z = 0;
        if (typeof kp.z !== 'undefined') {
            z = kp.z;
        }
        return createVector(kp.x, kp.y, z);
    }

    static fromPoseNet(results) {
        if (typeof results[0] !== 'undefined') {
            pose = results[0].pose;
            delete pose.keypoints;
            delete pose.score;
            return pose;
        }
    }

    static fromTSV(row, jointList) {

        let o = new Object();

        let dimensions = row.arr.length / jointList.length;

        for (let k = 0; k < jointList.length; k++) {
            o[jointList[k]] = { "x": parseFloat(row.arr[k * dimensions]), "y": parseFloat(row.arr[k * dimensions + 1]) };
            if (dimensions == 3) {
                o[jointList[k]].z = parseFloat(row.arr[k * dimensions + 2]);
            }
        }

        return o;
    }


    static responsiveAnalogRead(newVal, smoothVal) {

        let SNAP_MULTIPLIER = 0.02;

        function snapCurve(x) {
            var y = 1 / (abs(x * SNAP_MULTIPLIER) + 1);
            y = (1 - y) * 2;
            if (y > 1) {
                return 1;
            }
            return y;
        }

        var diff = p5.Vector.sub(Utils.vectorFromKeypoint(newVal), Utils.vectorFromKeypoint(smoothVal));

        var x = smoothVal.x + diff.x * snapCurve(diff.x);
        var y = smoothVal.y + diff.y * snapCurve(diff.y);
        var z = smoothVal.z + diff.z * snapCurve(diff.z);

        return { "x": x, "y": y, "z": z };
    }


}