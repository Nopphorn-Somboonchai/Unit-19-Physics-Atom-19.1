/**
 * @file quiz-ui.js
 * @description UI Adapter for Practice & Dynamic RNG Quiz System in #sec-practice.
 * Conforms to Physics Learning Standard (v1.13.0).
 */

import { QuizManager } from '../../application/quiz-manager.js';
import { KaTeXAdapter } from '../formula/katex-adapter.js';

export class QuizUIAdapter {
  constructor() {
    this.quizManager = new QuizManager(1);
    this.currentTopic = '19.1.1';
    this.currentQuestion = null;
    this.questionCount = 0;

    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    if (typeof window !== 'undefined') {
      window.currentPracticeTopic = this.currentTopic;
      window.startPracticeMode = (topic) => this.startPracticeMode(topic);
      window.regeneratePractice = () => this.generateQuestion();
      window.checkPracticeAnswer = () => this.checkNumericAnswer();
    }

    const rollInput = document.getElementById('prac-student-roll');
    if (rollInput) {
      rollInput.addEventListener('change', (e) => {
        const roll = parseInt(e.target.value, 10);
        this.quizManager.setRollNumber(roll);
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

  startPracticeMode(topic) {
    this.currentTopic = topic;
    if (typeof window !== 'undefined') window.currentPracticeTopic = topic;

    const topics = ['19.1.1', '19.1.2', 'mixed'];
    topics.forEach((t) => {
      const btn = document.getElementById(`btn-prac-${t.replace(/\./g, '-')}`);
      if (btn) {
        if (t === topic) {
          btn.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50/50');
        } else {
          btn.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50/50');
        }
      }
    });

    this.generateQuestion();
  }

  generateQuestion() {
    this.questionCount++;
    this.currentQuestion = this.quizManager.generateQuestion(this.questionCount, this.currentTopic);
    if (!this.currentQuestion) return;

    const titleEl = document.getElementById('prac-question-title');
    const textEl = document.getElementById('prac-question-text');
    const feedbackBox = document.getElementById('prac-feedback');
    const explBox = document.getElementById('prac-explanation-box');
    const inputVal1 = document.getElementById('prac-input-val1');

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

    const lblInput = document.getElementById('lbl-prac-input-1');
    if (lblInput) {
      lblInput.textContent = `คำตอบ (${this.currentQuestion.unit || 'ตัวเลข'}):`;
    }

    this.renderMathExpressions();
  }

  checkNumericAnswer() {
    const inputVal1 = document.getElementById('prac-input-val1');
    const feedbackBox = document.getElementById('prac-feedback');
    const explBox = document.getElementById('prac-explanation-box');
    const explList = document.getElementById('prac-explanation-list');

    if (!inputVal1 || !feedbackBox || !this.currentQuestion) return;

    const userAns = inputVal1.value.trim();
    if (!userAns) {
      alert('กรุณากรอกตัวเลขคำตอบก่อนตรวจ');
      return;
    }

    const evalRes = this.quizManager.evaluateAnswer(userAns);

    feedbackBox.classList.remove('hidden', 'bg-emerald-50', 'text-emerald-800', 'border-emerald-300', 'bg-red-50', 'text-red-800', 'border-red-300');

    if (evalRes.isCorrect) {
      feedbackBox.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-300', 'border', 'p-4', 'rounded-xl');
      feedbackBox.innerHTML = `
        <div class="flex items-center gap-2 font-bold text-sm">
          <i class="fa-solid fa-circle-check text-emerald-600 text-lg"></i>
          <span>ยอดเยี่ยมมาก! คำตอบของคุณถูกต้อง (${evalRes.userVal} ${this.currentQuestion.unit})</span>
        </div>
        <p class="text-xs text-emerald-700 mt-1">ความคลาดเคลื่อน ${evalRes.relativeErrorPercent}% (อยู่ในเกณฑ์ ±3%)</p>
      `;
    } else {
      feedbackBox.classList.add('bg-red-50', 'text-red-800', 'border-red-300', 'border', 'p-4', 'rounded-xl');
      feedbackBox.innerHTML = `
        <div class="flex items-center gap-2 font-bold text-sm">
          <i class="fa-solid fa-circle-xmark text-red-600 text-lg"></i>
          <span>ยังไม่ถูกต้อง คำตอบที่คำนวณได้คือ ${this.currentQuestion.correctAnswer} ${this.currentQuestion.unit}</span>
        </div>
        <p class="text-xs text-red-700 mt-1">${evalRes.message}</p>
      `;
    }

    // Render solution steps
    if (explBox && explList && this.currentQuestion.solutionSteps) {
      explList.innerHTML = this.currentQuestion.solutionSteps
        .map(step => `<li class="py-1">${step}</li>`)
        .join('');
      explBox.classList.remove('hidden');
    }

    this.renderMathExpressions();
  }

  renderMathExpressions() {
    const practiceContainer = document.getElementById('sec-practice');
    if (practiceContainer && !practiceContainer.classList.contains('hidden')) {
      KaTeXAdapter.renderAllMath(practiceContainer);
    }
  }
}

