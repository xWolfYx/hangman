class App {
  #shuffledWords = [];
  #wordObject = {};
  #word = "";
  #splittedWord = [];
  #hint = "";
  #incorrectGuessCount = 0;
  #wordIndex = 0;

  _body = document.body;
  _keyboardSound = new Audio("./assets/sounds/keyboard-sound.wav");

  _hangmanParts = [
    "",
    "./assets/images/1-head.png",
    "./assets/images/2-body.png",
    "./assets/images/3-hand-one.png",
    "./assets/images/4-hand-two.png",
    "./assets/images/5-leg-one.png",
    "./assets/images/6-leg-two.png",
  ];

  _main = null;
  _answerDiv = null;
  _modal = null;
  _overlay = null;
  _gallowsDiv = null;
  _counterSpan = null;
  _restartButton = null;

  constructor() {
    this._initNewGame();
  }

  async _initNewGame() {
    try {
      // Fetch data
      const questions = await this._fetchQuestions();
      this.#shuffledWords = this._shuffleQuestions(questions);
      this.#wordObject = this.#shuffledWords[this.#wordIndex];

      // Set the word
      this.#word = this._setWord(this.#wordObject);
      this.#splittedWord = this._splitWord(this.#word);

      // // Set the hint

      this.#hint = this._setHint(this.#wordObject);

      // Call needed functions
      this._renderStructureHTML();
      this._updateDomReferences();
      this._renderPlaceholders(this.#splittedWord);
      this._renderKeyboard();
      this._assignEvents(this.#splittedWord);
      this._showHint(this.#hint);
      console.log(`
---------------------------------
     For Debugging:
     Answer =====> ${this.#word}
---------------------------------
`);
    } catch (err) {
      // console.log(err);
      alert(err);
    }
  }

  async _fetchQuestions() {
    try {
      const data = await fetch("./assets/js/words.json");
      const { questions } = await data.json();

      return questions;
    } catch (err) {
      console.log(err);
    }
  }

  _shuffleQuestions(array) {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  _splitWord = (word) => [...word];

  _setWord(wordObj) {
    const { word } = wordObj;
    return word.toUpperCase();
  }

  _setHint(wordObj) {
    const { hint } = wordObj;
    return hint;
  }

  _renderStructureHTML() {
    this._body.innerHTML = `
    <main class="main">
      <div class="container-div">
        <div class="gallows-div">
          <img class="gallows" src="./assets/images/gallows.png">
          <span class="counter-span">${this.#incorrectGuessCount}</span>
        </div>
      </div>
      <div class="question-div">
        <p class="question"></p>
      </div>
      <div class="answer-div">
      </div>
      <div class="keyboard">
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
  }

  _updateDomReferences() {
    this._main = document.querySelector(".main");
    this._answerDiv = document.querySelector(".answer-div");
    this._modal = document.querySelector(".modal");
    this._overlay = document.querySelector(".overlay");
    this._gallowsDiv = document.querySelector(".gallows-div");
    this._counterSpan = document.querySelector(".counter-span");
    this._restartButton = document.querySelector(".restart-button");
  }

  _renderPlaceholders(word) {
    this._answerDiv.querySelectorAll("span").forEach((span) => span.remove());
    word.forEach(() => {
      const span = document.createElement("span");
      this._answerDiv.append(span);
      span.textContent = "_";
    });
  }

  _showHint(hint) {
    const questionEl = document.querySelector(".question");
    questionEl.textContent = hint;
  }

  _renderKeyboard() {
    const keyboardKeys = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
    const keyboardDiv = document.querySelector(".keyboard");
    this._main.append(keyboardDiv);

    keyboardKeys.forEach((key) => {
      const buttonHTML = `<button class="key">${key}</button>`;
      keyboardDiv.insertAdjacentHTML("beforeend", buttonHTML);
    });
  }

  _assignEvents() {
    const keyboard = document.querySelector(".keyboard");
    keyboard.addEventListener("click", (e) => this._initScreenKeyEvent(e));
    this._restartButton.addEventListener("click", () => this._restartGame());
  }

  _initScreenKeyEvent(e) {
    if (!e.target.classList.contains("key")) return;
    this._playSound();
    this._checkLetter(e.target.textContent);
    e.target.disabled = true;
  }

  // _initKeyboardEvent() {
  //   const letter = document.addEventListener("keydown", (e) => checkLetter(e.key));
  // }

  _playSound() {
    this._keyboardSound.currentTime = 0;
    this._keyboardSound.play();
  }

  _checkLetter(letter) {
    if (this.#splittedWord.includes(letter)) {
      this._showLetter(letter);
      if (
        [...this._answerDiv.children].every((span) => span.textContent !== "_")
      ) {
        this._initWin();
      }
    } else {
      this._initWrongGuess();
    }
    if (this.#incorrectGuessCount === 6) {
      this._initGameOver();
    }
  }

  _showLetter(letter) {
    this.#splittedWord.forEach((l, i) => {
      if (this.#splittedWord[i] === letter) {
        this._answerDiv.children[i].textContent = letter;
      }
    });
  }

  _initWrongGuess() {
    this.#incorrectGuessCount += 1;
    this._counterSpan.textContent = this.#incorrectGuessCount;

    const hangmanImageHTML = `
      <img src="${this._hangmanParts[this.#incorrectGuessCount]}"
      alt="Hangman Part"
      class="${"part" + this.#incorrectGuessCount}">`;
    this._gallowsDiv.insertAdjacentHTML("beforeend", hangmanImageHTML);
  }

  _initWin() {
    // TODO: this._disableKeys();

    this._showModal(`Yes! It's ${this.#word}. Congratulations!`);
    this._restartButton.textContent = "Next Round";
  }

  _initGameOver() {
    // TODO: this._disableKeys();

    this._showModal(`You've lost. Your word was ${this.#word}`);
    this._restartButton.textContent = "Try Again";
  }

  _showModal(message) {
    const modalContent = document.querySelector(".modal-content");
    modalContent.querySelector("p").textContent = message;
    this._modal.style.display = "flex";
    this._overlay.style.display = "block";
  }

  // TODO: _disableKeys() {
  // TODO:   document
  // TODO:     .querySelector(".keyboard")
  // TODO:     .removeEventListener("click", this._initScreenKeyEvent);
  // TODO: }

  _restartGame() {
    this._resetGuessCount();
    this._hideModal();
    this._resetGallows();

    this.#wordIndex++;
    this.#wordObject = this.#shuffledWords[this.#wordIndex];

    // Set the word
    this.#word = this._setWord(this.#wordObject);
    this.#splittedWord = this._splitWord(this.#word);

    // Set the hint

    this.#hint = this._setHint(this.#wordObject);

    // Rerender letter spans
    this._renderPlaceholders(this.#splittedWord);

    // Show the hint
    this._showHint(this.#hint);

    this._resetKeyboard();
  }

  _resetGuessCount() {
    this.#incorrectGuessCount = 0;
    this._counterSpan.textContent = this.#incorrectGuessCount;
  }

  _hideModal() {
    this._modal.style.display = "none";
    this._overlay.style.display = "none";
  }

  _resetGallows() {
    this._gallowsDiv
      .querySelectorAll(`[class^="part"]`)
      .forEach((part) => part.remove());
  }

  _resetKeyboard() {
    const keyboardKeys = [...document.querySelector(".keyboard").children];
    keyboardKeys.forEach((k) => {
      if (k.disabled === true) k.disabled = false;
    });
  }
}

new App();
