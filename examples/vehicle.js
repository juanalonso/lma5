class Vehicle {

    constructor(x, y) {
        this.pos = createVector(x, y);
        this.target = createVector();
        this.vel = createVector();
        this.acc = createVector();
        this.mass = 3 + Math.random() * 3;
        this.maxspeed = 13 + Math.random() * 6;
        this.maxforce = 1 + Math.random() * 2;
        this.color = color(255, 80 + Math.random() * 100, 40 + Math.random() * 20)
    }

    update() {

        //Behaviors
        //var arrive = this.arrive(this.target);
        //this.applyForce(arrive);

        //var flee = this.flee(this.target);
        //this.applyForce(flee);

        var seek = this.seek(this.target);
        this.applyForce(seek);

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    seek(target) {

        var desired = p5.Vector.sub(target, this.pos);
        desired.setMag(this.maxspeed);
        var steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxforce);
        return steer;
    }

    flee(target) {

        var desired = p5.Vector.sub(target, this.pos);
        var dist = desired.mag();

        var steer = createVector(0, 0);
        if (dist < 25) {
            desired.setMag(this.maxspeed);
            desired.mult(-1);
            steer = p5.Vector.sub(desired, this.vel);
            steer.limit(this.maxforce);
        }
        return steer;
    }

    arrive(target) {
        var desired = p5.Vector.sub(target, this.pos);
        var dist = desired.mag();

        var speed = this.maxspeed;
        if (dist < 250) {
            speed = map(dist, 0, 250, 0, this.maxspeed)
        }
        desired.setMag(speed);
        var steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxforce);
        return steer;
    }

    applyForce(f) {
        this.acc.add(f);
    }

    draw() {
        noStroke();
        fill(this.color);
        circle(this.pos.x, this.pos.y, this.mass);
    }
}