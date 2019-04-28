//#region Canvas
let canvas = document.getElementById('canvas');
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight / 2;
let ctx = canvas.getContext('2d');
let cx = canvas.getBoundingClientRect().x;
let cy = canvas.getBoundingClientRect().y;

//#endregion

//#region Global variables

//Colors
const startColor = 'blue';
const wallColor = 'black';
const goalColor = 'red';
const pathColor = 'green';
const visitedColor = 'pink';

//Variables
let squareSize = 32;
let grid = [[]];
let visited = [];
let frontier = [];
let start, goal;
let gridHeight = canvas.height;
let gridWidth = canvas.width;
let mousedown = false;
let interval;
let currentColor = wallColor;
let animationFrameHandler;
let delay = 100;
let currentAlgorithm = breadthFirst;
let sleepHandler;
const mouseclickDelay = 3;

//Speed slider
let slider = document.getElementById('slider_speed');

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
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
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

//Main method
function main(){
    createGrid();
    draw();
    addStartAndGoal();
}

//#endregion

//#region Algorithms

//Breadth-first
async function breadthFirst(){

    clearGrid();

    //Make sure not trying to run the algorithm without start and goal points
    if (start == undefined || goal == undefined){
        return;
    }

    //Add the four square's neighbors
    function addNeighbores(){

        //Check the first square in the array (index 0)
        let square = frontier[0];
        
        //Remove the current square from the frontier
        frontier.splice(0, 1);
        
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
                                return;
                            }

                            //Mark the path
                            s.color = pathColor;
                        }
                    }
                }
            }
        }
    }

    //Add the 'start' square to the frontier
    frontier.push(start);

    //While there are squares inside the frontier, continue looping
    while (frontier.length != 0){
        addNeighbores();

        //If speed is set to 10, instantly execute algorithm
        if (slider.value != 10){
            await sleep(delay);
        }
    }
}

//Greedy
async function greedyHeuristic(){
}

//#endregion

//#region Events

//Left-click delegate
function click(){

    let x = mouseX;
    let y = mouseY;

    for (let i = 0; i < rows; i++){
        for (let j = 0; j < columns; j++){

            let s = grid[i][j];
            let correctX = x >= s.x && x <= s.x + squareSize;
            let correctY = y >= s.y && y <= s.y + squareSize;
    
            //Change the pressed square's color
            if (correctX && correctY){

                //If placing a starting point, remove the existing one, if one exists
                if ((start && currentColor == startColor) || (s.color == startColor)){
                    if (start){
                        start.color = undefined;
                    }
                    start = undefined;
                }

                //If placing a goal point, remove the existing one, if one exists
                else if ((goal && currentColor == goalColor) || (s.color == goalColor)){
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
            }
        }
    }

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
                let correctX = x >= s.x && x <= s.x + squareSize;
                let correctY = y >= s.y && y <= s.y + squareSize;
        
                //Change the pressed square's color
                if (correctX && correctY){
    
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

    //Press enter
    if (e.which == 13){
        clearGrid();
        currentAlgorithm();
    }

    //1
    else if (e.which == 49){
        currentColor = wallColor;
    }

    //2
    else if (e.which == 50){
        currentColor = undefined;
    }

    //3
    else if (e.which == 51){
        currentColor = startColor;
    }

    //4
    else if (e.which == 52){
        currentColor = goalColor;
    }

    // + key to increase speed
    else if (e.which == 187){
        slider.value++;
        slider.dispatchEvent(sliderEvent);
    }

    // - key to decrease speed
    else if (e.which == 189){
        slider.value--;
        slider.dispatchEvent(sliderEvent);
    }

});

//Client resized the screen -> reset grid
window.addEventListener('resize', () => {

    //Initialize grid
    cancelAnimationFrame(animationFrameHandler);
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight / 2;
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
    createGrid();
    addStartAndGoal();
    draw();
});

//#region Speed slider

//Change speed
var sliderEvent = new Event('slider');
slider.addEventListener('slider', () => {

    //Reset the algorithm, if one is active
    let running = false;
    if (frontier.length > 0){
        running = true;
    }

    //Change speed based on slider value
    delay = 50 - slider.value * 5;

    //If the algorithm was running when the slider value has changed, run it again
    if (running){
        currentAlgorithm();
    }
});

//#endregion

//#endregion

//Main method
main();