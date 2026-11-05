/**
 * @file quiz-ui.js
 * @description UI Adapter for Practice & Dynamic RNG Quiz System in #sec-practice.
 * Supports standard textbook questions & roll-number dynamic RNG variations.
 * Conforms to Physics Learning Standard (v1.13.0).
 */

import { QuizManager } from '../../application/quiz-manager.js';
import { KaTeXAdapter } from '../formula/katex-adapter.js';

export class QuizUIAdapter {
  constructor() {
    this.quizManager = new QuizManager(1);
    this.currentTopic = '19.1.1';
    this.currentMode = 'standard';
    this.currentQuestion = null;
    this.questionCount = 0;

    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    // Attach global functions to window
    if (typeof window !== 'undefined') {
      window.currentPracticeTopic = this.currentTopic;
      window.startPracticeMode = (topic) => this.startPracticeMode(topic);
      window.regeneratePractice = () => this.generateQuestion();
      window.checkPracticeAnswer = () => this.checkNumericAnswer();
      window.checkPracticeChoice = (cIdx) => this.checkChoiceAnswer(cIdx);
    }

    const rollInput = document.getElementById('prac-student-roll');
    if (rollInput) {
      rollInput.addEventListener('change', (e) => {
        const roll = parseInt(e.target.value, 10);
        this.quizManager.setRollNumber(roll);
        this.generateQuestion();
      });
    }

    const modeSelect = document.getElementById('prac-mode-select');
    if (modeSelect) {
      modeSelect.value = this.currentMode;
      modeSelect.addEventListener('change', (e) => {
        this.currentMode = e.target.value;
        this.quizManager.setMode(this.currentMode);
        this.generateQuestion();
      });
    }

    const inputVal1 = document.getElementById('prac-input-val1');
    if (inputVal1) {
      inputVal1.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') this.checkNumericAnswer();
      });
    }

    // Initial load
    this.startPracticeMode('19.1.1');
  }

  /**
   * Switch practice topic (19.1.1, 19.1.2, 19.1.3, or mixed)
   * @param {string} topic
   */
  startPracticeMode(topic) {
    this.currentTopic = topic;
    if (typeof window !== 'undefined') window.currentPracticeTopic = topic;

    // Update active styling on 3 topic cards
    const topics = ['19.1.1', '19.1.2', '19.1.3'];
    topics.forEach((t) => {
      const btn = document.getElementById(`btn-prac-${t.replace(/\./g, '-')}`);
      if (btn) {
        if (t === topic) {
          btn.className = 'p-4 bg-blue-50/50 text-slate-800 rounded-xl border-2 border-blue-500 ring-2 ring-blue-500/20 flex items-center gap-3 transition text-left shadow-md cursor-pointer';
        } else {
          btn.className = 'p-4 bg-white hover:bg-slate-50 text-slate-800 rounded-xl border border-slate-200 flex items-center gap-3 transition text-left shadow-sm hover:shadow cursor-pointer';
        }
      }
    });

    this.generateQuestion();
  }

  /**
   * Generate next question
   */
  generateQuestion() {
    this.questionCount++;
    this.currentQuestion = this.quizManager.generateQuestion(
      this.questionCount,
      this.currentTopic,
      null,
      this.currentMode
    );
    if (!this.currentQuestion) return;

    const titleEl = document.getElementById('prac-question-title');
    const textEl = document.getElementById('prac-question-text');
    const choiceZone = document.getElementById('prac-choice-zone');
    const numericZone = document.getElementById('prac-numeric-zone');
    const feedbackBox = document.getElementById('prac-feedback');
    const explBox = document.getElementById('prac-explanation-box');
    const inputVal1 = document.getElementById('prac-input-val1');

    // Reset feedback and explanation
    if (feedbackBox) {
      feedbackBox.classList.add('hidden');
      feedbackBox.innerHTML = '';
    }
    if (explBox) explBox.classList.add('hidden');
    if (inputVal1) {
      inputVal1.value = '';
      inputVal1.focus();
    }

    if (titleEl) {
      titleEl.textContent = `📋 ข้อคำถาม (${this.currentQuestion.topic}) - ${this.currentQuestion.title}:`;
    }

    if (textEl) {
      textEl.innerHTML = this.currentQuestion.problemText;
    }

    // Toggle choice vs numeric input
    if (this.currentQuestion.type === 'choice') {
      if (choiceZone) choiceZone.classList.remove('hidden');
      if (numericZone) numericZone.classList.add('hidden');
      this.renderChoices();
    } else {
      if (choiceZone) choiceZone.classList.add('hidden');
      if (numericZone) numericZone.classList.remove('hidden');

      const lblInput = document.getElementById('lbl-prac-input-1');
      if (lblInput) {
        lblInput.textContent = `คำตอบ (${this.currentQuestion.unit || 'ตัวเลข'}):`;
      }
    }

    this.renderMathExpressions();
  }

  /**
   * Render choice buttons if question is multiple choice
   */
  renderChoices() {
    const choiceZone = document.getElementById('prac-choice-zone');
    if (!choiceZone || !this.currentQuestion.choices) return;

    choiceZone.innerHTML = this.currentQuestion.choices
      .map(
        (choice, idx) => `
        <button onclick="checkPracticeChoice(${idx})"
          class="prac-choice-btn w-full p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-800 text-left font-medium text-sm transition-all flex items-center gap-3 cursor-pointer">
          <span class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0">
            ${['ก', 'ข', 'ค', 'ง'][idx] || idx + 1}
          </span>
          <span class="choice-text flex-1">${choice}</span>
        </button>
      `
      )
      .join('');
  }

  /**
   * Check choice answer
   */
  checkChoiceAnswer(choiceIdx) {
    if (!this.currentQuestion) return;

    const isCorrect = choiceIdx === this.currentQuestion.correctChoiceIndex;
    this.displayFeedback(
      isCorrect,
      isCorrect
        ? 'ยอดเยี่ยมมาก! คำตอบของคุณถูกต้องตามหลักการทางฟิสิกส์'
        : 'ยังไม่ถูกต้อง ลองศึกษาทบทวนขั้นตอนและแนวคิดจากเฉลยด้านล่าง'
    );
  }

  /**
   * Check numeric answer
   */
  checkNumericAnswer() {
    if (!this.currentQuestion) return;

    const inputVal1 = document.getElementById('prac-input-val1');
    const userVal = inputVal1 ? inputVal1.value.trim() : '';

    if (!userVal) {
      alert('กรุณากรอกตัวเลขคำตอบก่อนกดตรวจคำตอบ');
      return;
    }

    const evalResult = this.quizManager.evaluateAnswer(userVal);
    const msg = evalResult.isCorrect
      ? `คำตอบของคุณ (${evalResult.userVal} ${this.currentQuestion.unit || ''}) ถูกต้องตามเกณฑ์ความคลาดเคลื่อน ±3% (Error: ${evalResult.relativeErrorPercent}%)`
      : `คำตอบที่คำนวณได้คือ ${this.currentQuestion.correctAnswer} ${this.currentQuestion.unit || ''} (${evalResult.message || 'คลาดเคลื่อนเกินเกณฑ์ ±3%'})`;

    this.displayFeedback(evalResult.isCorrect, msg);
  }

  /**
   * Display feedback banner and step-by-step solution
   */
  displayFeedback(isCorrect, message) {
    const feedbackBox = document.getElementById('prac-feedback');
    const explBox = document.getElementById('prac-explanation-box');
    const explText = document.getElementById('prac-explanation-text');
    const explList = document.getElementById('prac-explanation-list');

    if (feedbackBox) {
      feedbackBox.classList.remove('hidden');
      if (isCorrect) {
        feedbackBox.className = 'p-5 rounded-2xl border bg-emerald-50 border-emerald-200 text-emerald-900 transition-all';
        feedbackBox.innerHTML = `
          <div class="flex items-center gap-3 font-bold text-base text-emerald-800 mb-1">
            <i class="fa-solid fa-circle-check text-2xl text-emerald-600"></i>
            <span>ยินดีด้วย! คำตอบถูกต้อง 🎉</span>
          </div>
          <p class="text-xs text-emerald-700">${message || 'คุณคำนวณและตอบได้ถูกต้องตามหลักฟิสิกส์'}</p>
        `;
      } else {
        feedbackBox.className = 'p-5 rounded-2xl border bg-red-50 border-red-200 text-red-900 transition-all';
        feedbackBox.innerHTML = `
          <div class="flex items-center gap-3 font-bold text-base text-red-800 mb-1">
            <i class="fa-solid fa-circle-xmark text-2xl text-red-600"></i>
            <span>ยังไม่ถูกต้อง ❌</span>
          </div>
          <p class="text-xs text-red-700">${message || 'ลองทบทวนสูตรและขั้นตอนการคำนวณในวิธีทำด้านล่าง'}</p>
        `;
      }
    }

    if (explBox && this.currentQuestion.solutionSteps) {
      explBox.classList.remove('hidden');
      const stepsHtml = `
        <ol class="list-decimal pl-5 space-y-2">
          ${this.currentQuestion.solutionSteps.map((step) => `<li class="py-0.5">${step}</li>`).join('')}
        </ol>
      `;
      if (explText) {
        explText.innerHTML = stepsHtml;
      }
      if (explList) {
        explList.innerHTML = this.currentQuestion.solutionSteps
          .map((step) => `<li class="py-1">${step}</li>`)
          .join('');
      }
    }

    this.renderMathExpressions();
  }

  /**
   * Render KaTeX mathematical expressions safely via KaTeXAdapter
   */
  renderMathExpressions() {
    const container = document.getElementById('sec-practice');
    if (container && !container.classList.contains('hidden')) {
      KaTeXAdapter.renderAllMath(container);
    }
  }
}
