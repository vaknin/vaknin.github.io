//#region Canvas
let canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext('2d');
//#endregion

//#region Global variables
let mouseX, mouseY;
let objects = [];
//#endregion

//#region Classes

class Player{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.r = 25;
        this.selected = false;
    }

    draw(){
        ctx.beginPath();
        if (this.selected){
            ctx.arc(this.x, this.y, this.r + 3, 0, Math.PI * 2, true);
            ctx.fillStyle = 'blue';
            ctx.fill();    
        }
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.closePath();
    }
}

//#endregion

//#region Drawing functions

//Draw function - executed every frame
function draw(){

    requestAnimationFrame(draw);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    objects.forEach(obj => {
        obj.draw();
    });
}

//#endregion

//#region Input (clicks, keypresses, etc.)

document.addEventListener('click', e => {

    mouseX = e.clientX;
    mouseY = e.clientY;

    //#region Detect cursor collision with the player

    //Distance between the cursor and the player
    let d = Math.sqrt((mouseX - p.x) * (mouseX - p.x) + (mouseY - p.y) * (mouseY - p.y));

    //If the distance is less than or equal to the player's radius, collision detected
    if (d <= p.r){
        
    }

    //#endregion
});

//#endregion

//Main
let p = new Player(250, 250);
objects.push(p);
draw();