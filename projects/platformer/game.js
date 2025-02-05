let gameCanvas = document.getElementById("game");
const ctx = gameCanvas.getContext("2d");

let mx = 0, my = 0;
//let player = {x: 0.0, y: -50.0, vx: 0.0, vy: 0.0, w: 10, h:10};

let keys = {};

//const ground = [{x: -100, y: 0, w: 130, h:10}, {x: 30, y: -50, w: 30, h:60}, {x: 60, y: -70, w: 700, h:20}, ];
const spikes = [];
let lastFrame;
let countedFrames = 0;
let fps = 0;
let collidingObject;
let scale; //height equals ppL LE
const tps = 100;    //ticks per second
const ppL = 300;    //Pixels per Längeneinheit
let mouseX = 0;
let mouseY = 0;

let objects = [];
let entitys = [];
let solid = [];


class GameObject {
    constructor (x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        objects.push(this);
    }
    delete() {
        if (objects.findIndex(object => object == this) != -1)
            objects.splice(objects.findIndex(object => object == this), 1);
    }
    render(mx, my, scale) {
        ctx.fillStyle = this.color;
        ctx.fillRect(mx + Math.floor((this.x - player.x)*scale), my + Math.floor((this.y - player.y)*scale), this.w * scale, this.h * scale);
    }
}

class Ground extends GameObject {
    constructor (x, y, w, h) {
        super(x, y, w, h, "rgb(255 255 255)");
        solid.push(this);
    }
}

class Spike extends GameObject {
    constructor (x, y, w=10, h=10) {
        super(x, y, w, h, "rgb(255 0 0)");
        spikes.push(this);
    }
}

class Entity extends GameObject {
    constructor (x, y, w, h, color, slipperness, jump_accel, gravity, x_accel) {
        super(x,y,w,h, color);
        this.vx = 0.0;
        this.vy = 0.0;
        this.slipperness = slipperness;
        this.jump_accel = jump_accel;
        this.gravity = gravity;
        this.x_accel = x_accel;
        this.ong;
        entitys.push(this);
    }

    die() {
        super.delete();
        if (entitys.findIndex(entity => entity == this) != -1)  //in case 2 dies are called at almopst the same time
            entitys.splice(entitys.findIndex(entity => entity == this), 1);
    }

    damage(vx, vy) {
        this.vx += vx*0.7;
        this.vy += vy*0.7;
    }
    
    inWhichObject(x, y) {
        for (let elem of solid){
            if (this !== elem && isColliding(elem, {x, y, w: this.w, h: this.h}))
                return elem;
        }
        return null;
    }

    clipTo(obj) {                               //TODO: add calculation if other obj is movable aswell
        let left = obj.x - (this.x + this.w);
        let right = (obj.x + obj.w) - this.x;
        let top = obj.y - (this.y + this.h);
        let bottom = (obj.y + obj.h) - this.y;
        let closestX = this.vx > 0 ? left : right;
        let closestY = this.vy < 0 ? bottom : top;
    
        let timeX = this.vx !== 0 ? Math.abs(closestX / this.vx) : Infinity;
        let timeY = this.vy !== 0 ? Math.abs(closestY / this.vy) : Infinity;
    
        if (timeX < timeY) {
            this.x += closestX;
            this.vx = 0.0;
    
        } else {
            this.y += closestY;
            this.vy = 0.0;
        }
    
    }

    physics() {
        this.vx *= this.slipperness;
        this.ong = this.inWhichObject(this.x, this.y+0.01) != null;
        if (!this.ong) {
            this.vy += this.gravity;
        }
        let collidingObject;
        if (collidingObject = this.inWhichObject(this.x, this.y+this.vy)) {
            this.clipTo(collidingObject);        
        }
        if (collidingObject = this.inWhichObject(this.x+this.vx, this.y)) {
            this.clipTo(collidingObject);
        }
        /*if (collidingObject = inWhichObject(this.x+this.vx,this.y+this.vy) || inWhichObject(x,this.y)) {
            this.vx = 0;
            //this.vy = 0;
        }*/
        this.x += this.vx;
        this.y += this.vy;
        if (this.y > 500)
            this.die();
        for (let spike of spikes) {
            if (isColliding(this, spike))
                this.damage();
        }
    }
}

class Fist extends GameObject { //coukld also have used entity but physics is really useless
    constructor (x, y, velocity, player) {
        super(x, y, 3, 3, "rgb(100 100 0)");
        let dx = (mouseX-mx)/scale + player.x - x;   //calculate vx and vy so the total velocity is always the same
        let dy = (mouseY-my)/scale + player.y - y;     //mx + Math.floor((this.x - player.x)*scale), my + Math.floor((this.y - player.y)*scale)
        let velocity_scale = Math.sqrt((dx**2 + dy**2)/velocity);
        this.vx = dx/velocity_scale;
        this.vy = dy/velocity_scale;
        this.initX = x;
        this.initY = y;
        this.player = player;
        entitys.push(this);
    }

    die() {
        super.delete();
        if (entitys.findIndex(entity => entity == this) != -1)
            entitys.splice(entitys.findIndex(entity => entity == this), 1);
        this.player.fist = null;
    }

    physics() {
        this.x += this.vx;
        this.y += this.vy;
        if (dist(this.x, this.y, this.initX, this.initY) > 20) {
            this.die();
        }
        for (let entity of entitys) {
            if (entity != player && entity != this && isColliding(this, entity)) {
                entity.damage(this.vx, this.vy);
                this.die();
            }
        }
    }
}

class Player extends Entity {
    constructor (x, y, w, h) {
        super(x, y, w, h, "rgb(0 255 0)", 0.95, -4, 0.07, 0.07);
        this.initX = x;
        this.initY = y;
        this.fist = null;
        this.alive = true;
    }
    die() {
        //return;
        this.alive = false;
        this.color = "rgb(100 100 100 / 80%)"
        let self = this;
        setTimeout(() => {
            self.x = self.initX;
            self.y = self.initY;
            self.vx = 0.0;
            self.vy = 0.0;
            self.alive = true;
            self.color = "rgb(0 255 0)";
        }, 1000);
        return;
    }

    damage() {
        this.die();
    }

    physics() {
        super.physics();
        if (this.alive) {
            if ((keys["w"] || keys["ArrowUp"]) && this.ong) {
                this.vy = this.jump_accel;
            }
            if (this.vy != 0 || !this.ong)
                this.vy += this.gravity;
            if (keys["a"] || keys["ArrowLeft"]) {
                this.vx -= this.x_accel;
            }
            if (keys["d"] || keys["ArrowRight"]) {
                this.vx += this.x_accel;
            }
            if (keys[" "] && this.fist == null) {
                this.fist = new Fist(this.x+this.w/2-1.5, this.y+this.h/2-1.5, 1, this);
            }
        }
    }
}




new Ground(-100, 0, 130, 10);
new Ground(30, -20, 90, 30);
new Ground(80, -40, 40, 20);
new Ground(120, -70, 40, 30);
new Ground(120, 0, 100, 10);
new Ground(220, -20, 50, 20);
new Ground(270, -30, 60, 10);
new Ground(270, -90, 60, 40);
new Ground(300, -40, 30, 10);
new Ground(350, 0, 10, 10);
new Ground(410, -40, 30, 100);
new Ground(-100, 0, 130, 10);
new Ground(-100, 0, 130, 10);
new Spike(-80, -10);
new Spike(33, -30);
new Spike(60, -30);
new Spike(120, -80);
new Spike(330, 10, 80, 10);

new Entity(-50, -60, 20, 20, "rgb(200 0 0)", 0.95, 3, 0.08, 0.07);   //x, y, w, h, color, slipperness, jump_accel, gravity, x_accel

let player = new Player(0.0, -50.0, 10, 10);





function dist(x0, y0, x1, y1) {
    return Math.sqrt((x0-x1)**2 + (y0-y1)**2);
}

function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.h > rect2.y
    );
}

function start() {
    gameCanvas.style.display = "block"
    if (gameCanvas.requestFullscreen) {
        gameCanvas.requestFullscreen();
    } else if (gameCanvas.webkitRequestFullscreen) {
        gameCanvas.webkitRequestFullscreen();
    } else if (gameCanvas.msRequestFullscreen) {
        gameCanvas.msRequestFullscreen();
    }

    window.onresize();
    lastFrame = performance.now();
    setInterval(logic, 1000/tps);
    window.requestAnimationFrame(render);
}


document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
        gameCanvas.style.display = "none";
    }
});

function logic() {
    for (let entity of entitys) {
        entity.physics();
    }
}

function render() {
    scale = Math.floor(window.innerHeight/ppL); //pixels per Längeneinheit

    mx = Math.floor(gameCanvas.width/2-scale*player.w/2);
    my = Math.floor(gameCanvas.height/2-scale*player.h/2);
    ctx.fillStyle = "rgb(36 0 120)";
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    ctx.fillStyle = "rgb(255 255 255)";
    ctx.font = "100px Arial";
    ctx.fillText(fps.toString()+" FPS", 80,80);

    for (let object of objects) {
        object.render(mx, my, scale);
    }

    if (countedFrames++ >= 100) {
        fps = Math.round(1000/(performance.now() - lastFrame)*100);
        lastFrame = performance.now();
        countedFrames = 0;
    }
    window.requestAnimationFrame(render);
}

function min(x,y) {
    return x < y ? x : y;
}

function max(x,y) {
    return x > y ? x : y;
}





/*

function physics() {
    player.vx *= 0.95;
    ong = inWall(player.x, player.y+0.01) != null;

    if ((keys["w"] || keys["ArrowUp"]) && ong) {
        player.vy = -3;
    }
    if (player.vy != 0 || !ong)
        player.vy += 0.07;
    if (keys["a"] || keys["ArrowLeft"]) {
        player.vx -= 0.07;
    }
    if (keys["d"] || keys["ArrowRight"]) {
        player.vx += 0.07;
    }
    if (collidingObject = inWall(player.x, player.y+player.vy)) {
        clipTo(collidingObject);        
    }
    if (collidingObject = inWall(player.x+player.vx, player.y)) {
        clipTo(collidingObject);
    }
    /*if (collidingObject = inWall(player.x+player.vx,player.y+player.vy) || inWall(x,player.y)) {
        player.vx = 0;
        //player.vy = 0;
    }*//*
    player.x += player.vx;
    player.y += player.vy;
    if (player.y > 100)
        die();
    for (let spike of spikes) {
        if (isColliding(player, spike))
            die();
    }

}*/

window.onresize = function () {
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
}


window.addEventListener("keydown", (event) => {
    keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
    keys[event.key] = false;
});

window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});