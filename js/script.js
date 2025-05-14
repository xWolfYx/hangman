const body = document.body;

// main element
const main = document.createElement("main");
main.id = "main";
body.appendChild(main);

// gallows div
const containerDiv = document.createElement("div");
containerDiv.id = "container-div";
main.appendChild(containerDiv);

// gallows div
const gallowsDiv = document.createElement("div");
gallowsDiv.id = "gallows-div";
containerDiv.appendChild(gallowsDiv);

// gallows and other images
const gallows = document.createElement("img");
gallows.id = "gallows";
gallows.src = "../img/gallows.png";
gallowsDiv.appendChild(gallows);

const hangmanParts = [
  "",
  "../img/1-head.png",
  "../img/2-body.png",
  "../img/3-hand-one.png",
  "../img/4-hand-two.png",
  "../img/5-leg-one.png",
  "../img/6-leg-two.png",
];

// counter for incorrect guesses
const counterSpan = document.createElement("span");
counterSpan.id = "counter-span";
gallowsDiv.appendChild(counterSpan);
let incorrectGuessCount = 0;
counterSpan.innerText = incorrectGuessCount;

// question
const questionDiv = document.createElement("div");
questionDiv.id = "question-div";
main.appendChild(questionDiv);
const question = document.createElement("p");
question.id = "question";
questionDiv.appendChild(question);

// modal
const modal = document.createElement("div");
modal.id = "modal";
modal.style.display = "none";
main.appendChild(modal);

// modal content
const modalContent = document.createElement("div");
modalContent.id = "modal-content";
modal.appendChild(modalContent);

// restart button
const restartButton = document.createElement("button");
restartButton.id = "restart-button";
restartButton.addEventListener("click", restartGame);
modalContent.appendChild(restartButton);

// function to show the modal
function showModal(message) {
  modalContent.innerHTML = `<p>${message}</p>`;
  modalContent.appendChild(restartButton);
  modal.style.display = "flex";
  overlay.style.display = "block";
}

function restartGame() {
  // reset the counter
  incorrectGuessCount = 0;
  counterSpan.innerText = incorrectGuessCount;

  // close the modal
  modal.style.display = "none";
  overlay.style.display = "none";

  // remove hangman images
  const hangmanPartsToDelete = document.querySelectorAll(
    "#gallows-div img:not(#gallows)"
  );
  hangmanPartsToDelete.forEach((img) => img.remove());

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

const overlay = document.createElement("div");
overlay.id = "overlay";
body.appendChild(overlay);

function fetchNewQuestion() {
  fetch("../js/words.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch: " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
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
