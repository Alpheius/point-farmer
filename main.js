let gameData = {
    points: 0,
    pointsPerClick: 1,
    pointsPerClickUpgradeCost: 10,
    collisions: 0
}

let saveGame = JSON.parse(localStorage.getItem("pointFarmerSave"))
if (saveGame !== null) {
    gameData = saveGame;
}

document.getElementById("pointsFarmed").innerHTML = gameData.points + " Points";
document.getElementById("clickUpgradesButton").innerHTML = "Buy Booster (costs " + (gameData.pointsPerClickUpgradeCost) + " Points)";
document.getElementById("clickUpgrades").innerHTML = (gameData.pointsPerClick - 1) + " Boosters";
document.getElementById("pointsFarmed").innerHTML = gameData.points + " Points";


let mainGameLoop = window.setInterval(function() {
    farmPoints();
}, 1000);

let saveGameLoop = window.setInterval(function() {
    localStorage.setItem("pointFarmerSave", JSON.stringify(gameData));
}, 15000);

function farmPoints() {
    gameData.points += gameData.pointsPerClick;
    document.getElementById("pointsFarmed").innerHTML = gameData.points + " Points";
}

function buyClickUpgrade() {
    if(gameData.points >= gameData.pointsPerClickUpgradeCost) {
        gameData.points -= gameData.pointsPerClickUpgradeCost;
        gameData.pointsPerClick += 1;
        gameData.pointsPerClickUpgradeCost *= 2;

        document.getElementById("clickUpgradesButton").innerHTML = "Buy Booster (costs " + (gameData.pointsPerClickUpgradeCost) + " Points)";
        document.getElementById("clickUpgrades").innerHTML = (gameData.pointsPerClick - 1) + " Boosters";
        document.getElementById("pointsFarmed").innerHTML = gameData.points + " Points";
    }
}


const canvas = document.getElementById("box");
const ctx = canvas.getContext("2d")



class Ball {
    constructor(x, y, r, vx, vy) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = vx;
        this.vy = vy;
    }
    index = balls.length;

    get mass() {
        return this.r * this.r * Math.PI;
    }

    update(delta) {
        this.x += this.vx * delta;
        this.y += this.vy * delta;

        var overshootX = Math.max(-(this.x - this.r), this.x + this.r - canvas.height, 0) * (this.x < canvas.width/2 ? -1 : 1);
        var overshootY = Math.max(-(this.y - this.r), this.y + this.r - canvas.height, 0) * (this.y < canvas.width/2 ? -1 : 1);
        
        if(overshootX != 0) this.vx *= -1;
        if(overshootY != 0) this.vy *= -1;



        this.x -= 2 * overshootX;
        this.y -= 2 * overshootY;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        ctx.stroke();
    }

    checkCollision() {
        for(let i = this.index + 1; i < balls.length; i++) {
            let totalX = this.x - balls[i].x;
            let totalY = this.y - balls[i].y;
            let totalR = this.r + balls[i].r;

            if(totalX*totalX + totalY*totalY < totalR*totalR) {
                let dist = Math.hypot(totalX, totalY);
                
                console.log("collision!");
                let m1 = this.mass;
                let m2 = balls[i].mass;
                
                let nx = totalX/dist;
                let ny = totalY/dist;
                
                let v1n = this.vx * nx + this.vy * ny;
                let v2n = balls[i].vx * nx + balls[i].vy * ny;
                
                let p = v1n - v2n;
                console.log(p);
                if (p <= 0) return;
                let j = 2*p/(m1 + m2);
                
                let dv1 = [-j * m2 * nx, -j * m2 * ny];
                let dv2 = [j * m1 * nx, j * m1 * ny];
                
                this.vx += dv1[0];
                this.vy += dv1[1];
                balls[i].vx += dv2[0];
                balls[i].vy += dv2[1];
                
                gameData.collisions += 1;
                document.getElementById("collisionsMade").innerHTML = gameData.collisions + " Collisions";
            };
        }
    }
}


let balls = [];

let last = null;


function updateBalls(timestamp) {
    if(!last) last = timestamp;

    let delta = (last - timestamp)/1000;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for(let i = 0; i < balls.length; i++) {
        balls[i].update(delta);
    }
    for(let i = 0; i < balls.length; i++) {
        balls[i].checkCollision();
    }
    for(let i = 0; i < balls.length; i++) {
        balls[i].draw();
    }

    last = timestamp;
    requestAnimationFrame(updateBalls);
}

requestAnimationFrame(updateBalls);

function createBallFromInputs() {
    let x = parseFloat(document.getElementById("inputX").value);
    let y = parseFloat(document.getElementById("inputY").value);
    let r = parseFloat(document.getElementById("inputR").value);
    let vx = parseFloat(document.getElementById("inputVX").value);
    let vy = parseFloat(document.getElementById("inputVY").value);

    balls.push(new Ball(x, y, r, vx, vy));
}
