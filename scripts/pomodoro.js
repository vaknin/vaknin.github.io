//#region Overview
/*Pomodoro Timer:
The application is used to enhance the studying experience, study for 25 minutes
and then take a small break(3~5 minutes), after 4 small breaks, take a larger break(20-30 minutes)
Features/Todo:
- Let the user pick the amount of time for a pomodoro session and for breaks
- Set a toggle for infinite alarm
- Rainy mood button(volume too I guess)
*/
//#endregion

//#region Timer Class
/*The timer class recieves a time parameter as a string of 4 digits, 
then it slices it, the first two digits are the minutes,
and the last two digits are the seconds, such as: "MMSS"*/

class Timer{
	constructor(time){
		let minutes = time.slice(0,2);
		let seconds = time.slice(2,4);
		this.minutes = minutes;
		this.fixedMinutes = minutes;
		this.seconds = seconds;
		this.fixedSeconds = seconds;
		this.cycle = 0;
	}

	tick(timer){
		//Check if seconds are 00
		if (timer.seconds <= 0){
			timer.seconds = 0;
			//Check if minutes are 00:
			//Both minutes and seconds are 0 - cycle is complete
			if (timer.minutes <= 0){
				timer.minutes = 0;
				//Cycle completed
				clearInterval(interval);
				endCycle();
				return;
			}	
			//Minutes > 0, subtract 1 from minutes and add 59sec
			else{
				timer.minutes--;
				timer.seconds = 59;
			}
		}

		else{
			timer.seconds--;
		}

		clock.innerHTML = `${timer.minutes.toString().padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`;
	}

	//Execute the 'tick' function every 1sec
	startTicking(timer){
		clock.innerHTML = `${timer.minutes.toString().padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`;
		interval = setInterval(function(){
			timer.tick(timer);
		}, 1000);
	}
}
//#endregion

//#region Variables
let clock = document.getElementById('clock');
let txt_cycles = document.getElementById('cycles');
let tomato = document.getElementById('tomato');

let alarm = new Audio("../sounds/pomodoro/alarm.wav");


let inBreak = false;
let bigBreak = false;
let inSession = false;
let audioMuted = false;
let raining = false;
let interval;

//Buttons
let btn_start = document.getElementById('btn_start');
btn_start.onclick = startBtnOnClick;

let btn_break = document.getElementById('btn_break');
let breakInterval;

let btn_speaker = document.getElementById('btn_speaker');
let speakerInterval;
btn_speaker.onclick = speakerBtnOnClick;

let btn_rain = document.getElementById('btn_rain');
btn_rain.onclick = rainBtnOnClick;

let breakInitialized = false;

//#endregion

//#region Animations

//Changes between the 3 images of the button to create an animation
function animateButton(btn, animationLength, delay){

	let currentImage = 0;
	let growing = true;
	let img;

	if (btn == btn_break)
		breakInterval = setInterval(function(){changeImage(btn, animationLength);}, delay);
	else if (btn == btn_speaker)
		speakerInterval = setInterval(function(){changeImage(btn, animationLength);}, delay);
	//btn = btn_break etc. animationLength = number of images in the animation
	function changeImage(btn, animationLength){
	if (btn == btn_break){
		//Regular version of the image
		if (!inBreak){
			img = `url(/../images/Pomodoro/${btn.id.slice(4)}${currentImage}.png)`;
		}

		//Break version of the image
		else{
			img = `url(/../images/Pomodoro/${btn.id.slice(4)}${currentImage}_break.png)`;
		}
	}

	else{
		img = `url(/../images/Pomodoro/${btn.id.slice(4)}${currentImage}.png)`;
	}
		
		btn.style.backgroundImage = img;

		if (currentImage + 1 == animationLength){
			growing = false;
		}

		else if (currentImage == 0){
			growing = true;
		}
		if (growing) currentImage++;
		else currentImage--;
	}
}
//#endregion

//#region Cycle mechanics
function startCycle(){
	interval = setInterval(function(){
		pomodoro.tick(pomodoro);
	}, 1000);
}

function endCycle(){

	//Take a break
	if(!inBreak){
		takeBreak();
	}

	//Break is over - start a new studying session
	else{
		endBreak();
	}

	inBreak = !inBreak;
	alarm.play();
}
//#endregion

//#region Prevent mobile sleep

function disableSleep(){
	//If mobile - prevent sleep
	if (getWidth() < 1024){
		let noSleep = new Audio("../sounds/pomodoro/silence.wav");
		noSleep.loop = true;
		noSleep.play();	
	}
}

//#endregion

//#region Start button
function startBtnOnClick(){
	//Pause
	if (inSession){
		btn_start.style.backgroundImage = `url(/../images/Pomodoro/start.png)`;
		clearInterval(interval);
	}

	//Start
	else{
		//On the first run, initialize the break button, onclick event + img
		if (!breakInitialized)
			initializeBreakButton();

		btn_start.style.backgroundImage = `url(/../images/Pomodoro/pause.png)`;
		pomodoro.startTicking(pomodoro);
	}

	inSession = !inSession;

}

//#endregion

//#region Break button

//onClick event handler for the break button(coffee mug)
function breakBtnOnClick(){
	clearInterval(interval);
	pomodoro.minutes = 0;
	pomodoro.seconds = 0;
	pomodoro.tick(pomodoro);
	muteAlarmOnBreakClick();
}

//If the break button is pressed by the user, don't play the alarm
async function muteAlarmOnBreakClick(){
	if (!audioMuted){
		alarm.volume = 0;
		while(!alarm.paused){
			await sleep(500);
		}
		alarm.volume = 1;
	}
}

function takeBreak(){
	//Start button
	btn_start.style.backgroundImage = `url(/../images/Pomodoro/start_circle.png)`;
	btn_start.onclick = undefined;
	inSession = false;

	//Break button
	btn_break.style.backgroundImage = `url(/../images/Pomodoro/break1_break.png)`;

	//Tomato
	tomato.src = '../images/Pomodoro/tomato_break.jpg';

	//Take a big break every 4 cycles
	if ((pomodoro.cycle + 1)% 4 == 0){
		bigBreak = true;
	}
	let breakTime;

	//Take a big break
	if (bigBreak){
		bigBreak = false;
		breakTime = "3000";
	}

	//Take a small break
	else{
		breakTime = "0500";
	}

	let Break = new Timer(breakTime);
	Break.startTicking(Break);
}

//Start a new studying session
function endBreak(){
	//Start button
	inSession = true;
	btn_start.style.backgroundImage = `url(/../images/Pomodoro/pause.png)`;
	btn_start.onclick = startBtnOnClick;

	//Break button
	btn_break.style.backgroundImage = `url(/../images/Pomodoro/break1.png)`;

	//Tomato
	tomato.src = '../images/Pomodoro/tomato.jpg';

	pomodoro.minutes = pomodoro.fixedMinutes;
	pomodoro.seconds = pomodoro.fixedSeconds;
	pomodoro.startTicking(pomodoro);
	pomodoro.cycle++;
	updateUI();
}

function initializeBreakButton(){
	breakInitialized = true;
	btn_break.onclick = breakBtnOnClick;
	btn_break.style.backgroundImage = `url(/../images/Pomodoro/break1.png)`;
	animateButton(btn_break, 2, 750);
}

//#endregion

//#region Mute button

function speakerBtnOnClick(){
	//Mute audio
	if (!audioMuted){
		clearInterval(speakerInterval);
		btn_speaker.style.backgroundImage = `url(/../images/Pomodoro/speaker_mute.png)`;
		alarm.volume = 0;
	}

	//Unmute audio
	else{
		btn_speaker.style.backgroundImage = `url(/../images/Pomodoro/speaker1.png)`;
		animateButton(btn_speaker, 2, 1000, speakerInterval);
		alarm.volume = 1;
	}

	audioMuted = !audioMuted;
}

//#endregion

//#region Rain button

let rain = new Audio("../sounds/pomodoro/rain.mp3");
rain.loop = true;

function rainBtnOnClick(){

	//Start playing rain sounds
	if (!raining){
		btn_rain.style.backgroundImage = 'url(../images/Pomodoro/rain_break.png';
		rain.play();
	}

	else{
		btn_rain.style.backgroundImage = 'url(../images/Pomodoro/rain.png';
		rain.pause();
	}

	raining = !raining;
}

function loopRain(){

}

//#endregion

//#region Helper methods

function minuteToMs(min){
	return min * 60000;
}

function updateUI(){
	clock.innerHTML = `${pomodoro.minutes.toString().padStart(2, '0')}:${pomodoro.seconds.toString().padStart(2, '0')}`;
	txt_cycles.innerHTML = `Cycle : ${pomodoro.cycle + 1}`;
}

//Get screen width
function getWidth() {
	return Math.max(
	  document.body.scrollWidth,
	  document.documentElement.scrollWidth,
	  document.body.offsetWidth,
	  document.documentElement.offsetWidth,
	  document.documentElement.clientWidth
	);
}

//Thread.Sleep equivalent 
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

//#endregion

//#region Main method
animateButton(btn_speaker, 2, 1000);
let pomodoro = new Timer("2500");
updateUI();
disableSleep();
//#endregion
