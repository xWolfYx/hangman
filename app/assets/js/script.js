const body = document.body;

let incorrectGuessCount = 0;
const keyboardSound = new Audio("./assets/sounds/keyboard-sound.wav");

body.innerHTML = `
<main class="main">
  <div class="container-div">
    <div class="gallows-div">
      <img class="gallows" src="./assets/images/gallows.png">
      <span class="counter-span">${incorrectGuessCount}</span>
    </div>
  </div>
  <div class="question-div">
    <p class="question"></p>
  </div>
  <div class="modal" style="display: none">
    <div class="modal-content">
    <p></p>
    <button class="restart-button"></button>
    </div>
  </div>
</main>
<div class="overlay" style="display: none"></div>
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

const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const gallowsDiv = document.querySelector(".gallows-div");
const counterSpan = document.querySelector(".counter-span");
const restartButton = document.querySelector(".restart-button");
restartButton.addEventListener("click", restartGame);

function showModal(message) {
  const modalContent = document.querySelector(".modal-content");

  modalContent.querySelector("p").textContent = message;
  modal.style.display = "flex";
  overlay.style.display = "block";
}

function restartGame() {
  incorrectGuessCount = 0;

  modal.style.display = "none";
  overlay.style.display = "none";

  gallowsDiv.innerHTML = `
  <img class="gallows" src="./assets/images/gallows.png">`;
  gallowsDiv.append(counterSpan);
  counterSpan.textContent = incorrectGuessCount;

  const answerDiv = document.querySelector(".answer-div");
  if (answerDiv) {
    answerDiv.remove();
  }

  const keyboardDiv = document.querySelector(".keyboard");
  if (keyboardDiv) {
    keyboardDiv.remove();
  }

  fetchNewQuestion();
}

async function fetchNewQuestion() {
  try {
    const data = await fetch("./assets/js/words.json");
    const words = await data.json();

    const main = document.querySelector(".main");
    const questions = words.questions;
    const randomIndex = Math.floor(Math.random() * questions.length);
    const randomQuestion = questions[randomIndex];
    showHint(randomQuestion.hint);

    appendAnswer(main);
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
      const answerDiv = document.querySelector(".answer-div");
      answerDiv.append(letters);
      letterSpans.push(letters);
    });

    const keyboardKeys = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const keyboardDiv = document.createElement("div");
    keyboardDiv.classList.add("keyboard");
    main.append(keyboardDiv);
    keyboardKeys.forEach((key) => {
      const button = document.createElement("button");
      button.textContent = key;
      button.className = "key";

      button.addEventListener("click", () => {
        playSound(button);
        let correct = false;
        Array.from(word).forEach((wordLetter, index) => {
          if (wordLetter === key) {
            letterSpans[index].textContent = key;
            correct = true;
          }
        });

        if (!correct) {
          incorrectGuessCount += 1;
          counterSpan.textContent = incorrectGuessCount;

          const hangmanImage = document.createElement("img");
          hangmanImage.src = hangmanParts[incorrectGuessCount];
          hangmanImage.classList.add("part" + incorrectGuessCount);
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
  } catch (err) {
    console.log(err);
  }
}

fetchNewQuestion();

function playSound(button) {
  keyboardSound.currentTime = 0;
  keyboardSound.play();
  button.disabled = true;
}

function showHint(hint) {
  const questionEl = document.querySelector(".question");
  questionEl.textContent = hint;
}

function appendAnswer(parent) {
  const answerDiv = document.createElement("div");
  answerDiv.classList.add("answer-div");
  parent.append(answerDiv);
}
