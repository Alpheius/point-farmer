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
let rest = 10;

let mouseX;
let mouseY;



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
    prevX = this.x;
    prevY = this.y;
    mouseHover = false;

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
            let dist = Math.hypot(distX, distY, 1);

            this.vx += g*ball.mass/(dist*dist*dist)*distX*delta;
            this.vy += g*ball.mass/(dist*dist*dist)*distY*delta;
        }
    }


    update(delta) {
        // this.vy += g * delta;

        this.prevX = this.x;
        this.prevY = this.y;

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

        if(Math.abs(this.vx) < 0.01) this.vx = 0;
        if(Math.abs(this.vy) < 0.01) this.vy = 0;
    }

    
    checkCollision(delta) {
        for(let i = this.index + 1; i < balls.length; i++) {
            let ball = balls[i];
            
            
            let totalX = this.x - ball.x;
            let totalY = this.y - ball.y;
            let totalR = this.r + ball.r;
            
            if(totalX*totalX + totalY*totalY <= totalR*totalR) {
                let dist = Math.hypot(totalX, totalY);

                let m1 = this.mass;
                let m2 = ball.mass;
                
                let nx;
                let ny;
                if (dist === 0) {
                    nx = 1;
                    ny = 0;
                    dist = 0.0001;
                } else {
                    nx = totalX/dist;
                    ny = totalY/dist; 
                }
                let overlap = totalR - dist;
                if(overlap > 0) {
                    let move1 = -overlap*(m2/(m1+m2));
                    let move2 = -overlap*(m1/(m1+m2));
                    
                    this.x -= move1 * nx;
                    this.y -= ny*move1;
                    
                    ball.x += nx*move2;
                    ball.y += ny*move2;
                }
                
                gameData.collisions += 1;
                document.getElementById("collisionsMade").innerHTML = gameData.collisions + " Collisions";
            };
        }
    }
    
    checkCollision2(delta) {
        for(let i = this.index + 1; i < balls.length; i++) {
            let ball = balls[i];
            
            
            let totalX = this.x - ball.x;
            let totalY = this.y - ball.y;
            let totalR = this.r + ball.r;
            
            if(totalX*totalX + totalY*totalY <= totalR*totalR) {
                let dist = Math.hypot(totalX, totalY);
                let m1 = this.mass;
                let m2 = ball.mass;
                
                let nx;
                let ny;
                if (dist === 0) {
                    nx = 1;
                    ny = 0;
                    dist = 0.0001;
                } else {
                    nx = totalX/dist;
                    ny = totalY/dist; 
                }
                
                let rvx = this.vx - ball.vx;
                let rvy = this.vy - ball.vy;
                
                let velAlongNormal = rvx * nx + rvy * ny;
                if (Math.abs(velAlongNormal) < 1) {
                    velAlongNormal = 0;
                }
                if (velAlongNormal > 0) continue;
                
                let j =  (1+elasticity) * velAlongNormal/(1/m1 + 1/m2);
                this.vx -= (j / m1) * nx;
                this.vy -= (j / m1) * ny;
                ball.vx += (j / m2) * nx;
                ball.vy += (j / m2) * ny;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
        ctx.stroke();
        ctx.fillStyle = `rgb(${Math.max(255 - this.density/100 * 255, this.mouseHover * 255)}, ${Math.max(255 - this.density/100 * 255, this.mouseHover * 255)}, ${Math.max(255 - this.density/100 * 255, this.mouseHover * 255)})`
        ctx.fill();
    }
}


let balls = [];
let isMouseOverBall = false;
let last = null;

function updateBalls(timestamp) {
    if(!last) last = timestamp;

    let delta = (timestamp-last)/1000;
    let totalMomentum = [0, 0];
    let totalkE = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isMouseOverBall = false;

    for(let i = 0; i < balls.length; i++) {
        balls[i].gravitize(delta);
    }

    for(let i = 0; i < balls.length; i++) {
        balls[i].update(delta);
    }
    for(let j = 0; j < 3; j++) {
        for(let i = 0; i < balls.length; i++) {
            balls[i].checkCollision(delta);
        }
    }
    for(let i = 0; i < balls.length; i++) {
        balls[i].checkCollision2(delta);
    }
    // for(let i = 0; i < balls.length; i++) {
    //     balls[i].checkCollision(delta);
    // }
    // for(let i = 0; i < balls.length; i++) {
    //     balls[i].checkCollision(delta);
    // }
    // for(let i = 0; i < balls.length; i++) {
    //     balls[i].checkCollision(delta);
    // }
    for(let i = 0; i < balls.length; i++) {
        let ball = balls[i];

        if((ball.x - mouseX)**2 + (ball.y - mouseY)**2 < ball.r**2) {
            ball.mouseHover = true;
            isMouseOverBall = true;
        } else {
            ball.mouseHover = false;
        }
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


    if(!isMouseOverBall) {
        let x = mouseX;
        let y = mouseY;
        let r = parseFloat(document.getElementById("inputR").value);
        let density = parseFloat(document.getElementById("inputDensity").value);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2*Math.PI);
        ctx.stroke();
        ctx.fillStyle = `rgb(${255 - (density+20)/100 * 255}, ${255 - (density+20)/100 * 255}, ${255 - (density+20)/100 * 255})`
        ctx.fill();
    }
    // ctx.beginPath();
    // ctx.arc(MOU, this.y, this.r, 0, 2*Math.PI);
    // ctx.stroke();
    // ctx.fillStyle = `rgb(${Math.max(255 - this.density/100 * 255, this.mouseHover * 255)}, ${Math.max(255 - this.density/100 * 255, this.mouseHover * 255)}, ${Math.max(255 - this.density/100 * 255, this.mouseHover * 255)})`
    // ctx.fill();

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
    if(isMouseOverBall) {
        for(let i = 0; i < balls.length; i++) {
            let ball = balls[i];

            if(ball.mouseHover == true) {
                balls.splice(i, 1);
            }
        }
    } else {
        let x = mouseX;
        let y = mouseY;
        let r = parseFloat(document.getElementById("inputR").value);
        let vx = parseFloat(document.getElementById("inputVX").value);
        let vy = parseFloat(document.getElementById("inputVY").value);
        let density = parseFloat(document.getElementById("inputDensity").value);
        balls.push(new Ball(x, y, r, vx, vy, density));
    }

});

balls.push(new Ball(50, 100, 40, 0, 0, 5));
balls.push(new Ball(150, 100, 40, 0, 0, 5));


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

canvas.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
});