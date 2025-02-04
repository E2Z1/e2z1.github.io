var gameCanvas = document.getElementById("game");
const ctx = gameCanvas.getContext("2d");

var mx = 0, my = 0;
var player = {x: 0.0, y: -50.0, vx: 0.0, vy: 0.0, w: 10, h:10};

var keys = {};
var ong;

const ground = [{x: -50, y: 0, w: 80, h:10}, {x: 30, y: -50, w: 30, h:60}, ];
const spikes = [{x: -50, y: -10, w: 10, h:10}, ];
var lastFrame;
var countedFrames = 0;
var fps = 0;
var collidingObject;
var scale; //height equals 300 LE
const tps = 100;


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
    setInterval(physics, 1000/tps);
    window.requestAnimationFrame(render);
}

function die() {
    
    player = {x: 0.0, y: -50.0, vx: 0.0, vy: 0.0, w: 10, h:10};
}

document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
        gameCanvas.style.display = "none";
    }
});

function render() {
    scale = Math.floor(window.innerHeight/300); //pixels per Längeneinheit

    mx = Math.floor(gameCanvas.width/2-25);
    my = Math.floor(gameCanvas.height/2-25);
    ctx.fillStyle = "rgb(36 0 120)";
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    ctx.fillStyle = "rgb(255 255 255)";
    ctx.font = "100px Arial";
    ctx.fillText(fps.toString()+" FPS", 80,80);

    for (var elem of ground) {
        ctx.fillRect(mx + Math.floor((elem.x - player.x)*scale), my + Math.floor((elem.y - player.y)*scale), elem.w * scale, elem.h * scale);
    }

    ctx.fillStyle = "rgb(255 0 0)";
    for (var spike of spikes) {
        ctx.fillRect(mx + Math.floor((spike.x - player.x)*scale), my + Math.floor((spike.y - player.y)*scale), spike.w * scale, spike.h * scale);
    }

    ctx.fillStyle = "rgb(25 255 25)";
    ctx.fillRect(mx, my, player.w * scale, player.h * scale);

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

function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.h > rect2.y
    );
}

function inWall(x, y) {
    for (var elem of ground){
        if (isColliding(elem, {x, y, w: player.w, h: player.h}))
            return elem;
    }
    return null;
}

function clipTo(obj) {
    var left = obj.x - (player.x + player.w);
    var right = (obj.x + obj.w) - player.x;
    var top = obj.y - (player.y + player.h);
    var bottom = (obj.y + obj.h) - player.y;
    var closestX = player.vx > 0 ? left : right;
    var closestY = player.vy > 0 ? top : bottom;

    var timeX = player.vx !== 0 ? Math.abs(closestX / player.vx) : Infinity;
    var timeY = player.vy !== 0 ? Math.abs(closestY / player.vy) : Infinity;

    if (timeX < timeY) {
        player.x += closestX; 
        player.vx = 0;

    } else {
        player.y += closestY;
        player.vy = 0;
    }

}

function physics() {
    player.vx *= 0.95;
    ong = inWall(player.x, player.y+0.01) != null;

    if ((keys["w"] || keys["ArrowUp"]) && ong) {
        player.vy = -3;
    }
    if (player.vy != 0 || !ong)
        player.vy += 0.07;
    if (keys["a"] || keys["ArrowLeft"]) {
        player.vx = max(-1.0, player.vx - 0.04);
    }
    if (keys["d"] || keys["ArrowRight"]) {
        player.vx = min(1.0, player.vx + 0.04);
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
    }*/
    player.x += player.vx;
    player.y += player.vy;
    if (player.y > 100)
        die();
    for (var spike of spikes) {
        if (isColliding(player, spike))
            die();
    }

}

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

