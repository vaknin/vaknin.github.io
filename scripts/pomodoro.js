/*
Pomodoro Timer:
The application is used to enhance the studying experience, study for 25 minutes
and then take a small break(3~5 minutes), after 4 small breaks, take a larger break(20-30 minutes)
Features/Todo:
- Let the user pick the amount of time for a pomodoro session and for breaks
- Visual cue for remaining time
- Set a toggle for infinite alarm
- Alarm volume
- Rainy mood[embed youtube to conserve size]
*/

let alarm = new Audio("../sounds/alarm.wav");
let cycles = 1;
let bigBreak = false;

function minuteToMs(min){
	return min * 60000;
}

function pomodoro(){
	console.log(`New pomodoro started, cycle number ${cycles}`);
	setTimeout(endCycle, minuteToMs(25));
}

function endCycle(){
	alarm.play();

	if (cycles == 4){
		bigBreak = true;
	}

	cycles++;
	takeBreak(bigBreak);
}

function takeBreak(big){
	if (big){
		cycles = 1;
		bigBreak = false;
		setTimeout(pomodoro, minuteToMs(30));
		console.log(`yo take a break for 30 min`);
	}

	else{
		setTimeout(pomodoro, minuteToMs(5));
		console.log(`yo take a break for 5 min`);
	}

	
}

pomodoro();