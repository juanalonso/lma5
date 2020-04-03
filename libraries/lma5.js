class Effort {

    constructor(T = 5, jointList) {
        //@TODO: use alpha, now harcoded to 1 in each descriptor
        this.T = T;
        this.jointList = jointList;

        //Weight
        this.wCounter = 0;
        this.w = 0;
        this.wPartial = 0;

        //Time
        this.tCounter = 0;
        this.t = 0;
        this.tPartial = 0;

        //Flow
        this.fCounter = 0;
        this.f = 0;
        this.fPartial = 0;
    }

    weight(velocity) {

        if (Object.keys(velocity).length === 0) {
            return 0;
        }

        let e = 0;
        for (let k = 0; k < this.jointList.length; k++) {
            e += 1.0 * Math.pow(velocity[this.jointList[k]], 2);
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

        for (let k = 0; k < this.jointList.length; k++) {
            this.tPartial += 1.0 * acceleration[this.jointList[k]] / T;
        }

        this.tCounter++;
        if (this.tCounter >= this.T) {
            this.tCounter = 0;
            this.t = this.tPartial;
            this.tPartial = 0;
        }

        return this.t;
    }

    flow(jerk) {

        if (Object.keys(jerk).length === 0) {
            return 0;
        }

        for (let k = 0; k < this.jointList.length; k++) {
            this.fPartial += 1.0 * jerk[this.jointList[k]] / T;
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


    addPose(poses) {

        if (poses.length > 0) {

            delete poses[0].pose.keypoints;
            delete poses[0].pose.score;

            this.poseList.unshift(poses[0].pose);

            if (this.poseList.length > this.maxPoses) {
                this.poseList.pop();
            }
        }
    }


    vectorFromKeypoint(kp) {
        return createVector(kp.x, kp.y);
    }

    static vectorFromKeypoint(kp) {
        return createVector(kp.x, kp.y);
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

            let xt0 = this.vectorFromKeypoint(this.poseList[0][keys[t]]);
            let xt1 = this.vectorFromKeypoint(this.poseList[1][keys[t]]);
            let xt2 = this.vectorFromKeypoint(this.poseList[2][keys[t]]);
            let xt3 = this.vectorFromKeypoint(this.poseList[3][keys[t]]);
            let xt4 = this.vectorFromKeypoint(this.poseList[4][keys[t]]);

            v[keys[t]] = p5.Vector.sub(xt1, xt3).div(this.dt * 2).mag();
            a[keys[t]] = p5.Vector.sub(xt1, xt2).sub(xt2).add(xt3).div(this.dt * this.dt).mag();
            j[keys[t]] = p5.Vector.sub(xt0, xt1).sub(xt1).add(xt3).add(xt3).sub(xt4).div(2 * this.dt * this.dt * this.dt).mag();
        }
        return [v, a, j];
    }

}