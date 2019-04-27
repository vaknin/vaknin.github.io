//#region Canvas
let canvas = document.getElementById('canvas');
canvas.width = window.innerWidth / 2;
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
let frontier = [];
let start, goal;
let gridHeight = canvas.height;
let gridWidth = canvas.width;

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

//On-click listener
document.addEventListener('click', e => {

    frontier = [];
    let x = e.clientX;
    let y = e.clientY;

    for (let i = 0; i < rows; i++){
        for (let j = 0; j < columns; j++){

            let s = grid[i][j];
            s.visited = undefined;
            if (s.color != wallColor && s.color != startColor && s.color != goalColor){
                s.color = undefined;
            }
            let correctX = x >= s.x && x <= s.x + squareSize;
            let correctY = y >= s.y && y <= s.y + squareSize;
    
            //Change square type: null -> wall -> start/goal
            if (correctX && correctY){
                switch(s.color){

                    //undefind -> wall
                    case undefined:
                    s.color = wallColor;
                    break;

                    //wall -> start/goal
                    case wallColor:

                    //There are already start and goal, or there are neither - put start
                    if ((start && goal) || (!start && !goal)){
                        goal.color = undefined;
                        goal = undefined;
                        start.color = undefined;
                        s.color = startColor;
                        start = s;
                    }

                    //There's only start atm, put goal
                    else if (start){
                        s.color = goalColor;
                        goal = s;
                    }

                    //There's only goal atm, put start
                    else if (goal){
                        s.color = startColor;
                        start = s;
                    }

                    break;

                    //start -> empty
                    case startColor:
                    start = undefined;
                    s.color = undefined;
                    break;

                    //goal -> empty
                    case goalColor:
                    goal = undefined;
                    s.color = undefined;
                    break;
                }
            }
        }
    }

});

document.addEventListener('keydown', e => {

    //Press enter
    if (e.which == 13){
        breadthFirst();
    }
});

//Main method
createGrid();
draw();
addStartAndGoal();