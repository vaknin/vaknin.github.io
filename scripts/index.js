//#region Overview:
//Todo:
//#endregion

//#region Classes

//Button class: the element is an 'a' tag, hover is a boolean that
// specifies if the button is currently being hovered
class Button{
    constructor(element, hover){
        this.element = element;
        this.hover = hover;
    }
}

//#endregion

//#region Global Variables

//Save the buttons into an object
let img_sampler = document.getElementById("image_sampler");
let img_psycho = document.getElementById("image_psycho");
let img_pomodoro = document.getElementById("image_pomodoro");
let img_algebro = document.getElementById("image_algebro");
let img_chat = document.getElementById("image_chat");
let img_chess = document.getElementById("image_chess");
let img_turret = document.getElementById("image_turret");

//Make an array of buttons that includes the element object and it's id
let btn_sampler = new Button(document.getElementById("img_sampler"), false);
let btn_psycho = new Button(document.getElementById("img_psycho"), false);
let btn_pomodoro = new Button(document.getElementById("img_pomodoro"), false);
let btn_algebro = new Button(document.getElementById("img_algebro"), false);
let btn_chess = new Button(document.getElementById("img_chess"), false);
let btn_turret = new Button(document.getElementById("img_turret"), false);
let btn_chat = new Button(document.getElementById("img_chat"), false);
let btn_phone = new Button(document.getElementById("img_phone"), false);
let btn_email = new Button(document.getElementById("img_email"), false);

let btns = [btn_sampler, btn_psycho, btn_chat, btn_pomodoro, btn_algebro, btn_chess, btn_turret, btn_phone, btn_email];

//Animate each buttons
btns.forEach(b => {
    prepareButton(b);
});

//Dark/Light themes
let darkTheme = false;
let wrappers = document.getElementsByClassName('wrapper');
let borders = document.getElementsByClassName('border');
let header = document.getElementById('header');

//Header onClick causes theme toggle
header.onclick = toggleTheme;

//Mobile variable used for checking the user's platform(Mobile/Desktop)
let mobile = new Boolean;

//variable for changing themes

//#endregion

//#region Button animations
function toggleHoverImage(btn){

    //Button is in hover state - change to regular image
    if(btn.hover){
        btn.element.setAttribute("src", `/images/${btn.element.id.slice(4)}.png`);
    }

    //Button is not in hover state - change to hover image
    else{
        
        btn.element.setAttribute("src", `/images/${btn.element.id.slice(4)}_hover.png`);
    }

    btn.hover = !btn.hover;
}

async function prepareButton(b){
    setInterval(async function(){
        toggleHoverImage(b);
        await sleep(700);
        toggleHoverImage(b);
    }
    , 1400);
    await sleep(250);
}

//#endregion

//#region Helper methods

//Thread.Sleep equivalent 
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}
//#endregion

//#region Light/Dark themes

function toggleTheme(){
    //Change to light-theme
    if(darkTheme){
        for(let i = 0; i < wrappers.length; i++){
            wrappers[i].style.backgroundColor = "rgba(255, 255, 255, 0.4)";
        }
        for(let i = 0; i < borders.length; i++){
            borders[i].style.borderRight = "#666 solid 1px";
        }
        header.style.color = "rgba(68, 63, 63, 0.849)";
    }

    //Change to dark-theme
    else{
        for(let i = 0; i < wrappers.length; i++){
            wrappers[i].style.backgroundColor = "rgba(0, 0, 0, 0.35)";
        }
        for(let i = 0; i < borders.length; i++){
            borders[i].style.borderRight = "#EEE solid 1px";
        }
        header.style.color = "rgba(0, 0, 0, 0.753)";
    }

    darkTheme = !darkTheme;
}

//#endregion