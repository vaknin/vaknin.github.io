//#region Canvas
let canvas = document.getElementById('canvas');
const canvasW = window.innerWidth * 0.85; 
const canvasH = window.innerHeight * 0.4;
canvas.width = canvasW;
canvas.height = canvasH;
let ctx = canvas.getContext('2d');
let cx = canvas.getBoundingClientRect().x;
let cy = canvas.getBoundingClientRect().y;

//#endregion

//#region Global variables

//Colors
const startColor = 'rgb(0,0,255)';
const wallColor = 'rgb(0,0,0)';
const goalColor = 'rgb(255,0,0)';
const pathColor = 'rgb(0,255,0)';
const visitedColor = 'rgb(128,180,120)';

//Variables
let squareSize = 32;
const mouseclickDelay = 3;
let mousedown = false;

//Sliders
let speedSlider = document.getElementById('slider_speed');
let delay = 100;
let wallSlider = document.getElementById('slider_wall');
let wallDensity;
let insideWallLoop;
let reducedDensity;

//Radios
let breadthRadio = document.getElementById('radio_breadth');
let heuristicRadio = document.getElementById('radio_heuristic');
let astarRadio = document.getElementById('radio_astar');
let activeRadio = 'breadth';

let grid = [[]];
let visited = [];
let frontier = [];
let walls = [];

let start, goal;
let gridHeight = canvas.height;
let gridWidth = canvas.width;
let interval;
let currentColor = wallColor;
let animationFrameHandler;
let sleepHandler;
let hoveredSquare;

//Initialize grid
while (gridHeight % squareSize != 0){
    gridHeight--;
}
while (gridWidth % squareSize != 0){
    gridWidth--;
}

//Consts
let rows = gridWidth / squareSize;
let columns = gridHeight / squareSize;

//#endregion

//#region Classes

//Square class
class Square{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    draw(){
        ctx.beginPath();
        ctx.rect(this.x - cx, this.y - cy, squareSize, squareSize);

        //Fill color
        if (this.color){
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        //Stroke square
        ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
        ctx.stroke();
        ctx.closePath();
    }
}

//#endregion

//#region Functions

//Draw function - executed every frame
function draw(){

    //Loop
    animationFrameHandler = requestAnimationFrame(draw);

    //Draw background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    //Draw grid
    drawGrid();
}

//Populate the grid
function createGrid(){

    //Columns
    for (let c = 0; c < columns; c++){

        //Rows
        for (let r = 0; r < rows; r++){

            
            let x = r * squareSize + cx;
            let y = c * squareSize + cy;
            let s = new Square(x, y);
            s.rowIndex = r;
            s.columnIndex = c;
            if (grid[r] == undefined){
                grid[r] = [];
            }
            grid[r][c] = s;
        }
    }
}

//Execute every frame
function drawGrid(){

    //Draw grid
    
    for (let i = 0; i < rows; i++){
        for (let j = 0; j < columns; j++){
            grid[i][j].draw();
        }
    }
}

//Add the goal
function addStartAndGoal(){

    //Add start point
    for (let i = 0; i < rows; i++){
        for (let j = 0; j < columns; j++){

            let s = grid[i][j];
            if (s.x - cx == 0 && s.y - cy == gridHeight - squareSize){
                start = s;
                start.color = startColor;
            }
    
            else if (s.x - cx == gridWidth - squareSize && s.y - cy == 0){
                goal = s;
                goal.color = goalColor;
            }
        }
    }
}

//thread.sleep
function sleep(ms){
    return new Promise(resolve => {
        sleepHandler = setTimeout(() => {
            resolve();
        }, ms);
    });
}

//Clear visited & path tiles
function clearGrid(){
    clearTimeout(sleepHandler);
    frontier.length = 0;

    visited.forEach(s => {
        s.visited = false;
        if (s.color == visitedColor || s.color == pathColor){
            s.color = undefined;
        }
    });
}

//Randomly place walls in the grid
async function randomWalls(){

    let count = 0;

    //If executing, return
    if (frontier.length != 0){
        insideWallLoop = false;
        return;
    }


    //Keep looping until found a wall structure with a possible path
    while(true){

        //Count iterations
        count++;

        //Clear everything except goal/start
        walls.forEach(s => {
            s.color = undefined;
        });
        walls = [];
        clearGrid();

        for (let i = 0; i < rows; i++){
            for (let j = 0; j < columns; j++){
                let s = grid[i][j];

                //Don't turn start/goal to a wall, search for other squares
                if (s == start || s == goal){
                    continue;
                }

                //Get a random number between 0~1
                let rand = Math.random();

                //chance to be a wall
                if (rand > 1 - wallDensity){
                    s.color = wallColor;
                    walls.push(s);
                }
            }
        }

        //Execute to see if there is a path
        let delayHolder = delay;
        delay = 0;

        if (await execute()){
            clearGrid();
            delay = delayHolder;
            if (reducedDensity){
                getDensity();
                reducedDensity = false;
            }
            insideWallLoop = false;
            break;
        }

        if (count == 20){
            count = 0;
            wallDensity -= 0.01;
            reducedDensity = true;
        }

        delay = delayHolder;
    }
}

//Main method
function main(){
    createGrid();
    draw();
    addStartAndGoal();
    getDensity();
}

//#endregion

//#region Searching algorithms

//Execute the current algorithm
async function execute(){

    //Make sure not trying to run the algorithm without start and goal points
    if (start == undefined || goal == undefined){
        return;
    }

    //Remove the 'visited' tiles and the 'path' tiles
    clearGrid();

    //Add the 'start' square to the frontier
    frontier.push(start);

    //If there's a square currently hovered, ignore it
    if (hoveredSquare){
        hoveredSquare.color = hoveredSquare.previousColor;
        hoveredSquare = undefined;
    }

    let foundPath = await algorithm();
    return foundPath;
}

//Add the four square's neighbors
function addNeighbores(type){

    let heuristicNeighbors = [];
    let square;

    //Check the first square in the array (index 0)
    switch (type){

        //Breadth
        case 'breadth':
        square = frontier[0];
        break;

        //Heuristic
        case 'heuristic':
        let shortestDistance, closestSquare;
        frontier.forEach(s => {
            //Manhatten distance
            let d = Math.abs(s.rowIndex - goal.rowIndex) + Math.abs(s.columnIndex - goal.columnIndex);
            if (d < shortestDistance || shortestDistance == undefined){
                shortestDistance = d;
                closestSquare = s;
            }
        });
        square = closestSquare;
        break;
    }
    
    //Remove the current square from the frontier
    frontier.splice(frontier.indexOf(square), 1);
    
    //Scan for the four neighboring squares
    for (let i = 0; i < 4; i++){
        let x = square.rowIndex;
        let y = square.columnIndex;

        //4 different scenarios
        switch(i){
            //X++
            case 0:
            x++;
            break;

            //X--
            case 1:
            x--;
            break;

            //Y++
            case 2:
            y++;
            break;

            //Y--
            case 3:
            y--;
            break;
        }

        //The neighboring square
        if (grid[x] && grid[x][y]){
            
            let s = grid[x][y];

            //Check whether the square has already been visited and it's not a wall
            if (!s.visited && s.color != wallColor){

                //Heuristic
                if (type == 'heuristic'){
                    heuristicNeighbors.push(s);
                    if (i != 3){
                        continue;
                    }

                    //Last iteration, pick the closest neighbor to goal
                    else{
                        let shortestDistance, closestSquare;
                        heuristicNeighbors.forEach(s => {
                            //Manhatten distance
                            let d = Math.abs(s.rowIndex - goal.rowIndex) + Math.abs(s.columnIndex - goal.columnIndex);
                            if (d < shortestDistance || shortestDistance == undefined){
                                shortestDistance = d;
                                closestSquare = s;
                            }
                        });

                        s = closestSquare;
                    }
                }

                s.cameFrom = square;
                s.visited = true;
                visited.push(s);

                //Mark progress
                if (s != start && s != goal){
                    s.color = visitedColor;
                }

                //Add the neighbor to the frontier array
                frontier.push(s);

                //Reached the goal square, stop
                if (s == goal){

                    //Keep going back until reaching the start
                    while(true){

                        //The square it came from
                        s = s.cameFrom;

                        //Reached back to start point, break the 'while' loop and finish the algorithm
                        if (s == start){
                            goal.color = goalColor;
                            start.color = startColor;

                            //Exit early
                            frontier = [];
                            return true;
                        }

                        //Mark the path
                        s.color = pathColor;
                    }
                }
            }
        }
    }

    if (type == 'heuristic'){

    }
}

async function algorithm(){
    //While there are squares inside the frontier, continue looping
    while (frontier.length != 0){

        //Once the goal has been reached, return
        let foundPath = addNeighbores(activeRadio);

        //Finished executing
        if (foundPath){
            return true;
        }

        //If speed is set to 10, instantly execute algorithm
        if (delay != 0){
            await sleep(delay);
        }
    }
}

//#endregion

//#region Events

//Left-click delegate
function click(){

    if (!hoveredSquare){
        return;
    }
    let s = hoveredSquare;

    //If placing a starting point, remove the existing one, if one exists
    if ((start && currentColor == startColor) || (s.previousColor == startColor)){
        if (start){
            start.color = undefined;
        }
        start = undefined;
    }

    //If placing a goal point, remove the existing one, if one exists
    else if ((goal && currentColor == goalColor) || (s.previousColor == goalColor)){
        if (goal){
            goal.color = undefined;
        }
        goal = undefined;
    }

    if (s.previousColor == wallColor){
        walls.splice(walls.indexOf(s));
    }

    //Set the current square to the currently selected square type
    s.color = currentColor;
    if (currentColor == startColor){
        start = s;
    }
    else if (currentColor == goalColor){
        goal = s;
    }

    else if (currentColor == wallColor){
        walls.push(s);
    }

    hoveredSquare = undefined;

    //Clear the visited & path tiles
    clearGrid();
}

//Mousemove
document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    //Not currently running an algorithm
    if (frontier.length == 0){
     
        //Go through every square
        for (let i = 0; i < rows; i++){
            for (let j = 0; j < columns; j++){
    
                let s = grid[i][j];
                let correctX = mouseX >= s.x && mouseX <= s.x + squareSize;
                let correctY = mouseY >= s.y && mouseY <= s.y + squareSize;
        
                //Change the pressed square's color
                if (correctX && correctY){

                    if (hoveredSquare){
                        hoveredSquare.color = hoveredSquare.previousColor;
                    }

                    hoveredSquare = s;
                    hoveredSquare.previousColor = s.color;

                    s.color = currentColor;
                    return;
                }
            }
        }
    }
});

//Mouse down
canvas.addEventListener('mousedown', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    interval = setInterval(() => {
        click();
    }, mouseclickDelay);
});

//Mouse up
document.addEventListener('mouseup', e => {
    mousedown = false;
    clearInterval(interval);
});

//Key press
document.addEventListener('keydown', e => {

    //Variables for a nice representation
    let enter = e.which == 13;
    let digit1 = e.which == 49;
    let digit2 = e.which == 50;
    let digit3 = e.which == 51;
    let digit4 = e.which == 52;
    let plus = e.which == 187;
    let minus = e.which == 189;
    let W = e.which == 87;

    //Press enter
    if (enter){
        execute();
    }

    //Digits were pressed
    else if (digit1 || digit2 || digit3 || digit4){

        //1 -> place wall
        if (digit1){
            currentColor = wallColor;
        }

        //2 -> remove
        else if (digit2){
            currentColor = undefined;
        }

        //3 -> place start
        else if (digit3){
            currentColor = startColor;
        }

        //4 -> place goal
        else if (digit4){
            currentColor = goalColor;
        }

        //If there is a square hovered, change it's color
        if (hoveredSquare){
            hoveredSquare.color = currentColor;
        }
    }

    // + key to increase speed
    else if (plus){
        speedSlider.value++;
        changeDelay();
    }

    // - key to decrease speed
    else if (minus){
        speedSlider.value--;
        changeDelay();
    }

    // 'W' key to randomly place walls
    else if (W){

        //If not already placing walls
        if (!insideWallLoop){
            insideWallLoop = true;
            randomWalls();
        }
    }

});

//Client resized the screen -> reset grid
window.addEventListener('resize', () => {

    //Initialize grid
    cancelAnimationFrame(animationFrameHandler);
    canvas.width = canvasW;
    canvas.height = canvasH;
    let gridHeight = canvas.height;
    let gridWidth = canvas.width;
    while (gridHeight % squareSize != 0){
        gridHeight--;
    }
    while (gridWidth % squareSize != 0){
        gridWidth--;
    }
    rows = gridWidth / squareSize;
    columns = gridHeight / squareSize;
    ctx = canvas.getContext('2d');
    cx = canvas.getBoundingClientRect().x;
    cy = canvas.getBoundingClientRect().y;
    grid = [];
    visited = [];
    frontier = [];
    walls = [];
    createGrid();
    addStartAndGoal();
    draw();
});

//#region Algorithm radios

function radioListener(radio, text){
    radio.addEventListener('change', () => {
        activeRadio = text;
    });
}
radioListener(breadthRadio, 'breadth');
radioListener(heuristicRadio, 'heuristic');
radioListener(astarRadio, 'astar');


//#endregion

//#region Wall density

//Calculate wall density
function getDensity(){
    wallDensity = (wallSlider.value / 10) * 0.5;
}

//Wall density slider
wallSlider.addEventListener('input', () => {
    getDensity();
});

//#endregion

//#region Speed slider

//Change Delay
function changeDelay(){
    delay = 50 - speedSlider.value * 5;
}
speedSlider.addEventListener('input', () => {
changeDelay();
});

//#endregion

//#endregion

//Main method
main();