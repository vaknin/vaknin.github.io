//#region Canvas
let canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext('2d');
//#endregion

//#region Global variables
let mouseX, mouseY;
let objects = [];
let units = [];
let selectedUnits = [];
let CTRL = false;

const background = 'teal';
//#endregion

//#region Classes

class Unit{
    constructor(x, y, r){
        this.x = x;
        this.y = y;
        this.r = r;
        this.selected = false;
    }

    draw(){

        //Selection effect
        if (this.selected){
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r + 4, 0, Math.PI * 2, true);
            ctx.fillStyle = 'blue';
            ctx.fill();   
            ctx.closePath();
        }
        
        //Draw the unit
        ctx.beginPath();
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
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    objects.forEach(obj => {
        obj.draw();
    });
}

setInterval(() => {
    console.log(selectedUnits.length, `ctrl: ${CTRL}`);
}, 500);

//#endregion

//#region Input (clicks, keypresses, etc.)

//Mouse right-click
document.addEventListener('contextmenu', e => {

    e.preventDefault();
    

    //Right click
    if (e.button == 2){
    }

    else if (e.button == 0){
        leftClick(e);
    }
});

//Mouse left-click
document.addEventListener('click', e => {
    leftClick(e);
});

function leftClick(e){
    
    //Update cursor position
    mouseX = e.clientX;
    mouseY = e.clientY;

    //#region Detect cursor collision with units

    //Search for collision with any ally unit
    for (let i = 0; i < units.length; i++){

        //The unit to check collision with
        let u = units[i];

        //Distance between the cursor and the unit
        let d = Math.sqrt((mouseX - u.x) * (mouseX - u.x) + (mouseY - u.y) * (mouseY - u.y));

        //If the distance is less than or equal to the unit's radius, collision detected
        if (d <= u.r){

            //If there are already units selected
            if (selectedUnits.length > 0){

                //CTRL is pressed
                if (CTRL){

                    //The unit is not selected, add the clicked unit to the selected units 
                    if (!u.selected){
                        select(u, true);
                        return;
                    }

                    //The unit is already selected, remove it from the selected units
                    else{
                        select(u, false);
                        return;
                    }
                }

                //CTRL is not pressed
                else{
                    
                    //The only selected unit is clicked, deselct it
                    if (selectedUnits.length == 1 && selectedUnits[0] == u){
                        select(u, false);
                        return;
                    }

                    //The unit is not selected, deselect all units but this one
                    deselectAll();
                    select(u, true);
                    return;
                }
            }

            //No units are selected - Select the unit
            else{
                select(u, true);
                return;
            }
        }
    }

    //#endregion

    //Deselect all units - if clicked on the ground, etc.
    deselectAll();
}


document.addEventListener('mousemove', e => {

    //Update cursor position
    mouseX = e.clientX;
    mouseY = e.clientY;
});

//Press a key
document.addEventListener('keydown', e => {

    //Ctrl
    if (e.which == 17){
        CTRL = true;
    }

    //D key (Debug)
    else if (e.which == 68){
        let u = new Unit(mouseX, mouseY, 25);
        objects.push(u);
        units.push(u);
    }
});

//Release the key
document.addEventListener('keyup', e => {

    //Ctrl
    if (e.which == 17){
        CTRL = false;
    }
});

//#endregion

//#region Game Mechanics

//Select/Deselect a unit
function select(unit, state){

    //Select the unit
    if (state){
        unit.selected = true;
        selectedUnits.push(unit);
    }

    //Deselect the unit
    else{
        unit.selected = false;
        selectedUnits.splice(selectedUnits.indexOf(unit));
    }
    
}

function deselectAll(){
    selectedUnits.forEach(u => {
        u.selected = false;
    });
    selectedUnits = [];
}

//#endregion

//#region Helper functions

//js equivalent of thread.sleep
function sleep(ms){
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

//#endregion

//Main
draw();