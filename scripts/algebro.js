//#region Variables
//Inputs
let question = document.getElementById('question');
let input = document.getElementById('input');
let scoreElement = document.getElementById('score');
let streakElement = document.getElementById('streak');
let highscoreElement = document.getElementById('highscore');
let livesElement = document.getElementById('lives');
let timeElement = document.getElementById('time');
let competitiveElement = document.getElementById('competitive');
let label_competitive = document.getElementById('label_comp');
let slider_setTime = document.getElementById('setTime');
let label_setTime = document.getElementById('label_setTime');
let div_setTime = document.getElementById('div_setTime');
let btn_start = document.getElementById('btn_start');
let btn_mute = document.getElementById('btn_mute');


//Radio buttons - Change mode
let radioMulti = document.getElementById('multi');
let radioPowers = document.getElementById('powers');
let radioAddition = document.getElementById('addition');
let radioSubtraction = document.getElementById('subtraction');
radioMulti.checked = true;
let mode = "multi";

let score = 0, highscore = 0, streak = 1, lives = 3, time = 7, competitive = false, started = false, muted = true;
let lastNumber, answer, timer, secondInterval;
let majorChords, minorChords, lastChord, playedChords;

//Range(i.e: if min=1 and max=10, you can get any exercise between the two numbers, i.e 2x6, 1x10, 9^2, but not 11*2)
let min = 1;
let max = 10;
let inputMin = document.getElementById('min');
let inputMax = document.getElementById('max');
inputMin.value = min;
inputMax.value = max;

competitiveElement.checked = false;
label_setTime.innerHTML = `זמן לשאלה: ${time}`;
slider_setTime.value = time;
soundManager();

//#endregion

//#region Events

//Input min max event listener
function onMinMaxChanged(e){
    //If the value of the input is empty or not a number, ignore it
    if (isNaN(e.target.value) || e.target.value == "" || e.target.value == undefined){
        return;
    }

    switch(e.target){
        case inputMin:
        min = inputMin.value;
        break;

        case inputMax:
        max = inputMax.value;
        break;
    }
    
    highscore = 0;
    highscoreElement.innerHTML = `ניקוד שיא: ${highscore}`;
}

//Change mode
function onRadioChanged(e){
    mode = e.target.id;
    highscore = 0;
    highscoreElement.innerHTML = `ניקוד שיא: ${highscore}`;
    if (started)
        getExercise();
}

//Competitive mode(Scores, lives, time)
function onCompetitiveCheck(e){
    //Enable competitive mode
    if(e.target.checked){
        competitive = true;
        scoreElement.style.display = "inline";
        highscoreElement.style.display = "inline";
        streakElement.style.display = "inline";
        livesElement.style.display = "inline";
        timeElement.style.display = "inline";
        slider_setTime.value  = time;
        timeElement.max = time;
        timeElement.value = time;
        label_setTime.innerHTML = `זמן לשאלה: ${time}`;
        initializeCompetitiveValues();
        if (started){
            input.focus();
            startCounting();
            disableMenuButtons(true);
        }
    }

    //Disable competitive mode
    else{
        competitive = false;
        scoreElement.style.display = "none";
        highscoreElement.style.display = "none";
        streakElement.style.display = "none";
        timeElement.style.display = "none";
        livesElement.style.display = "none";
        clearInterval(timer);
        disableMenuButtons(false);
    }
}

//Mute and unmute
function onMute(){
    muted = !muted;

    //Mute audio
    if (muted){
        btn_mute.innerHTML = "מושתק";
    }

    //Unmute
    else{
        btn_mute.innerHTML = "השתק";
    }
}

//Listen for 'Enter' keypress to accept answer
document.addEventListener('keypress', function(event){
    if (event.keyCode == 13){
        checkAnswer();
    }
});

radioMulti.addEventListener('change', onRadioChanged);
radioPowers.addEventListener('change', onRadioChanged);
radioAddition.addEventListener('change', onRadioChanged);
radioSubtraction.addEventListener('change', onRadioChanged);
inputMin.addEventListener('input', onMinMaxChanged);
inputMax.addEventListener('input', onMinMaxChanged);
competitiveElement.addEventListener('change', onCompetitiveCheck);
slider_setTime.addEventListener('mouseup', function (){
    time = slider_setTime.value;
    timeElement.max = time;
    timeElement.value = time;
});
slider_setTime.addEventListener('input', function (){
    label_setTime.innerHTML = `זמן לשאלה: ${slider_setTime.value}`;

});

btn_start.addEventListener('click', start);
btn_mute.addEventListener('click', onMute);

//#endregion

//#region Exercise mechanics
//Get a new exercise
function getExercise(){
    input.value = "";
    let n1 = 0, n2 = 0;
    //Generate a random number from the specified range
    while(true){
        n1 = Math.round(Math.random() * Number((max - min)) + Number(min));
        
        if (n1 != lastNumber || min - max == 0){
            lastNumber = n1;

            //Generate a second random number from the specified range, in case of subtraction avoid n1<n2
            while(true){
                n2 = Math.round(Math.random() * Number((max - min)) + Number(min));
                
                if (mode == "subtraction" && n1 < n2){
                    continue;
                }
                break;
            }
            break;
        }
    }

    //Do something with the two numbers accoarding to the current mode
    switch(mode){

    //Multiplication
    case "multi":
        answer = n1 * n2;
        question.innerHTML = `${n1.toString()} X ${n2.toString()}`;
        break;  

    //n1 to the power of itself(maybe others soon)
    case "powers":
        answer = n1 * n1;
        question.innerHTML = `${n1.toString()}²`;
        break;

    //Addition
    case "addition":
        answer = n1 + n2;
        question.innerHTML = `${n1.toString()} + ${n2.toString()}`;
        break;

    //Subtraction
    case "subtraction":
        answer = n1 - n2;
        question.innerHTML = `${n1.toString()} - ${n2.toString()}`;
        break;
    }
        
    //Time to solve (competitive mode only)
    if (competitive){
        startCounting();
    }
}

//Check if the answer is correct
function checkAnswer(){
    //Empty input
    if (input.value == ""){
        return;        
    }

    //Correct
    if (answer == input.value){

        //Competitive mode only
        if (competitive){            
            score += 1 * streak;
            if (score > highscore){
                highscore = score;
                highscoreElement.innerHTML = `ניקוד שיא: ${highscore}`;
                animateHeader(highscoreElement, 350);
            }
            if (score % 10 == 0 && streak <= 8){
                streak++;
                streakElement.innerHTML = `x${streak} :מכפיל`;
                animateHeader(streakElement, 200);
            }
            scoreElement.innerHTML = `ניקוד: ${score}`;
        }
        getExercise();
        if (!muted)
            playChord("Major");
    }

    //Incorrect
    else{
        input.value = "";
        if (!muted){
            for(let i = 0; i < 3; i++){
                playChord("Minor");
            }        
        }
        shake();
        
        //Competitive mode only        
        if (competitive){
            startCounting();
            lives--;
            livesElement.innerHTML = `${lives - 1} :נסיונות`;
            animateHeader(livesElement, 250);
            if (lives == 0){
                gameOver();
                return;
            }
            streak = 1;
            streakElement.innerHTML = `x${streak} :מכפיל`;
        }
    }
}

async function animateHeader(element, ms){
    element.style.fontSize = '5rem';
    await sleep(ms);
    element.style.fontSize = '4rem';
}

//Randomly play a chord
function playChord(type){

    if (majorChords.length == 0 || minorChords.length == 0){
        initializeChords();
    }

    //If the chord has already been played, stay in loop
    while (true){
        let c;
        switch(type){
            case "Major":
            c = majorChords;
            break;
            case "Minor":
            c = minorChords;
            break;
        }
        let n = c[Math.round(Math.random() * (c.length - 1))];
        
        //Chord hasn't been played yet
        if (n != undefined && playedChords.indexOf(n) == -1 && lastChord != n){
            lastChord = n;

            //Play the chord
            let note1 = new Audio(`../sounds/piano/${n[0]}.wav`);
            let note2 = new Audio(`../sounds/piano/${n[1]}.wav`);
            let note3 = new Audio(`../sounds/piano/${n[2]}.wav`);
            note1.play();
            note2.play();
            note3.play();

            //Remove it from the array, to not play it again
            let index = c.indexOf(n);
            c.splice(index, 1);
            playedChords.push(n);
            break;
        }
    }
}

//Pause execution for (ms) seconds
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

//Initialize minor and major chords, and put them inside appropriate arrays
function initializeChords(){

    //Major chords
    let Amajor = ["A", "Cs", "E"];
    let Bmajor = ["B", "Eb", "Fs"];
    let Cmajor = ["C", "E", "G"];
    let Dmajor = ["D", "Fs", "A"];
    let Emajor = ["E", "Gs", "B"];
    let Fmajor = ["F", "A", "C"];
    let Gmajor = ["G", "B", "D"];
    
    //Minor chords
    let Aminor = ["A", "C", "E"];
    let Bminor = ["B", "D", "Fs"];
    let Cminor = ["C", "Eb", "G"];
    let Dminor = ["D", "F", "A"];
    let Eminor = ["E", "G", "B"];
    let Fminor = ["F", "Gs", "C"];
    let Gminor = ["G", "Bb", "D"];

    majorChords = [Amajor, Bmajor, Cmajor, Dmajor, Emajor, Fmajor, Gmajor];
    minorChords = [Aminor, Bminor, Cminor, Dminor, Eminor, Fminor, Gminor];
    playedChords = [];
}

//Wrong answers shake the screen
async function shake(){
    let element = document.getElementById('question');
    let currentLeft = Number((getComputedStyle(element).left).slice(0, -2));
    let currentTop = Number((getComputedStyle(element).top).slice(0, -2));
    let intensity = Math.round(Math.random() * 60 + 15);
    let random1, random2;

    random1 = Math.round(Math.random());
    if (random1 == 0){
        random1 = -1;
    }

    random2 = Math.round(Math.random());
    if (random2 == 0){
        random2 = -1;
    }

    let newLeft = Number(currentLeft + (intensity * random1)) + "px";
    let newTop = Number(currentTop + (intensity * random2)) + "px";
    element.style.left = newLeft;
    element.style.top = newTop;
    await sleep(150);
    element.style.left = `${currentLeft}px`;
    element.style.top = `${currentTop}px`;
}

//Every second, decrease the slider value, when it reaches 0, exercise is over and 1 life is lost
function startCounting(){
    clearInterval(timer);
    timeElement.value = time;
    timer = setInterval(function(){
        timeElement.value -= 0.01;
        
        //Out of time
        if (timeElement.value <= 0){
            clearInterval(timer);
            timeElement.value = time;
            input.value = "";
            if (!muted){
                for(let i = 0; i < 3; i++){
                    playChord("Minor");
                }
            }
            shake();
            lives--;
            livesElement.innerHTML = `${lives - 1} :נסיונות`;
            animateHeader(livesElement, 250);
            if (lives == 0){
                gameOver();
                return;
            }
            streak = 1;
            streakElement.innerHTML = `x${streak} :מכפיל`;
            timeElement.value = time;
            getExercise();
        }

    }, 10);
}

//If the competitive checkbox is checked, call this function(variables initialization)
function initializeCompetitiveValues(){
    lives = 3;
    livesElement.innerHTML = `${lives - 1} :נסיונות`;
    score = 0;
    scoreElement.innerHTML = `ניקוד: ${score}`;
    highscoreElement.innerHTML = `ניקוד שיא: ${highscore}`;
    streak = 1;
    streakElement.innerHTML = `x${streak} :מכפיל`;
}

//#endregion

//#region Game Manager

//Load sounds at the start of the game to avoid loading time
function soundManager(){
    initializeChords();
    let chords = majorChords.concat(minorChords);
    chords.forEach(chord => {
        chord.forEach(note => {
            new Audio(`../sounds/piano/${note}.wav`);
            //audio.volume = 0;
            //audio.play();
        });
    });
    onMute();
}

//disable
function disableMenuButtons(state){
    slider_setTime.disabled = state;
    radioMulti.disabled = state;
    radioPowers.disabled = state;
    radioAddition.disabled = state;
    radioSubtraction.disabled = state;
    inputMin.disabled = state;
    inputMax.disabled = state;
}

//Start button onClick
function start(){
    started = true;
    if (competitive){
        initializeCompetitiveValues();
        timeElement.style.display = "inline";
        disableMenuButtons(true);
    }
    btn_start.style.display = "none";
    question.style.display = "inline";
    input.style.display = "inline";
    input.value = "";
    input.focus();
    initializeChords();
    getExercise();
}

//Stop the game (lives <= 0 or user decided to quit)
function gameOver(){
    clearInterval(timer);
    started = false;
    if (competitive){
        initializeCompetitiveValues();
        timeElement.style.display = "none";
        disableMenuButtons(false);
    }
    btn_start.style.display = "inline";
    question.style.display = "none";
    input.style.display = "none";
    input.value = "";
}

//#endregion

//