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
    this.questionIndex = 0;

    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    // Attach global functions to window
    if (typeof window !== 'undefined') {
      window.currentPracticeTopic = this.currentTopic;
      window.startPracticeMode = (topic) => this.startPracticeMode(topic);
      window.regeneratePractice = () => this.nextQuestion();
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

    const multiInput1 = document.getElementById('prac-multi-input-1');
    const multiInput2 = document.getElementById('prac-multi-input-2');
    if (multiInput1) {
      multiInput1.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          if (multiInput2) multiInput2.focus();
          else this.checkNumericAnswer();
        }
      });
    }
    if (multiInput2) {
      multiInput2.addEventListener('keyup', (e) => {
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
    this.questionIndex = 0;
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
   * Advance to the next question in the current topic
   */
  nextQuestion() {
    this.questionIndex++;
    this.generateQuestion();
  }

  /**
   * Generate and render current question
   */
  generateQuestion() {
    this.currentQuestion = this.quizManager.generateQuestion(
      this.questionIndex,
      this.currentTopic,
      null,
      this.currentMode
    );
    if (!this.currentQuestion) return;

    const titleEl = document.getElementById('prac-question-title');
    const textEl = document.getElementById('prac-question-text');
    const choiceZone = document.getElementById('prac-choice-zone');
    const numericZone = document.getElementById('prac-numeric-zone');
    const singleInputWrap = document.getElementById('prac-single-input-wrap');
    const multiNumericZone = document.getElementById('prac-multi-numeric-zone');
    const feedbackBox = document.getElementById('prac-feedback');
    const explBox = document.getElementById('prac-explanation-box');
    const inputVal1 = document.getElementById('prac-input-val1');
    const unitBadge1 = document.getElementById('prac-unit-badge-1');
    const multiInput1 = document.getElementById('prac-multi-input-1');
    const multiInput2 = document.getElementById('prac-multi-input-2');

    // Reset feedback and explanation
    if (feedbackBox) {
      feedbackBox.classList.add('hidden');
      feedbackBox.innerHTML = '';
    }
    if (explBox) explBox.classList.add('hidden');
    if (inputVal1) inputVal1.value = '';
    if (multiInput1) multiInput1.value = '';
    if (multiInput2) multiInput2.value = '';

    if (titleEl) {
      const seqLabel = this.currentQuestion.questionNumber && this.currentQuestion.totalInTopic
        ? `ข้อที่ ${this.currentQuestion.questionNumber} / ${this.currentQuestion.totalInTopic}`
        : 'ข้อคำถาม';
      titleEl.textContent = `📋 ${seqLabel} (${this.currentQuestion.topic}) - ${this.currentQuestion.title}:`;
    }

    if (textEl) {
      textEl.innerHTML = this.currentQuestion.problemText;
    }

    // Toggle choice vs multi-numeric vs single numeric input
    if (this.currentQuestion.type === 'choice') {
      if (choiceZone) choiceZone.classList.remove('hidden');
      if (numericZone) numericZone.classList.add('hidden');
      this.renderChoices();
    } else if (this.currentQuestion.type === 'multi-numeric' && Array.isArray(this.currentQuestion.inputs)) {
      if (choiceZone) choiceZone.classList.add('hidden');
      if (numericZone) numericZone.classList.remove('hidden');
      if (singleInputWrap) singleInputWrap.classList.add('hidden');
      if (multiNumericZone) multiNumericZone.classList.remove('hidden');

      const [spec1, spec2] = this.currentQuestion.inputs;
      const lblMulti1 = document.getElementById('lbl-prac-multi-1');
      const unitMulti1 = document.getElementById('prac-multi-unit-1');
      const lblMulti2 = document.getElementById('lbl-prac-multi-2');
      const unitMulti2 = document.getElementById('prac-multi-unit-2');

      if (lblMulti1 && spec1) lblMulti1.textContent = `1) ${spec1.label}:`;
      if (unitMulti1 && spec1) unitMulti1.textContent = spec1.unit || '';
      if (lblMulti2 && spec2) lblMulti2.textContent = `2) ${spec2.label}:`;
      if (unitMulti2 && spec2) unitMulti2.textContent = spec2.unit || '';
      if (multiInput1) multiInput1.focus();
    } else {
      if (choiceZone) choiceZone.classList.add('hidden');
      if (numericZone) numericZone.classList.remove('hidden');
      if (singleInputWrap) singleInputWrap.classList.remove('hidden');
      if (multiNumericZone) multiNumericZone.classList.add('hidden');

      const lblInput = document.getElementById('lbl-prac-input-1');
      if (lblInput) {
        lblInput.textContent = `คำตอบ (${this.currentQuestion.unit || 'ตัวเลข'}):`;
      }
      if (unitBadge1) {
        const unitText = this.currentQuestion.unit || '';
        unitBadge1.textContent = unitText;
        unitBadge1.classList.toggle('hidden', !unitText);
      }
      if (inputVal1) inputVal1.focus();
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
   * Check numeric answer (supports single numeric & 2-input multi-numeric)
   */
  checkNumericAnswer() {
    if (!this.currentQuestion) return;

    if (this.currentQuestion.type === 'multi-numeric' && Array.isArray(this.currentQuestion.inputs)) {
      const input1 = document.getElementById('prac-multi-input-1');
      const input2 = document.getElementById('prac-multi-input-2');
      const val1 = input1 ? input1.value.trim() : '';
      const val2 = input2 ? input2.value.trim() : '';

      if (!val1 || !val2) {
        alert('กรุณากรอกตัวเลขคำตอบให้ครบทั้ง 2 ช่องก่อนกดตรวจคำตอบ');
        return;
      }

      const evalResult = this.quizManager.evaluateMultiAnswer([val1, val2]);
      const lines = evalResult.results.map((r, idx) => {
        const icon = r.isCorrect ? '✅' : '❌';
        const detail = r.isCorrect
          ? `คำตอบของคุณ ${r.userVal} ${r.unit} ถูกต้อง (Error: ${r.relativeErrorPercent}%)`
          : `คำตอบที่ถูกต้องคือ ${r.correctVal} ${r.unit} (${r.message || 'คลาดเคลื่อนเกินเกณฑ์ ±3%'})`;
        return `<div>${icon} <strong>${idx + 1}) ${r.label}</strong>: ${detail}</div>`;
      });

      this.displayFeedback(evalResult.isCorrect, lines.join(''));
      return;
    }

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
   * Format simple markdown bold (**text**) inside solution steps
   */
  formatStepHtml(step) {
    return String(step || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
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
          <div class="text-xs text-emerald-700 space-y-1">${message || 'คุณคำนวณและตอบได้ถูกต้องตามหลักฟิสิกส์'}</div>
        `;
      } else {
        feedbackBox.className = 'p-5 rounded-2xl border bg-red-50 border-red-200 text-red-900 transition-all';
        feedbackBox.innerHTML = `
          <div class="flex items-center gap-3 font-bold text-base text-red-800 mb-1">
            <i class="fa-solid fa-circle-xmark text-2xl text-red-600"></i>
            <span>ยังไม่ถูกต้อง ❌</span>
          </div>
          <div class="text-xs text-red-700 space-y-1">${message || 'ลองทบทวนสูตรและขั้นตอนการคำนวณในวิธีทำด้านล่าง'}</div>
        `;
      }
    }

    if (explBox && this.currentQuestion.solutionSteps) {
      explBox.classList.remove('hidden');
      const stepsHtml = `
        <ol class="list-decimal pl-5 space-y-2">
          ${this.currentQuestion.solutionSteps.map((step) => `<li class="py-0.5">${this.formatStepHtml(step)}</li>`).join('')}
        </ol>
      `;
      if (explText) {
        explText.innerHTML = stepsHtml;
      }
      if (explList) {
        explList.innerHTML = this.currentQuestion.solutionSteps
          .map((step) => `<li class="py-1">${this.formatStepHtml(step)}</li>`)
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
