//#region Globals

//#region Canvas

let canvas = document.getElementById('canvas');
let canvasW = window.innerWidth * 0.85; 
let canvasH = window.innerHeight * 0.85;
canvas.width = canvasW;
canvas.height = canvasH;
let ctx = canvas.getContext('2d');
let cx = canvas.getBoundingClientRect().x;
let cy = canvas.getBoundingClientRect().y;

//#endregion

//#endregion