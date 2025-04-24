// === 1. DOM ELEMENTS ===
const start = document.getElementById("startGameBtn");
const guide = document.getElementById("howToPlayBtn");
const intro = document.getElementById("intro");
const gameScreen = document.getElementById("gameScreen");
const roomTracker = document.getElementById("roomTracker");
const textLog = document.getElementById("textLog");
const riddleBox = document.getElementById("riddleBox");
const riddleText = document.getElementById("riddleText");
const riddleInput = document.getElementById("riddleInput");
const submitAnswerBtn = document.getElementById("submitAnswer");
const feedback = document.getElementById("feedback");
const choices = document.getElementById("textChoice");
const timerDisplay = document.getElementById("timer");
const batTokenDisplay = document.getElementById("batTokenDisplay");

// === 2. STATE VARIABLES ===
let rooms = [];
let currentRoomIndex = 0;
let batTokens = 3;
let currentRiddle = null;
let timerInterval = null; 
let timeLeft = 60; // 60 seconds per room 

// === 3. EVENT LISTENERS ===
document.addEventListener("DOMContentLoaded", () => {
  start.addEventListener("click", startGame);
  guide.addEventListener("click", showHowToPlay);
  submitAnswerBtn.addEventListener("click", handleAnswerSubmit);
  
  // Load game data
  loadGameData();
});

// === 4. MAIN FUNCTIONS ===
function loadGameData() {
  fetch("rooms.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to load game data');
      }
      return response.json();
    })
    .then((data) => {
      rooms = shuffleArray(data);
      if (rooms.length === 0) {
        throw new Error('No rooms found in game data');
      }
    })
    .catch((error) => {
      console.error("Error loading game data:", error);
      textLog.innerHTML = "<p>Failed to load game data. Please try again later.</p>";
    });
}

function startGame() {
  // Reset game state
  currentRoomIndex = 0;
  batTokens = 3;
  timeLeft = 60;
  updateBatTokens();
  
  // Show game screen
  intro.style.display = "none";
  gameScreen.style.display = "block";
  
  // Start first room
  loadRoom(currentRoomIndex);
  startTimer();
} 

function loadRoom(index) {
  if (index >= rooms.length) {
    endGame(true); // Player won
    return;
  }

  const roomData = rooms[index];
  const room = new Room(
    roomData.room,
    roomData.villain,
    roomData.description,
    roomData.choices
  );

  // Update UI
  roomTracker.textContent = `${room.name} - ${room.villain}`;
  textLog.innerHTML = `<p>${room.description}</p>`;
  
  displayChoices(room.choices);
  
  intro.style.display = "none";
  gameScreen.style.display = "block";
  riddleInput.value = "";
  feedback.textContent = "";

  currentRiddle = null;

  console.log("Room choices:", room.choices);
}

function displayChoices(choicesArray){
    choices.innerHTML =""; 
    choices.style.display = "flex"; 
    riddleBox.style.display = "none"; 
    riddleInput.style.display = "none"; 
    submitAnswerBtn.style.display = "none"; 

    choicesArray.forEach(choice => {

        const btn = document.createElement("button"); 
        btn.textContent = choice.text;
        btn.className = "flex-1 bg-black bg-opacity-50 text-white px-6 py-4 rounded-xl border border-green-700 shadow-md hover:bg-green-800 transition-all duration-200 ease-in-out text-lg font-semibold";
   
    btn.addEventListener("click", () => {
        feedback.textContent = choice.result; 
        feedback.style.color="yellow";
    
    const riddle = choice.riddles[Math.floor(Math.random() * choice.riddles.length)];
    currentRiddle = riddle; 

        riddleBox.style.display = "block";
        riddleText.textContent = riddle.question; 
        riddleInput.style.display = "block"; 
        submitAnswerBtn.style.display = "block";
    
        choices.style.display = "none";
    })
        choices.appendChild(btn);
    });
}

function handleAnswerSubmit() {
    
    const userAnswer = riddleInput.value.trim().toLowerCase(); 
    const correctAnswer = currentRiddle.answer.trim().toLowerCase(); 
    riddleInput.value = ""; // clears previous input
    
        if(userAnswer === correctAnswer) {
            feedback.textContent = "Correct, Batman! go to the next room";
            feedback.style.color = "lime"; 

            currentRoomIndex++; 
        
        setTimeout(() => {
           loadRoom(currentRoomIndex); 
        }, 1000);
    } else {
        batTokens--; 

        if (batTokens <= 0) {
          feedback.textContent = "❌ The Riddler has escaped... Gotham is doomed.";
          endGame(false);
          return; // <- stops any further logic
        }
        feedback.textContent = `WRONG !! ...`;
        feedback.style.color = "red";
    }
}

        







function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}



// === 6. CLASS DEFINITIONS ===
class Room {
  constructor(name, villain, description, choices) {
    this.name = name;
    this.villain = villain;
    this.description = description;
    this.choices = choices;
  }
}
  