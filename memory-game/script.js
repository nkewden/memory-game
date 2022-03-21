// global constants
const cluePauseTime = 250; //the time difference between clues
const len = 4;
const nextClueWaitTime = 1000; //time until playback of clue sequence

//Global Variables
var pattern = [2, 6, 4, 3, 2, 5, 2, 4, 5, 3]; //stores secret pattern of button presses
var progress = 0; //stores how far along the player is guessing the pattern
var clueHoldTime = 300; //how long each clue plays for 
var gamePlaying = false; //boolean: if game is active
var tonePlaying = false;
var volume = 0.7;  
var guessCounter = 0;
var mistakes = 0;
var count = 10;
var reset = false;
let timer = null;

//this function initialize game variables
function startGame(){
  progress = 0;
  gamePlaying = true;
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

//this function swaps the Start and Stop buttons
function stopGame(){
  gamePlaying = false;
  document.getElementById("stopBtn").classList.add("hidden");
  document.getElementById("startBtn").classList.remove("hidden");
}

function generatePattern() {
  for (let j = 0; j < len; j++) {
    pattern[j] = Math.ceil(Math.random() * 4);
  }
}

// Sound Synthesis Functions
const freqMap = {
  1: 130.4,
  2: 455.2,
  3: 309.3,
  4: 530.2,
  5: 253.5,
  6: 633.8
  
}
function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  context.resume()
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}
function startTone(btn){
  if(!tonePlaying){
    context.resume()
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    context.resume()
    tonePlaying = true
  }
}
function stopTone(){
  g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
  tonePlaying = false
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext 
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)

function lightButton(btn){
  document.getElementById("button"+btn).classList.add("lit")
}
function clearButton(btn){
  document.getElementById("button"+btn).classList.remove("lit")
}

function playSingleClue(btn){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn,clueHoldTime);
    setTimeout(clearButton,clueHoldTime,btn);
  }
}

function playClueSequence(){
  guessCounter = 0;
  let delay = nextClueWaitTime; //set delay to initial wait time
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]) // set a timeout to play that clue
    delay -= clueHoldTime 
    delay += cluePauseTime;
  }
  clueHoldTime -= 100;
  count = 10;
  reset = false;

  clearInterval(timer);
  timer = setInterval(Timer, 1000);
}

//decreases the count every one second
function Timer() {
    document.getElementById("clock").innerHTML =
      "Countdown: " + count + " s";
    count -= 1; 
    if (count < 0 || reset) {
      if(!reset) {
        stopGame(); 
        alert("Time is up. You lost.");
      }
      resetTimer();
      clearInterval(timer);
    }
}
function resetTimer(){
  count = 10;
  document.getElementById("clock").innerHTML = "Countdown: 0 s";
}



function loseGame(){
  stopGame();
  alert("Game Over. You lost.");
}

function winGame(){
  stopGame();
  alert("Game Over. You Won!");
}

//logic function to check each guess 
function guess(btn) {
  console.log("user guessed: " + btn);
  if (!gamePlaying) {
    return;
  }

  // add game logic here
  if (btn === pattern[guessCounter]) {
    if (guessCounter === progress) {
      if (progress === pattern.length - 1) {
        winGame(); //You win game
        reset = true;
      } else {
        //Pattern correct next segment
        progress++;
        playClueSequence();
      }
    } else {
      guessCounter++; //checking next guess
    }
  } else {
    //guess wrong
    mistakes++;
    if (mistakes === 3) {
      loseGame(); // You Lose game
      reset = true;
    } else {
      alert("Wrong! Attempts left:" + (3 - mistakes));
    }
  }
}

