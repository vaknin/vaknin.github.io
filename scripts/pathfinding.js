//#region Global variables

//#region Canvas
let canvas = document.getElementById('canvas');
let canvasW = window.innerWidth * 0.85; 
let canvasH = window.innerHeight * 0.4;
canvas.width = canvasW;
canvas.height = canvasH;
let ctx = canvas.getContext('2d');
let cx = canvas.getBoundingClientRect().x;
let cy = canvas.getBoundingClientRect().y;

//#endregion

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
let reducedDensity;

//Radios
let breadthRadio = document.getElementById('radio_breadth');
let bestRadio = document.getElementById('radio_best');
let astarRadio = document.getElementById('radio_astar');
let activeRadio = 'breadth';

//Buttons
let div_controls = document.getElementById('div_controls');
let btn_openControls = document.getElementById('btn_openControls');
let btn_closeControls = document.getElementById('btn_closeControls');
let controlsDisplayed = false;

//Arrays
let grid = [[]];
let visited = [];
let frontier = [];
let walls = [];

//Variables
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
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
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

    //Generate random positions for 'start' and 'goal'
    for (let i = 0; i < 2; i++){

        let r, c;

        while(true){
            r = Math.round(Math.random() * (rows - 1));
            c = Math.round(Math.random() * (columns - 1));

            //Make sure goal and start aren't the same point
            if (i == 0 || grid[r][c] != start){
                break;
            }
        }

        let s = grid[r][c];

        //Set 'start'
        if (i == 0){
            s.color = startColor;
            start = s;
        }

        //Set 'goal'
        else{
            s.color = goalColor;
            goal = s;
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

    //If executing an algorithm, or there are no start and goal squares, return
    if (frontier.length != 0 || start == undefined || goal == undefined){
        return;
    }

    //Keep looping until found a wall structure with a possible path
    while(true){

        //Count iterations
        count++;

        //Remove all squares except goal and start
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

        //Execute faster to see if there is a path
        let delayHolder = delay;
        delay = 0;

        //Wait until the algorithm returns true - that a path has been found
        let foundPath = await execute();
        
        if (foundPath){
            clearGrid();
            delay = delayHolder;
            if (reducedDensity){
                getDensity();
                reducedDensity = false;
            }
            break;
        }

        if (count == 15){
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
    randomWalls();
}

//#endregion

//#region Algorithms

//Execute the current algorithm, returns a boolean that indicates whether a path has been found
async function execute(){

    //Make sure not trying to run the algorithm without start and goal points
    if (start == undefined || goal == undefined){
        return;
    }

    //If currently in the controls screen, return
    if (controlsDisplayed){
        return;
    }

    //If there's a square currently hovered, ignore it
    if (hoveredSquare){
        hoveredSquare.color = hoveredSquare.previousColor;
        hoveredSquare = undefined;
    }

    //Remove the 'visited' tiles and the 'path' tiles
    clearGrid();

    //Add the 'start' square to the frontier
    frontier.push(start);

    //Break this loop if frontier is empty OR if found a path to the goal square
    while(frontier.length > 0){
        //Set a boolean variable that checks whether a path has been found
        let done = visit(frontier[0]);

        //Wait between each visit, for visual purposes
        if (delay != 0){
            await sleep(delay);
        }

        //If algorithm finished, return true
        if (done){
            return true;
        }
    }

    //If the frontier array is empty, couldn't find a suitable path
    return false;
}

//Visits a square, "goes inside it", checks if it is the goal square and if not, adds it's four neighbors to the frontier
function visit(square){
    //Remove the square from the frontier
    frontier.splice(frontier.indexOf(square), 1);
    
    //Mark the square as visited
    square.visited = true;
    visited.push(square);
    if (square != start && square != goal){
        square.color = visitedColor;
    }

    //If the square is the goal square, end algorithm
    if (square == goal){

        //The square that came before the goal square
        let s = square.cameFrom;

        //Trace the way back from the goal square to the starting destination
        while(true){

            //Once reached the starting point, break the loop and end the algorithm
            if (s == start){
                
                //End algorithm
                frontier = [];

                return true;
            }
            
            //Mark the path
            s.color = pathColor;

            //Get the next square
            s = s.cameFrom;
        }
    }

    //If it's not the goal square, add the square's neighbors to the frontier
    else{
        addNeighbors(square);
    }
}

//Add the four adjacent neighbors
function addNeighbors(square){

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

        //Check if the square actually exists on the grid
        if (grid[x] && grid[x][y]){
            
            //Assign a variable to it
            let s = grid[x][y];

            //If the square is not a wall and hasn't been visited yet - add it to the frontier
            if (!s.visited && s.color != wallColor){

                //If the square is not inside the frontier, add it
                if (frontier.indexOf(s) == -1){
                    s.cameFrom = square;
                    frontier.push(s);
                }
            }
        }
    }

    //Best-first algorithm
    if (activeRadio == 'best'){

        //If the frontier is empty, return, no path found
        if (frontier.length == 0){
            return;
        }

        //Loop through the neighbors array, and pick the closest one
        let closestSquare, closestDistance;
        for(i = 0; i < frontier.length; i++){

            let s = frontier[i];

            //Manhatten distance
            let d = Math.abs(s.rowIndex - goal.rowIndex) + Math.abs(s.columnIndex - goal.columnIndex);

            //First iteration - assign the first frontier in queue temporarily to be the closest square to the goal
            if (i == 0 ){
                closestSquare = frontier[0];
                closestDistance = d;
                continue;
            }

            //Keep looping the entire array until we've found the square with the shortest distance to the goal
            else if (d < closestDistance){
                closestDistance = d;
                closestSquare = s;
            }
        }

        //Remove the square from the frontier
        frontier.splice(frontier.indexOf(closestSquare), 1);

        //Add the square to the beginning of the array
        frontier.unshift(closestSquare);
    }
}

//#endregion

//#region Events

//Left-click delegate
function click(){

    //Stop executing
    if (frontier.length != 0){
        frontier = [];
        clearGrid();
        return;
    }

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

    //If currently in the controls screen, return
    if (controlsDisplayed){
        return;
    }

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

    //If currently in the controls screen, return
    if (controlsDisplayed){
        return;
    }

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
    let C = e.which == 67;
    let Esc = e.which == 27;
    let F1 = e.which == 112;
    let F2 = e.which == 113;
    //let F3 = e.which == 114; reserver for a*


    //Press enter
    if (enter){

        //Execute
        if (frontier.length == 0){
            execute();
        }

        //Already executing, stop
        else{
            frontier = [];
            clearGrid();
        }
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

        //If currently in the controls screen, return
        if (controlsDisplayed){
            return;
        }

        randomWalls();
    }

    // 'C' key to clear the grid
    else if (C){

        //If currently in the controls screen, return
        if (controlsDisplayed){
            return;
        }

        //Stop executing
        frontier = [];

        //Remove walls
        walls.forEach(s => {
            s.color = undefined;
        });
        walls = [];

        //Remove path & visited
        clearGrid();
    }

    // Escape closes the controls
    else if (Esc){
        div_controls.style.display = 'none';
        controlsDisplayed = false;
    }

    //F1 -> changes current algorithm to breadth-first
    else if (F1){
        breadthRadio.click();
    }

    //F2 -> changes current algorithm to best-first
    else if (F2){
        bestRadio.click();
    }

});

//Client resized the screen -> reset grid
window.addEventListener('resize', () => {

    //Initialize grid
    cancelAnimationFrame(animationFrameHandler);
    canvasW = window.innerWidth * 0.85; 
    canvasH = window.innerHeight * 0.4;
    canvas.width = canvasW;
    canvas.height = canvasH;
    cx = canvas.getBoundingClientRect().x;
    cy = canvas.getBoundingClientRect().y;
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
    grid = [];
    visited = [];
    frontier = [];
    walls = [];
    createGrid();
    addStartAndGoal();
    randomWalls();
    draw();
});

//#region Controls

//Show controls
btn_openControls.addEventListener('click', () => {
    div_controls.style.display = 'inline';
    controlsDisplayed = true;
});

//Close controls
btn_closeControls.addEventListener('click', () => {
    div_controls.style.display = 'none';
    controlsDisplayed = false;
});

//#endregion

//#region Algorithm Radios

function radioListener(radio, text){
    radio.addEventListener('change', () => {
        activeRadio = text;
    });
}
radioListener(breadthRadio, 'breadth');
radioListener(bestRadio, 'best');
radioListener(astarRadio, 'astar');


//#endregion

//#region Wall Density

//Calculate wall density
function getDensity(){
    wallDensity = (wallSlider.value / 10) * 0.45;
}

//Wall density slider
wallSlider.addEventListener('input', () => {
    getDensity();
});

//#endregion

//#region Speed

//Change Delay
function changeDelay(){
    delay = 200 - speedSlider.value * 20;
}
speedSlider.addEventListener('input', () => {
changeDelay();
});

//#endregion

//#endregion

main();