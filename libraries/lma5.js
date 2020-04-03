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

        for (let f = 0; f < keys.length; f++) {

            let xt0 = this.vectorFromKeypoint(this.poseList[0][keys[f]]);
            let xt1 = this.vectorFromKeypoint(this.poseList[1][keys[f]]);
            let xt2 = this.vectorFromKeypoint(this.poseList[2][keys[f]]);
            let xt3 = this.vectorFromKeypoint(this.poseList[3][keys[f]]);
            let xt4 = this.vectorFromKeypoint(this.poseList[4][keys[f]]);

            v[keys[f]] = p5.Vector.sub(xt1, xt3).div(this.dt * 2).mag();
            a[keys[f]] = p5.Vector.sub(xt1, xt2).sub(xt2).add(xt3).div(this.dt * this.dt).mag();
            j[keys[f]] = p5.Vector.sub(xt0, xt1).sub(xt1).add(xt3).add(xt3).sub(xt4).div(2 * this.dt * this.dt * this.dt).mag();
        }
        return [v, a, j];
    }

}