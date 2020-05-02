class Vehicle {

    constructor(x, y) {
        this.pos = createVector(random(width), random(height));
        this.target = createVector(x, y);
        this.acc = createVector();
        this.size = 3 + random(3);
        this.maxspeed = 13 + random(6);
        this.vel = p5.Vector.random2D().mult(this.maxspeed);
        this.maxforce = 1 + random(2);
        this.color = color(255, 80 + random(100), 40 + random(20))
    }

    update(v1, v2) {

        //Behaviors
        //var arrive = this.arrive(this.target);
        //this.applyForce(arrive);

        //var flee = this.flee(this.target);
        //this.applyForce(flee);

        this.applyForce(this.arrive(this.target));
        this.applyForce(this.flee(v1));
        this.applyForce(this.flee(v2));

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

    arrive(target) {
        var desired = p5.Vector.sub(target, this.pos);
        var dist = desired.mag();

        var speed = this.maxspeed;
        if (dist < 25) {
            speed = map(dist, 0, 25, 0, this.maxspeed)
        }
        desired.setMag(speed);
        var steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxforce);
        return steer;
    }

    flee(target) {
        var desired = p5.Vector.sub(target, this.pos);
        var dist = desired.mag();

        if (dist < 100) {
            desired.setMag(this.maxspeed*2);
            desired.mult(-1);
            var steer = p5.Vector.sub(desired, this.vel);
            steer.limit(this.maxforce*2);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }


    applyForce(f) {
        this.acc.add(f);
    }

    draw() {
        noStroke();
        fill(this.color);
        circle(this.pos.x, this.pos.y, this.size);
    }
}