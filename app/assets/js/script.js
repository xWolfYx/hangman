const body = document.body;

let incorrectGuessCount = 0;

body.innerHTML = `
<main id="main">
  <div id="container-div">
    <div id="gallows-div">
      <img id="gallows" src="./assets/images/gallows.png">
      <span id="counter-span">${incorrectGuessCount}</span>
    </div>
  </div>
  <div id="question-div">
    <p id="question"></p>
  </div>
  <div id="modal" style="display: none">
    <div id="modal-content">
    <p></p>
    <button id="restart-button"></button>
    </div>
  </div>
</main>
<div id="overlay" style="display: none"></div>
`;

const hangmanParts = [
  "",
  "./assets/images/1-head.png",
  "./assets/images/2-body.png",
  "./assets/images/3-hand-one.png",
  "./assets/images/4-hand-two.png",
  "./assets/images/5-leg-one.png",
  "./assets/images/6-leg-two.png",
];

const modal = document.getElementById("modal");
const overlay = document.getElementById("overlay");
const gallowsDiv = document.getElementById("gallows-div");
const counterSpan = document.getElementById("counter-span");
const restartButton = document.getElementById("restart-button");
restartButton.addEventListener("click", restartGame);

function showModal(message) {
  const modalContent = document.getElementById("modal-content");

  modalContent.querySelector("p").textContent = message;
  modal.style.display = "flex";
  overlay.style.display = "block";
}

function restartGame() {
  incorrectGuessCount = 0;

  modal.style.display = "none";
  overlay.style.display = "none";

  gallowsDiv.innerHTML = `
  <img id="gallows" src="./assets/images/gallows.png">`;
  gallowsDiv.append(counterSpan);
  counterSpan.textContent = incorrectGuessCount;

  const answerDiv = document.getElementById("answer-div");
  if (answerDiv) {
    answerDiv.remove();
  }

  const keyboardDiv = document.getElementById("keyboard");
  if (keyboardDiv) {
    keyboardDiv.remove();
  }

  fetchNewQuestion();
}

function fetchNewQuestion() {
  fetch("./assets/js/words.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch: " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      const main = document.getElementById("main");
      const questions = data.questions;
      const randomIndex = Math.floor(Math.random() * questions.length);
      const randomQuestion = questions[randomIndex];
      document.getElementById("question").textContent = randomQuestion.hint;

      const answerDiv = document.createElement("div");
      answerDiv.id = "answer-div";
      main.append(answerDiv);

      const word = randomQuestion.word.toUpperCase();
      console.log(`
---------------------------------
     For Debugging:
     Answer =====> ${word}
---------------------------------
`);
      const letterSpans = [];
      Array.from(word).forEach(() => {
        const letters = document.createElement("span");
        letters.textContent = "_";
        answerDiv.append(letters);
        letterSpans.push(letters);
      });

      const keyboardLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      const keyboardDiv = document.createElement("div");
      keyboardDiv.id = "keyboard";
      main.append(keyboardDiv);
      keyboardLetters.forEach((letter) => {
        const button = document.createElement("button");
        button.textContent = letter;
        button.className = "key";
        button.addEventListener("click", () => {
          const keyboardSound = new Audio("./assets/sounds/keyboard-sound.wav");
          keyboardSound.currentTime = 0;
          keyboardSound.play();
          button.disabled = true;

          let correct = false;
          Array.from(word).forEach((wordLetter, index) => {
            if (wordLetter === letter) {
              letterSpans[index].textContent = letter;
              correct = true;
            }
          });
          if (!correct) {
            incorrectGuessCount += 1;
            counterSpan.textContent = incorrectGuessCount;

            const hangmanImage = document.createElement("img");
            hangmanImage.src = hangmanParts[incorrectGuessCount];
            hangmanImage.id = "part" + incorrectGuessCount;
            hangmanImage.alt = "Hangman Part";
            gallowsDiv.append(hangmanImage);
          }
          if (letterSpans.every((span) => span.textContent !== "_")) {
            showModal(`Yes! It's ${word}. Congratulations!`);
            restartButton.textContent = "Next Round";
          }
          if (incorrectGuessCount === 6) {
            showModal(`You've lost. Your word was ${word}`);
            restartButton.textContent = "Try Again";
          }
        });
        keyboardDiv.append(button);
      });
    });
}
fetchNewQuestion();
