// === 1. DOM ELEMENTS ===
// These are all the elements we interact with in the HTML — buttons, input fields, display containers, etc.
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
const endScreen = document.getElementById("endScreen");
const outcomeResult = document.getElementById("outcomeResult");
const outcomeText = outcomeResult.querySelector("p.text-white");
// const faceOutcomeBtn = document.getElementById("faceOutcomeBtn");

// === 2. STATE VARIABLES ===
// These track the current game state: rooms, which room you're on, lives (batTokens), the current riddle, and the countdown timer.
let rooms = [];
let currentRoomIndex = 0;
let batTokens = 3;
let currentRiddle = null;
let timerInterval = null; 
let timeLeft = 120; // 120 seconds per room 

// === 3. EVENT LISTENERS ===
// These trigger the main game functions when the page loads or when the player clicks buttons.
document.addEventListener("DOMContentLoaded", () => {
  start.addEventListener("click", startGame);
  guide.addEventListener("click", showHowToPlay);
  submitAnswerBtn.addEventListener("click", handleAnswerSubmit);
  document.getElementById("restartGameBtn").addEventListener("click", restartGame);
  // Load game data

  const muteBtn = document.getElementById("muteBtn");
  muteBtn.addEventListener("click", () => {
    bgMusic.muted = !bgMusic.muted;
    muteBtn.textContent = bgMusic.muted ? "Unmute" : "Mute";
  });

  
  loadGameData();
});

// === 4. MAIN FUNCTIONS ===
// loadGameData(): Fetches and shuffles room data from rooms.json to set up the game structure.
function loadGameData() {
  fetch("data/rooms.json")
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

// startGame(): Initializes game state and loads the first room.
function startGame() {
  // Reset game state
  currentRoomIndex = 0;
  batTokens = 3;
  timeLeft = 120;
  updateBatTokens();
  
  // Show game screen
  intro.style.display = "none";
  gameScreen.style.display = "block";

  // Play background music
  bgMusic.play().catch(err => console.warn("Autoplay blocked until user interacts."));

  // Start first room
  loadRoom(currentRoomIndex);
  timeLeft = 120;
  startTimer();
} 

// loadRoom(index): Displays the room details and resets UI elements for the new room.
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

  riddleSection.classList.add("hidden");
  riddleBox.style.display = "none";
  // Moved for clarity: clear riddleText after hiding section
  riddleText.textContent = "";
  riddleInput.value = "";
  riddleInput.style.display = "none";
  submitAnswerBtn.style.display = "none";
  feedback.textContent = "";

  timeLeft = 120;
  startTimer();

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

// displayChoices(choicesArray): Dynamically creates and shows buttons for the player's choices in the current room.
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
        textLog.innerHTML += `<p class="text-yellow-300 font-semibold mt-4 border-l-4 border-yellow-400 pl-3 italic">🧠 ${choice.result}</p>`;        // feedback.textContent = choice.result; 
       // feedback.style.color="white";
        console.log("Choice riddles:", choice.riddles);
    const riddle = choice.riddles[Math.floor(Math.random() * choice.riddles.length)];
    currentRiddle = riddle; 

    riddleSection.classList.remove("hidden");
        riddleBox.style.display = "block";
        riddleText.textContent = riddle.question; 
        riddleInput.style.display = "block"; 
        submitAnswerBtn.style.display = "block";
    
        choices.style.display = "none";
    })
        choices.appendChild(btn);
    });
}

// startTimer(): Starts a countdown for the room. If time runs out, the player loses a BatToken.
function startTimer() {
    clearInterval(timerInterval); // clear any previous timer 
    timerDisplay.style.display = "block"
    timerDisplay.textContent = `${timeLeft} seconds`;

timerInterval = setInterval(() => {
    timeLeft--; 
    timerDisplay.textContent = `${timeLeft} seconds`; 

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        batTokens--;
        updateBatTokens();

        if (batTokens <= 0) {
            feedback.textContent = "Time’s up! The Riddler escapes ... Gotham is doomed.";
            feedback.style.color = "red";
            setTimeout(() => {
                endGame(false);
            }, 1000);
        } else {
            feedback.textContent = "Time’s up! You’ve lost a BatToken!";
            feedback.style.color = "orange";
            setTimeout(() => {
                loadRoom(currentRoomIndex);
            }, 2000);
        }
    }
}, 1000); 
}

// handleAnswerSubmit(): Compares the player's answer to the correct answer and handles success or penalty logic.
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
        updateBatTokens();

        if (batTokens <= 0) {
          feedback.textContent = "❌ The Riddler has escaped... Gotham is doomed.";
          setTimeout(() => {
            endGame(false);
          }, 1000); // short delay for dramatic effect
          return; // <- stops any further logic
        }
        feedback.textContent = `WRONG !! ...`;
        feedback.style.color = "red";
    }
}

// updateBatTokens(): Visually updates the BatTokens displayed on the screen using icons and fade effects.
function updateBatTokens() {
  batTokenDisplay.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const bat = document.createElement("span");
    bat.textContent = "🦇";
    bat.className = "text-yellow-300 text-2xl transition-opacity duration-700 ease-in-out";

    if (i >= batTokens) {
      bat.classList.add("opacity-0");
    }

    batTokenDisplay.appendChild(bat);
  }
}

// shuffleArray(): Randomizes the order of an array. Used to shuffle the rooms.
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// showHowToPlay(): Displays a popup with the game instructions.
function showHowToPlay() {
    alert("You must escape 5 villainous rooms to catch the Riddler. Each room contains a deadly trap and a riddle. You have 120 seconds per room ... and only 3 BatTokens. Choose wisely, Batman. Good luck!");}

// === END GAME AND RESTART ===
// endGame(win): Hides the game and shows the end screen based on whether the player won or lost.
function endGame(win) {
    console.log("Game ended. Win status:", win, "Remaining BatTokens:", batTokens);
    clearInterval(timerInterval);
    gameScreen.style.display= "none"; 
    endScreen.classList.remove("hidden"); 

    riddleSection.classList.add("hidden");
    riddleInput.style.display = "none";
    submitAnswerBtn.style.display = "none";
    
    // faceOutcomeBtn.style.display = "block";
    // new update 
    const faceOutcomeBtn = document.getElementById("faceOutcomeBtn");

    if (faceOutcomeBtn) {
      faceOutcomeBtn.style.display = "block";
    }
    outcomeResult.classList.add("hidden");

    // if (faceOutcomeBtn && faceOutcomeBtn.parentNode) {
      const faceOutcomeBtnParent = faceOutcomeBtn && faceOutcomeBtn.parentNode ? faceOutcomeBtn.parentNode : null;
      if (faceOutcomeBtn && faceOutcomeBtnParent) {
      const newBtn = faceOutcomeBtn.cloneNode(true);
      // faceOutcomeBtn.parentNode.replaceChild(newBtn, faceOutcomeBtn);
      faceOutcomeBtnParent.replaceChild(newBtn, faceOutcomeBtn);

      newBtn.addEventListener("click", () => {
        newBtn.style.display = "none";
        outcomeResult.classList.remove("hidden");
        outcomeText.textContent = batTokens > 0
          ? "You have caught the Riddler. Gotham is safe ... for now"
          : "The Riddler has escaped. Gotham is DOOMED!";
      });
    } else {
      console.warn("faceOutcomeBtn not found in DOM.");
    }
}

// restartGame(): Resets all game values and UI so the player can replay from the start.
function restartGame() {
  currentRoomIndex = 0;
  batTokens = 3;
  timeLeft = 120;
  updateBatTokens();

  endScreen.classList.add("hidden");
  intro.style.display = "block";
  gameScreen.style.display = "none";

  textLog.innerHTML = "";
  roomTracker.textContent = "";
  riddleText.textContent = "";
  feedback.textContent = "";
  riddleInput.value = "";

  riddleSection.classList.add("hidden");
  riddleInput.style.display = "none";
  submitAnswerBtn.style.display = "none";

  faceOutcomeBtn.style.display = "none";
  outcomeResult.classList.add("hidden");
}

// === 6. CLASS DEFINITIONS ===
// Room class: Creates a room object from data with name, villain, description, and choices.
class Room {
  constructor(name, villain, description, choices) {
    this.name = name;
    this.villain = villain;
    this.description = description;
    this.choices = choices;
  }
}

// audio feature 

const bgMusic = document.getElementById("bgMusic");

 