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
let elasticity = 1;
let friction = 0.99;
let g = 1;



class Ball {
    constructor(x, y, r, vx, vy, density) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = vx;
        this.vy = vy;
        this.density = density;
    }
    index = balls.length;

    get mass() {
        return this.r * this.r * Math.PI * this.density;
    }

    get momentum() {
        return {
            x: this.mass * this.vx,
            y: this.mass * this.vy
        };
    }

    get kE() {
        return this.mass * (this.vx*this.vx + this.vy*this.vy)/2;
    }

    gravitize(delta) {
        for(let i = 0; i < balls.length; i++) {
            if(i == this.index) continue;
            let ball = balls[i];
            let distX = ball.x - this.x;
            let distY = ball.y - this.y;
            let dist = Math.hypot(distX, distY);
            // console.log(distX, distY, dist);
            // console.log(this.x, ball.x);

            this.vx += g*ball.mass/(dist*dist*dist)*distX*delta;
            this.vy += g*ball.mass/(dist*dist*dist)*distY*delta;
        }
    }


    update(delta) {
        // this.vy += g * delta;

        this.x += this.vx * delta;
        this.y += this.vy * delta;

        var overshootX = Math.max(-(this.x - this.r), this.x + this.r - canvas.height, 0) * (this.x < canvas.width/2 ? -1 : 1);
        var overshootY = Math.max(-(this.y - this.r), this.y + this.r - canvas.height, 0) * (this.y < canvas.width/2 ? -1 : 1);
        
        if(overshootX != 0) this.vx *= -elasticity;
        if(overshootY != 0) this.vy *= -elasticity;



        this.x -= 2 * overshootX;
        this.y -= 2 * overshootY;

        this.vx *= Math.pow(friction, delta);
        this.vy *= Math.pow(friction, delta);
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        ctx.stroke();
        ctx.fillStyle = `rgb(${255 - this.density/100 * 255}, ${255 - this.density/100 * 255}, ${255 - this.density/100 * 255})`
        ctx.fill();
    }

    checkCollision() {
        for(let i = this.index + 1; i < balls.length; i++) {
            let totalX = this.x - balls[i].x;
            let totalY = this.y - balls[i].y;
            let totalR = this.r + balls[i].r;

            if(totalX*totalX + totalY*totalY < totalR*totalR) {
                let dist = Math.hypot(totalX, totalY);
                
                // console.log("collision!");
                let m1 = this.mass;
                let m2 = balls[i].mass;
                
                let nx = totalX/dist;
                let ny = totalY/dist;
                
                let v1n = this.vx * nx + this.vy * ny;
                let v2n = balls[i].vx * nx + balls[i].vy * ny;
                
                let p = v1n - v2n;
                if (p >= 0) return;
                let j = (1+elasticity)*p/(m1 + m2);
                
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

    let delta = (timestamp-last)/1000;
    let totalMomentum = [0, 0];
    let totalkE = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    

    for(let i = 0; i < balls.length; i++) {
        balls[i].gravitize(delta);
    }

    for(let i = 0; i < balls.length; i++) {
        balls[i].update(delta);
    }
    for(let i = 0; i < balls.length; i++) {
        balls[i].checkCollision();
    }
    for(let i = 0; i < balls.length; i++) {
        balls[i].draw();
    }
    for(let i = 0; i < balls.length; i++) {
        let p = balls[i].momentum;
        totalMomentum[0] += p.x;
        totalMomentum[1] += p.y;
    }
    for(let i = 0; i < balls.length; i++) {
        totalkE += balls[i].kE;
    }
    document.getElementById("momentum").innerHTML = "Total Momentum: " + Math.round(totalMomentum[0]*10000)/10000 + ", " + Math.round(totalMomentum[1]*10000)/10000;
    document.getElementById("kineticEnergy").innerHTML = "Total Kinetic Energy (kE): " + Math.round(totalkE*10000)/10000;

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
    let density = parseFloat(document.getElementById("inputDensity").value);

    balls.push(new Ball(x, y, r, vx, vy, density));
}


canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;


    for(let i = 0; i < balls.length; i++) {
        let ball = balls[i];

        if((ball.x - x)**2 + (ball.y - y)**2 < ball.r**2) {
            if(Math.abs(ball.vx) + Math.abs(ball.vy) == 0) {
                ball.vx += 10;
                ball.vy += 10;
            } else {
                ball.vx = 0;
                ball.vy = 0;
            }
        }
    }
});

balls.push(new Ball(50, 100, 20, 0, 0, 5));
balls.push(new Ball(150, 100, 20, 0, 0, 5));


function setGravity() {
    g = parseFloat(document.getElementById("inputGravity").value);
    document.getElementById("setGravity").innerHTML = `Set Gravity Constant (Currently: ${g})`;
}

function setElasticity() {
    elasticity = parseFloat(document.getElementById("inputElasticity").value);
    document.getElementById("setElasticity").innerHTML = `Set Elasticity (Currently: ${elasticity})`;
}

function setFriction() {
    friction = parseFloat(document.getElementById("inputFriction").value);
    document.getElementById("setFriction").innerHTML = `Set Friction (Currently: ${friction})`;
}
