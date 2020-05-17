class Vehicle {

    constructor(x, y, maxspeed, maxforce, size, color, hasEyes) {

        this.maxspeed = maxspeed;
        this.maxforce = maxforce;

        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(this.maxspeed);
        this.acc = createVector();

        this.size = size;
        this.color = color;
        this.hasEyes = hasEyes;

        this.wandertheta = 0;
        this.wanderR = 25; // Radius for our "wander circle"
        this.wanderD = 80; // Distance for our "wander circle"
        this.change = 0.3;
        this.circleOffSet = createVector();

    }


    update() {

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


    arrive(target, dist_limit) {
        var desired = p5.Vector.sub(target, this.pos);
        var dist = desired.mag();

        var speed = this.maxspeed;
        if (dist < dist_limit) {
            speed = map(dist, 0, dist_limit, 0, this.maxspeed)
        }
        desired.setMag(speed);
        var steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxforce);
        return steer;
    }


    flee(target, dist_limit) {
        var desired = p5.Vector.sub(target, this.pos);
        var dist = desired.mag();

        if (dist < dist_limit) {
            desired.setMag(this.maxspeed);
            desired.mult(-1);
            var steer = p5.Vector.sub(desired, this.vel);
            steer.limit(this.maxforce);
            return steer;
        } else {
            return createVector(0, 0);
        }
    }

    bounce() {
        var desired = createVector();
        var bounce = false;

        if (this.pos.x < 25) {
            desired = createVector(this.maxspeed, this.vel.y);
            bounce = true;
        } else if (this.pos.x > width - 25) {
            desired = createVector(-this.maxspeed, this.vel.y);
            bounce = true;
        }

        if (this.pos.y < 25) {
            desired = createVector(this.vel.x, this.maxspeed);
            bounce = true;
        } else if (this.pos.y > height - 25) {
            desired = createVector(this.vel.x, -this.maxspeed);
            bounce = true;
        }

        if (!bounce) {
            return createVector();
        }

        var steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxforce);
        return steer;

    }

    wander() {
        this.wandertheta += random(-this.change, this.change);

        var circlePos = createVector(this.vel.x, this.vel.y);
        circlePos.normalize().mult(this.wanderD).add(this.pos);

        var h = this.vel.heading(); // We need to know the heading to offset wandertheta
        this.circleOffSet = createVector(this.wanderR * cos(this.wandertheta + h), this.wanderR * sin(this.wandertheta + h));
        this.circleOffSet.add(circlePos);
        return this.seek(this.circleOffSet);
    }

    applyForce(f) {
        this.acc.add(f);
    }


    draw() {
        if (this.hasEyes) {
            stroke('#e0e0e0');
        } else {
            noStroke();
        }
        fill(this.color);
        circle(this.pos.x, this.pos.y, this.size);
        if (this.hasEyes) {
            noStroke();
            fill(55);
            circle(this.pos.x - 9, this.pos.y - 10, 6);
            circle(this.pos.x + 9, this.pos.y - 10, 6);
            triangle(this.pos.x, this.pos.y + 6,
                this.pos.x - 2, this.pos.y-2,
                this.pos.x + 2, this.pos.y-2)

            //     fill('#f7d629');
            //     stroke(0);
            //     strokeWeight(0.5);
            //     circle(this.pos.x - 8, this.pos.y - 10, 10);
            //     circle(this.pos.x + 8, this.pos.y - 10, 10);
            //     fill(0);
            //     circle(this.pos.x - 8, this.pos.y - 10, 3);
            //     circle(this.pos.x + 8, this.pos.y - 10, 3);
            //     triangle(this.pos.x, this.pos.y+5,
            //         this.pos.x-2, this.pos.y,
            //         this.pos.x+2, this.pos.y)
        }
    }
}