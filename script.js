
var elCanvas = document.getElementById("canvas");
var elNumOfLanes = document.getElementById("numOfLanes");
var elVisibleDistance = document.getElementById("visibleDistance");
var elInitialLane = document.getElementById("initialLane");
var elInitialSpeed = document.getElementById("initialSpeed");
var elSpeedIncrease = document.getElementById("speedIncrease");
var elInitialLevel = document.getElementById("initialLevel");
var elResetSettings = document.getElementById("resetSettings");
var elRestartGame = document.getElementById("restartGame");

var INITIAL_SPEED, INITIAL_LEVEL, SPEED_INCREASE, NUMBER_OF_LANES, INITIAL_LANE, VISIBLE_DISTANCE, THEME, BOOST, TILES_BETWEEN_ENEMIES;
var ctx, car, crash, canvas, tile, wall, background, themes, speed, level, lane, enemies;

function updateHtml(){
    elNumOfLanes.value = 2;
    elInitialLane.value = 0;
    elInitialSpeed.value = 200;
    elSpeedIncrease.value = 10;
    elInitialLevel.value = 1;
    elVisibleDistance.value = 20;
}

function updateVariables(){
    ctx = elCanvas.getContext("2d");
    speed = INITIAL_SPEED;
    level = 0;
    lane = INITIAL_LANE;
    enemies = [];
}

function updateConstants(){
    if(validateNumber(elInitialSpeed.value, 1, 500) == 0)
        INITIAL_SPEED = toNumber(elInitialSpeed.value);
    if(validateNumber(elInitialLevel.value, 1, 9) == 0)
        INITIAL_LEVEL = toNumber(elInitialLevel.value);
    if(validateNumber(elNumOfLanes.value, 1, 10) == 0)
        NUMBER_OF_LANES = toNumber(elNumOfLanes.value);
    if(validateNumber(elVisibleDistance.value, 6, 40) == 0)
        VISIBLE_DISTANCE = toNumber(elVisibleDistance.value);
    if(validateNumber(elInitialLane.value, 0, NUMBER_OF_LANES) == 0)
        INITIAL_LANE = toNumber(elInitialLane.value);
    if(validateNumber(elSpeedIncrease.value, 0, 200) == 0)
        SPEED_INCREASE = toNumber(elSpeedIncrease.value);
    if(validateNumber("0", 0, 5) == 0)
        THEME = toNumber("0");
    if(validateNumber("50", 0, 200) == 0)
        BOOST = toNumber("-150");
    if(validateNumber("7", 0, 20) == 0)
        TILES_BETWEEN_ENEMIES = toNumber("7");
}

function initObjects(){
    themes = [
        {car: "#000000", crash: "#000000", enemies: "#000000", walls: "#000000", background: "#a4b7ae", backgroundTiles: "#92a29a"}
    ];

    car = {
        width: 3,
        height: 4,
        draw(pos, color, drawFromRow = 0, drawToRow = 3){
            if(drawToRow >= 0){
                if(drawFromRow == 0){
                    tile.draw(pos, color);
                    tile.draw({x: pos.x + 2, y: pos.y}, color);
                }
                if(drawToRow >= 1){
                    if(drawFromRow <= 1){
                        tile.draw({x: pos.x + 1, y: pos.y + 1}, color);
                    }
                    if(drawToRow >= 2){
                        if(drawFromRow <= 2){
                            tile.draw({x: pos.x, y: pos.y + 2}, color);
                            tile.draw({x: pos.x + 1, y: pos.y + 2}, color);
                            tile.draw({x: pos.x + 2, y: pos.y + 2}, color);
                        }
                        if(drawToRow >= 3){
                            if(drawFromRow <= 3){
                                tile.draw({x: pos.x + 1, y: pos.y + 3}, color);
                            }
                        }
                    }
                }
            }
        }
    };
    chrash = {
        width: 4,
        height: 4,
        draw(pos, color){
            // draw chrash
            tile.draw(pos, color);
            tile.draw({x: pos.x + 3, y: pos.y}, color);
            tile.draw({x: pos.x + 1, y: pos.y + 1}, color);
            tile.draw({x: pos.x + 2, y: pos.y + 1}, color);
            tile.draw({x: pos.x + 1, y: pos.y + 2}, color);
            tile.draw({x: pos.x + 2, y: pos.y + 2}, color);
            tile.draw({x: pos.x, y: pos.y + 3}, color);
            tile.draw({x: pos.x + 3, y: pos.y + 3}, color);
        }
    };
    canvas = {
        widthPixels: 0, 
        heightPixels: 0, 
        tilesWidth: 4 + (NUMBER_OF_LANES * car.width),
        tilesHeight: VISIBLE_DISTANCE
    };
    tile = {
        sizePixels: Math.min(elCanvas.parentNode.clientWidth / canvas.tilesWidth, 
            elCanvas.parentNode.clientHeight / canvas.tilesHeight),
        outterPadding: 0,
        outterFrameWidth: 0,
        innerPadding: 0,
        draw(pos, color){
            ctx.strokeStyle = color;
            ctx.lineWidth = this.outterFrameWidth;
            ctx.beginPath();
            ctx.rect(
                (pos.x * this.sizePixels) + this.outterPadding,
                canvas.heightPixels - this.sizePixels - ((pos.y * this.sizePixels) - this.outterPadding),
                this.sizePixels - (2 * this.outterPadding),
                this.sizePixels - (2 * this.outterPadding)
                );
            ctx.stroke();
            ctx.fillStyle = color;
            var borderThickness = this.outterPadding + this.outterFrameWidth + this.innerPadding;
            ctx.fillRect(
                (pos.x * this.sizePixels) + borderThickness,
                canvas.heightPixels - this.sizePixels - ((pos.y * this.sizePixels) - borderThickness),
                this.sizePixels - (2 * borderThickness),
                this.sizePixels - (2 * borderThickness)
                );
        }
    };
    tile.outterPadding = tile.sizePixels / 20 * 1.5;
    tile.outterFrameWidth = tile.sizePixels / 20 * 2;
    tile.innerPadding = tile.sizePixels / 20 * 1;
    canvas.widthPixels = tile.sizePixels * canvas.tilesWidth;
    canvas.heightPixels = tile.sizePixels * canvas.tilesHeight;

    background = {
        draw(backgroundColor, backgroundTilesColor){
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.widthPixels, canvas.heightPixels);
        
            for(var row = 0; row < canvas.tilesWidth; row++)
                for(var col = 0; col < canvas.tilesHeight; col++)
                    tile.draw({x: row, y: col}, backgroundTilesColor);
        }
    };
    wall = {
        width: 1,
        height: 2,
        draw(pos, color){
            for(var i = 0; i < this.height; i++)
                tile.draw({x: pos.x, y: pos.y + i}, color);
        }
    };
}


//***************************************************



window.onload = function(){
    updateHtml();
    updateConstants();
    updateVariables();
    initObjects();
    initCanvas();
    startLoop();
    setEventListeners();
}

function initCanvas(){
    elCanvas.width = canvas.widthPixels;
    elCanvas.height = canvas.heightPixels;
}

function startLoop(){
    var wallsY = 0, enemyGenRate = 0;
    var startTime = Date.now();
    var mainLoop = setInterval(function(){
        // execute this every frame
        background.draw(themes[THEME].background, themes[THEME].backgroundTiles);

        // draw walls
        for(var i = 0; i < Math.ceil(canvas.tilesHeight / (wall.height + 1)) + 1; i++){
            wall.draw({x: 0, y: wallsY + (i * (wall.height + 1))}, themes[THEME].walls);
            wall.draw({x: canvas.tilesWidth - 1, y: wallsY + (i * (wall.height + 1))}, themes[THEME].walls);
        }

        // if crash - end loop
        for(var i = 0; i < enemies.length; i++)
            if(isCollision({lane: lane, y: 0}, enemies[i])){
                playCrashAnimation(wallsY);
                clearInterval(mainLoop);
                return;
            }

        // draw player
        car.draw({x: 2 + (car.width * lane), y: 0}, themes[THEME].car);

        /// execute this after wait
        if(Date.now() - startTime >= speed){
            wallsY = wallsY < -(wall.height - 1) ? 0 : wallsY - 1;
            enemyGenRate = enemyGenRate + 1;

            // generate enemy
            if(enemyGenRate == TILES_BETWEEN_ENEMIES + car.height){
                generateEnemy();
                enemyGenRate = 0;
            }
            // move enemies down
            for(var i = 0; i < enemies.length; i++)
                enemies[i].y--;
            // if enemy is out of view - remove
            for(var i = 0; i < enemies.length; i++)
                if(enemies[i].y + car.height < 0)
                    enemies.splice(i, 1);

            // reset start time
            startTime = Date.now();
        }

        // draw enemies
        for(var i = 0; i < enemies.length; i++)
            car.draw({x: 2 + (enemies[i].lane * car.width), y: enemies[i].y}, themes[THEME].enemies);

    }, 0);
}

function playCrashAnimation(wallsY){
    var showCrash = true;
    var startTime = Date.now();
    var crashLane = lane;
    var crashAnimationLoop = setInterval(function(){
        // execute this every frame
        background.draw(themes[THEME].background, themes[THEME].backgroundTiles);

        // draw walls
        for(var i = 0; i < Math.ceil(canvas.tilesHeight / (wall.height + 1)) + 1; i++){
            wall.draw({x: 0, y: wallsY + (i * (wall.height + 1))}, themes[THEME].walls);
            wall.draw({x: canvas.tilesWidth - 1, y: wallsY + (i * (wall.height + 1))}, themes[THEME].walls);
        }

        if(showCrash)
            chrash.draw({x: 2 + (car.width * crashLane), y: 0}, themes[THEME].crash);
        // draw enemies
        for(var i = 0; i < enemies.length; i++){
            var drawFromRow = 0, drawToRow = 3;
            drawFromRow = Math.max(0 + car.height - enemies[i].y, 0);
            car.draw({x: 2 + (enemies[i].lane * car.width), y: enemies[i].y}, themes[THEME].enemies, drawFromRow, drawToRow);
        }

        /// execute this after wait
        if(Date.now() - startTime >= 80){
            showCrash = !showCrash;
            // reset time
            startTime = Date.now();
        }

    }, 0);
}


function isCollision(car1, car2){
    if(car1.lane == car2.lane){
        if((car1.y > car2.y && car1.y < car2.y + car.height) || (car1.y + car.height > car2.y && car1.y + car.height < car2.y + car.height))
            return true;
    }
    return false;
}


function setEventListeners(){
    elCanvas.addEventListener("keydown", keyDownTriggered);
    elCanvas.addEventListener("keyup", keyUpTriggered);
}


function keyDownTriggered(e){
    
    switch(e.code){
        case "KeyD":{
            if(lane + 1 < NUMBER_OF_LANES)
                lane++;
            break;
        }
        case "KeyA":{
            if(0 < lane)
                lane--;
            break;
        }
        case "KeyW":{
            speed = INITIAL_SPEED + (level * SPEED_INCREASE) + BOOST;
            break;
        }
    }
}

function keyUpTriggered(e){
    
    switch(e.code){
        case "KeyW":{
            speed = INITIAL_SPEED + (level * SPEED_INCREASE);
            break;
        }
    }
}

function generateEnemy(){
    enemies.push({lane: Math.floor(Math.random() * NUMBER_OF_LANES), y: canvas.tilesHeight + car.height});
}