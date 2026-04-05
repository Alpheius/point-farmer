var gameData = {
    points: 0,
    pointsPerClick: 1,
    pointsPerClickUpgradeCost: 10
}

var saveGame = JSON.parse(localStorage.getItem("pointFarmerSave"))
if (saveGame !== null) {
    gameData = saveGame;
}

document.getElementById("pointsFarmed").innerHTML = gameData.points + " Points";
document.getElementById("clickUpgradesButton").innerHTML = "Buy Booster (costs " + (gameData.pointsPerClickUpgradeCost) + " Points)";
document.getElementById("clickUpgrades").innerHTML = (gameData.pointsPerClick - 1) + " Boosters";
document.getElementById("pointsFarmed").innerHTML = gameData.points + " Points";


var mainGameLoop = window.setInterval(function() {
    farmPoints();
}, 1000);

var saveGameLoop = window.setInterval(function() {
    localStorage.setItem("pointFarmerSave", JSON.stringify(gameData));
}, 15000);

function farmPoints() {
    gameData.points += gameData.pointsPerClick;
    console.log(gameData.points);
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
