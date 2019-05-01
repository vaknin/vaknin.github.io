//#region Globals

let objects = [];


//#endregion

//#region Canvas

//Game aspect ratio
const aspectRatio = 16 / 9;

let canvas = document.getElementById('canvas');
initializeCanvas();
let ctx = canvas.getContext('2d');

//Set the canvas height accoarding to the desired aspect ratio
function initializeCanvas(){

    canvas.width = window.innerWidth;
    let height = window.innerHeight;
    let currentAspectRatio = window.innerWidth / window.innerHeight;
    let diff = aspectRatio > currentAspectRatio ? -1 : 1;

    //Get canvas height
    while (true){

        //Once reached the desire aspect ratio, set the canvas to that size and break
        if ((canvas.width / height).toFixed(2) == aspectRatio.toFixed(2)){
            canvas.height = height;
            break;
        }
        
        //Keep incrementing/decrementing the height until it reaches the desire ratio
        else{
            height += diff;
        }
    }
}

//#endregion

//#region Grid

let grid = [];

//#endregion

//#region Functions

//Draw on the canvas every frame
function draw(){

    //Execute every frame
    requestAnimationFrame(draw);

    //Erase last frame
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0, canvas.width, canvas.height);

    //Draw the frame
    objects.forEach(object => {
        object.draw();
    });

    //Debug bg
    ctx.fillStyle = 'teal';
    ctx.fillRect(0,0, canvas.width, canvas.height);
}

//Main function
function main(){
    draw();
}

//#endregion

//#region Events

//Keydown listener
document.addEventListener('keydown', e => {

//    console.log(e.which);

    //Variables
    let D = e.which == 68;

    //D key
    if (D){
    }
    
});

//#endregion

main();