document.getElementById('input_math').oninput = calcScore;
document.getElementById('input_heb').oninput = calcScore;
document.getElementById('input_eng').oninput = calcScore;

//Math and hebrew get each a weight of 40% and English 20%
function calcScore(){
  //returns a float[0~1]
  function lerp(min, max, value){
    if (value < min || value > max)
      return undefined;

    return (value - min) / (max - min);
  }
  //returns a value, i.e: inv(200,800,1) => 800
  function invLerp(min, max, value){
    if (value < 0 || value > 1)
      return undefined;

      if (value == 0)
        return min;
      if (value == 0.5)
        return (min + max) / 2;
      else
        return (min * (1 - value)) + (max * value);
  }

  let math = lerp(50, 150, document.getElementById('input_math').value);
  let heb = lerp(50, 150, document.getElementById('input_heb').value);
  let eng = lerp(50, 150, document.getElementById('input_eng').value);

  let x = (math * 40/100) + (heb * 40/100) + (eng * 20/100);
  let score = invLerp(200, 800, x).toFixed();
  if (isNaN(score))
    document.getElementById("score").innerHTML = "???";
  else
    document.getElementById("score").innerHTML = score;
}

function initialize(){
  document.getElementById('input_math').value = 150;
  document.getElementById('input_heb').value = 150;
  document.getElementById('input_eng').value = 150;
  calcScore();
}

initialize();
