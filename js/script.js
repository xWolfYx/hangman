const body = document.body;

let incorrectGuessCount = 0;

body.innerHTML = `
<main id="main">
  <div id="container-div">
    <div id="gallows-div">
      <img id="gallows" src="../img/gallows.png">
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
  "../img/1-head.png",
  "../img/2-body.png",
  "../img/3-hand-one.png",
  "../img/4-hand-two.png",
  "../img/5-leg-one.png",
  "../img/6-leg-two.png",
];

const modal = document.getElementById("modal");
const overlay = document.getElementById("overlay");
const gallowsDiv = document.getElementById("gallows-div");
const counterSpan = document.getElementById("counter-span");
const restartButton = document.getElementById("restart-button");
restartButton.addEventListener("click", restartGame);

// function to show the modal
function showModal(message) {
  const modalContent = document.getElementById("modal-content");

  modalContent.querySelector("p").innerText = message;
  modal.style.display = "flex";
  overlay.style.display = "block";
}

function restartGame() {
  // reset the counter
  incorrectGuessCount = 0;

  // close the modal
  modal.style.display = "none";
  overlay.style.display = "none";

  // remove hangman images
  gallowsDiv.innerHTML = `
  <img id="gallows" src="../img/gallows.png">`;
  gallowsDiv.appendChild(counterSpan);
  counterSpan.innerText = incorrectGuessCount;

  // reset the answer
  const answerDiv = document.getElementById("answer-div");
  if (answerDiv) {
    answerDiv.remove();
  }

  // remove keyboard
  const keyboardDiv = document.getElementById("keyboard");
  if (keyboardDiv) {
    keyboardDiv.remove();
  }

  fetchNewQuestion();
}

function fetchNewQuestion() {
  fetch("../js/words.json")
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
      document.getElementById("question").innerText = randomQuestion.hint;

      // answer
      const answerDiv = document.createElement("div");
      answerDiv.id = "answer-div";
      main.appendChild(answerDiv);

      // creating hidden letters
      const word = randomQuestion.word.toUpperCase();
      console.log(`
---------------------------------
     Answer =====> ${word}
---------------------------------
`);
      const letterSpans = [];
      Array.from(word).forEach(() => {
        const letters = document.createElement("span");
        letters.textContent = "_";
        answerDiv.appendChild(letters);
        letterSpans.push(letters);
      });

      // keyboard
      const keyboardLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
      const keyboardDiv = document.createElement("div");
      keyboardDiv.id = "keyboard";
      main.appendChild(keyboardDiv);
      keyboardLetters.forEach((letter) => {
        // keyboard keys
        const button = document.createElement("button");
        button.textContent = letter;
        button.className = "key";
        button.addEventListener("click", () => {
          const keyboardSound = new Audio("../keyboard-sound.wav");
          keyboardSound.currentTime = 0;
          keyboardSound.play();
          button.disabled = true;

          // check for the letter
          let correct = false;
          Array.from(word).forEach((wordLetter, index) => {
            if (wordLetter === letter) {
              letterSpans[index].textContent = letter;
              correct = true;
            }
          });
          if (!correct) {
            incorrectGuessCount += 1;
            counterSpan.innerText = incorrectGuessCount;

            // adding hangman images
            const hangmanImage = document.createElement("img");
            hangmanImage.src = hangmanParts[incorrectGuessCount];
            hangmanImage.id = "part" + incorrectGuessCount;
            hangmanImage.alt = "Hangman Part";
            gallowsDiv.appendChild(hangmanImage);
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
        keyboardDiv.appendChild(button);
      });
    });
}
fetchNewQuestion();
