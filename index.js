/* ============== GLOBAL STATE ============== */

let jsonData = [];                  // Stores all quizzes loaded from JSON
let currentQuestions = [];          // Stores the questions for the selected subject
let currentQuestionIndex = 0;       // Tracks which question we are currently on
let selectedAnswerIndex = null;     // Tracks which answer the user selected
let hasSubmitted = false;           // Whether the user has submitted the current question
let scoreCounter = 0;               // Number of correct answers so far
let selectedSubject = '';           // Current subject (HTML, CSS, JS, etc.)

/* ============== DOM ELEMENTS ============== */

const DOM = {
  themeToggle : document.querySelector('.switch input'),        // Dark/light mode toggle
  subList : document.querySelector('.subject-list'),            // Header subject display
  subListScore: document.querySelector('.score-subject-list'),  // Score page subject display
  
  
  subjectButtons: document.querySelectorAll('.subject-title-btn'),  // Buttons to pick quiz
  quizHome: document.querySelector('.quiz-home-page'),              // Home page section
  quizContainer: document.querySelector('.quiz-container'),         // Quiz questions section 
  scoreContainer: document.querySelector('.score-container'),       // Score section

  questionText: document.querySelector('.question'),      // Current question text
  questionNo: document.querySelector('.question-no'),     // Question number display
  progressBar: document.getElementById('progress-bar'),   // Progress bar element

  options: document.querySelectorAll('.subject-btn'),     // Answer buttons
 
  optionTexts: [
    document.querySelector('#a-btn .option-text'),
    document.querySelector('#b-btn .option-text'),
    document.querySelector('#c-btn .option-text'),
    document.querySelector('#d-btn .option-text')
  ],                                                    // Option text spans inside buttons


  submitBtn: document.getElementById('submit-btn'),       // Submit / Next / Show Score button
  errorMsg: document.querySelector('.error-mesg'),        // "Please select an answer" message

  scoreEl: document.querySelector('.score'),              // User score number
  totalScoreEl: document.querySelector('.total-score'),   // Total number of questions
  playAgainBtn: document.getElementById('ply-again-btn') // Play again button
};

/* ============== LOAD DATA ============== */

async function loadQuizData() {
  const res = await fetch('data.json');   // Load JSON file
  const data = await res.json();          // Parse it
  jsonData = data.quizzes;                // Save it to global variable             
}

/* ============== QUIZ START ============== */

function startQuiz(subject) {
  resetQuizState();         // Reset all counters and state
  selectedSubject = subject; 

  DOM.submitBtn.textContent = 'Submit Answer';

  // Find the quiz object that matches the selected subject
  const quiz = jsonData.find(
    q => q.title.toLowerCase() === subject.toLowerCase()
  );

    currentQuestions = quiz.questions; // Save the questions


  // Show subject info in header and score section
  DOM.subList.style.visibility='visible';
  DOM.subListScore.style.visibility='visible';
  
  const subImg = document.querySelector('.subject-list img');
  const subText = document.querySelector('.subject-title-text');

  subImg.src = `./assets/images/icon-${subject}.svg`;
  subImg.alt = subject;

  subText.textContent =
    subject.charAt(0).toUpperCase() + subject.slice(1);


  const subImgScore = document.querySelector('.score-subject-list img');
  const subTextScore = document.querySelector('.subject-title-text-score');

  subImgScore.src = `./assets/images/icon-${subject}.svg`;
  subImgScore.alt = subject;

  subTextScore.textContent =
    subject.charAt(0).toUpperCase() + subject.slice(1);
 
  // Show quiz section, hide home page
  DOM.quizHome.classList.add('hidden');
  DOM.quizContainer.classList.remove('hidden');

  renderQuestion(); // Show first question
}

/* ============== RENDER QUESTION ============== */

// Update DOM to show the current question and its answers
function renderQuestion() {
  const q = currentQuestions[currentQuestionIndex];
 
  if (!q) return;

  DOM.questionText.textContent = q.question;  // Show question
  DOM.optionTexts.forEach((el, i) => (el.textContent = q.options[i])); // Show options

  DOM.questionNo.innerHTML = `<i>Question ${currentQuestionIndex + 1} of ${currentQuestions.length}</i>`;
  updateProgress(); // Update progress bar
  resetOptionsUI(); // Clear previous selections

  DOM.options[0].focus();  // Focus first option for keyboard navigation
}

/* ============== OPTIONS LOGIC ============== */

// When user clicks an option
function handleOptionClick(btn, index) {

  if (hasSubmitted) return; // Do nothing if already submitted

  // Remove previous selection
  DOM.options.forEach(b => {
    b.classList.remove('selected');
    b.setAttribute('aria-pressed', 'false');
  });
  
  // Mark the clicked option as selected
  btn.classList.add('selected');
  btn.setAttribute('aria-pressed', 'true');
  selectedAnswerIndex = index;
}

/* ============== KEYBOARD NAVIGATION ============== */

function handleOptionKeydown(e, index) {
  const key = e.key.toLowerCase();
  const total = DOM.options.length;

  // Map letters A-D to option indices
  const letterMap = { a: 0, b: 1, c: 2, d: 3 };

  let nextIndex = null;

  // Arrow navigation
  if (key === 'arrowdown' || key === 'arrowright') {
    nextIndex = (index + 1) % total;
  } else if (key === 'arrowup' || key === 'arrowleft') {
    nextIndex = (index - 1 + total) % total;
  }

  if (nextIndex !== null) {
    e.preventDefault();
    DOM.options[nextIndex].focus();
    return;
  }

  // Enter or Space selects focused option
  if (key === 'enter' || key === ' ') {
    e.preventDefault();

    // If submit button is focused, trigger its click
    if (document.activeElement === DOM.submitBtn) {
      DOM.submitBtn.click();
    } else {
      handleOptionClick(DOM.options[index], index);
    }
    return;
  }

  // Pressing letters A/B/C/D
  if (letterMap[key] !== undefined) {
    e.preventDefault();
    const idx = letterMap[key];
    DOM.options[idx].focus();
    handleOptionClick(DOM.options[idx], idx);
  }
}

/* ============== CHECK ANSWER ============== */

// Show correct/incorrect, update score, update button text
function checkAnswer() {
  const q = currentQuestions[currentQuestionIndex];
  const correctIndex = q.options.indexOf(q.answer);

  DOM.options.forEach((btn, i) => {
    const correctImg = btn.querySelector('.correct-img');
    const errorImg = btn.querySelector('.error-img');
 
    

    correctImg.style.visibility = 'hidden';
    errorImg.style.visibility = 'hidden';

    if (i===selectedAnswerIndex && i===correctIndex )
      {    btn.classList.add('correct');
           correctImg.style.visibility = 'visible'; }  
      else if (i === selectedAnswerIndex && i !== correctIndex) {
            btn.classList.add('wrong');
            errorImg.style.visibility = 'visible'; }
    if (i === correctIndex) {
        correctImg.style.visibility = 'visible';   }
  });

  if (selectedAnswerIndex === correctIndex) scoreCounter++;

  hasSubmitted = true;

  
  if (currentQuestionIndex === currentQuestions.length - 1) {
    DOM.submitBtn.textContent = 'Show Score';
  } else {
    DOM.submitBtn.textContent = 'Next Question';
  }
}

/* ============== NEXT QUESTION ============== */

// Move to next question or show score
function nextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex >= currentQuestions.length) {
     showScore();
    return;
  }

  hasSubmitted = false;
  selectedAnswerIndex = null;
  DOM.submitBtn.textContent = 'Submit Answer';
  DOM.errorMsg.style.visibility = 'hidden';

  renderQuestion();
}

/* ============== SCORE SCREEN ============== */

function showScore() {
  DOM.quizContainer.classList.add('hidden');
  DOM.scoreContainer.classList.remove('hidden');
 

  DOM.scoreEl.textContent = scoreCounter;
  DOM.totalScoreEl.textContent = `out of ${currentQuestions.length}`;
}

/* ============== RESET HELPERS ============== */

function resetQuizState() {
  currentQuestions = [];
  currentQuestionIndex = 0;
  selectedAnswerIndex = null;
  hasSubmitted = false;
  scoreCounter = 0;
}

function resetOptionsUI() {
  DOM.options.forEach(btn => {
    btn.classList.remove('selected', 'correct', 'wrong');
    btn.setAttribute('aria-pressed', 'false');
    btn.querySelector('.correct-img').style.visibility = 'hidden';
    btn.querySelector('.error-img').style.visibility = 'hidden';
  });
}

function updateProgress() {
  const percent =
    ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
  DOM.progressBar.style.width = `${percent}%`;
}

/* ============== EVENT LISTENERS ============== */

function initEvents() {
  // Theme toggle
  DOM.themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('light', !DOM.themeToggle.checked);  
  });

  // Subject selection
  DOM.subjectButtons.forEach(btn => {
    btn.addEventListener('click', () => startQuiz(btn.id));
  });

  // Options: click, keydown (arrows, letters, Enter/Space)
  DOM.options.forEach((btn, index) => {
    btn.addEventListener('click', () => handleOptionClick(btn, index));
    btn.addEventListener('keydown', e => handleOptionKeydown(e, index));
  });

  // Submit button: click
  DOM.submitBtn.addEventListener('click', () => {
    if (selectedAnswerIndex === null) {
      DOM.errorMsg.style.visibility = 'visible';
      return;
    }

    DOM.errorMsg.style.visibility = 'hidden';

    if (!hasSubmitted) checkAnswer();
    else nextQuestion();
  });

  // Submit button: Enter / Space
  DOM.submitBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      DOM.submitBtn.click();
    }
  });

  // Play Again
  DOM.playAgainBtn.addEventListener('click', () => {
    DOM.scoreContainer.classList.add('hidden');
    DOM.quizHome.classList.remove('hidden');
    resetQuizState();
    DOM.subjectButtons[0].focus(); // optional: focus first subject
  });
}

/* ============== INIT ============== */

document.addEventListener('DOMContentLoaded', async () => {
  await loadQuizData();            // Load JSON quiz data
  document.body.classList.toggle('light', !DOM.themeToggle.checked);  // Set theme
  initEvents(); // Setup event listeners
});
