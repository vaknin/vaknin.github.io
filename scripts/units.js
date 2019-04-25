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

//Rect selection
let selecting = false;
let originX, originY;

//Consts
const background = 'teal';
const selectionRectColor = 'rgba(75, 75, 255, 0.35)';
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

    //Loop
    requestAnimationFrame(draw);

    //Draw background
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //Draw game objects
    objects.forEach(obj => {
        obj.draw();
    });

    //#region Rect selection

    if (selecting){

        //Rect size
        let w = Math.abs(originX - mouseX);
        let h = Math.abs(originY - mouseY);

        function drawRect(rotation, inverted){
            ctx.save();
            ctx.beginPath();
            ctx.translate(originX, originY);
            ctx.rotate(rotation);
            ctx.translate(originX*-1, originY*-1);
            ctx.fillStyle = selectionRectColor;

            //Switch between width and height
            if (inverted){
                ctx.fillRect(originX, originY, h, w);
            }

            //Simply draw the rect
            else{
                ctx.fillRect(originX, originY, w, h);
            }
            ctx.closePath();
            ctx.restore();
        }

        function rad(deg){
            return (deg * Math.PI) / 180;
        }

        //The origin point's X coordinate is bigger
        if (mouseX < originX){

            //Rotate 180 degrees
            if (mouseY < originY){
                drawRect(rad(180));
            }

            //Rotate 90 degrees
            else{
                drawRect(rad(90), true);
            }
        }

        //The origin point's X coordinate is smaller
        else{

            //No rotation needed
            if (mouseY > originY){
                drawRect(0);
            }
            
            //Rotate 270 degrees
            else{
                drawRect(rad(270), true);
            }
        }
    }

    //#endregion
}

//#endregion

//#region Input (clicks, keypresses, etc.)

//left click delegate
function leftClick(e){

    //Rect selection
    selecting = true;
    originX = mouseX;
    originY = mouseY;

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
}

//Mouse right-click
document.addEventListener('contextmenu', e => {

    //Disable right-click context menu
    e.preventDefault();

    //Right click
    if (e.button == 2){
    }

    //Left click + CTRL
    else if (e.button == 0){
        leftClick(e);
    }
});

//Stop rect selection and deselect on ground collision
document.addEventListener('mouseup', e => {

    //Rect selection
    rectSelect();
});

//Start rect selection
document.addEventListener('mousedown', e => {

    //Check whether control is pressed, in order to not execute the same function twice
    if (!CTRL){
        leftClick(e);
    }
});

//Triggers every time the cursor moves
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
        selectedUnits.splice(selectedUnits.indexOf(unit), 1);
    }
    
}

//Deselects all units
function deselectAll(){
    selectedUnits.forEach(u => {
        u.selected = false;
    });
    selectedUnits = [];
}

//After 'mouseup' call this function, and select all the units that were inside the rect
function rectSelect(){

    //Stop selection
    selecting = false;

    //If no move was made, return
    if (mouseX == originX && mouseY == originY){        
        return;
    }

    let minX = Math.min(mouseX, originX);
    let maxX = Math.max(mouseX, originX);
    let minY = Math.min(mouseY, originY);
    let maxY = Math.max(mouseY, originY);

    //CTRL was not pressed
    if (!CTRL){
        deselectAll();
    }

    //For each ally unit, check if it's inside the selection rect
    for (let i = 0; i < units.length; i++){
        
        let u = units[i];
        let insideX = (u.x >= minX - u.r) && (u.x <= maxX + u.r);
        let insideY = (u.y >= minY - u.r) && (u.y <= maxY + u.r);

        //The unit was inside the selection rect, select it
        if (insideX && insideY){
            select(u, true);
        }
    }
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