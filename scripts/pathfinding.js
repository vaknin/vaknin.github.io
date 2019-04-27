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
const mouseclickDelay = 3;

//Initialize grid
while (gridHeight % squareSize != 0){
    gridHeight--;
}
while (gridWidth % squareSize != 0){
    gridWidth--;
}

//Consts
const rows = gridWidth / squareSize;
const columns = gridHeight / squareSize;

//#endregion

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

//Draw function - executed every frame
function draw(){

    //Loop
    requestAnimationFrame(draw);

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
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

//Apply algorithm
async function breadthFirst(){

    clearGrid();

    //Make sure not trying to run the algorithm without start and goal points
    if (start == undefined || goal == undefined){
        return;
    }

    let count = 1;
    frontier = [];

    //Add the four square's neighbores
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

                    s.count = count;
                    frontier.push(s);
                    count++;

                    //Reached the goal
                    if (s == goal){

                        //Keep going back until reaching the start
                        while(true){
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

    frontier.push(start);

    while (frontier.length != 0){
        addNeighbores();
        await sleep(3);
    }
}

function clearGrid(){
    visited.forEach(s => {
        s.visited = false;
        if (s.color == visitedColor || s.color == pathColor){
            s.color = undefined;
        }
    });
}

//Left-click
function click(){
    let x = mouseX;
    let y = mouseY;

    outer:
    for (let i = 0; i < rows; i++){
        for (let j = 0; j < columns; j++){

            let s = grid[i][j];
            let correctX = x >= s.x && x <= s.x + squareSize;
            let correctY = y >= s.y && y <= s.y + squareSize;
    
            //Change square color
            if (correctX && correctY){
                if ((start && currentColor == startColor) || (s.color == startColor)){
                    if (start){
                        start.color = undefined;
                    }
                    start = undefined;
                }

                else if ((goal && currentColor == goalColor) || (s.color == goalColor)){
                    if (goal){
                        goal.color = undefined;
                    }
                    goal = undefined;
                }

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

    clearGrid();
}

document.addEventListener('mousedown', e => {
    interval = setInterval(() => {
        click();
    }, mouseclickDelay);
});

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

document.addEventListener('mouseup', e => {
    mousedown = false;
    clearInterval(interval);
});

document.addEventListener('keydown', e => {


    //Press enter
    if (e.which == 13){
        breadthFirst();
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

});

//Main method
createGrid();
draw();
addStartAndGoal();