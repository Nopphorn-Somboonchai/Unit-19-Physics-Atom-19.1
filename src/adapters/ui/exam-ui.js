/**
 * @file exam-ui.js
 * @description UI Adapter for 15-Minute Timed Exam System in Unit 19.
 * Handles Exam Start Screen, Live Question Pager, Timer Display, Anti-Cheat Warning,
 * and Comprehensive Results Breakdown.
 * Conforms to Physics Learning Standard (v1.13.0).
 */

import { ExamManager, EXAM_STATES } from '../../application/exam-manager.js';
import { LocalStorageAdapter } from '../storage/local-storage.js';
import { KaTeXAdapter } from '../formula/katex-adapter.js';
import { TabNavigatorAdapter } from './tab-navigator.js';

export class ExamUIAdapter {
  constructor() {
    this.examManager = new ExamManager(1);
    this.currentQuestionIdx = 0;
    this._isAwayFromExam = false;
    this._suppressAntiCheat = false;
    this._isUnloading = false;

    this.init();
  }

  init() {
    if (typeof document === 'undefined') return;

    if (typeof window !== 'undefined') {
      window.startLiveExam = () => this.startLiveExam();
      window.goToExamQuestion = (idx) => this.goToQuestion(idx);
      window.prevExamQuestion = () => this.goToQuestion(this.currentQuestionIdx - 1);
      window.nextExamQuestion = () => this.goToQuestion(this.currentQuestionIdx + 1);
      window.selectExamChoice = (cIdx) => this.selectChoice(cIdx);
      window.recordExamNumericInput = (val) => this.recordNumericInput(val);
      window.confirmSubmitExam = () => this.confirmSubmitExam();
      window.retakeExam = () => this.retakeExam();
      window.toggleExamSolutionBox = () => this.toggleExamSolutionBox();
      window.showLatestResultModal = () => this.showLatestResultModal();
      window.closeLatestResultModal = () => this.closeLatestResultModal();
    }

    // Connect Exam Manager callbacks
    this.examManager.onTimerTick = (timeRemaining, timerStr) => {
      this.updateTimerDisplay(timeRemaining, timerStr);
    };

    this.examManager.onAutoSubmitted = (result) => {
      this.handleAutoSubmitted(result);
    };

    this.examManager.onCheatDetected = (switchCount) => {
      this.showCheatWarning(switchCount);
    };

    // Setup start screen validation & anti-cheat listeners
    this.setupStartFormValidation();
    this.setupAntiCheatListeners();

    // Check last result for home banner
    const lastResult = LocalStorageAdapter.loadExamResult();
    if (lastResult) {
      this.updateHomeLastScore(lastResult.totalScore);
    }

    // Check for active or expired session recovery
    this.checkSessionRecovery();
  }

  setupStartFormValidation() {
    const nameInput = document.getElementById('exam-input-name');
    const classInput = document.getElementById('exam-input-class');
    const rollInput = document.getElementById('exam-input-roll');
    const startBtn = document.getElementById('btn-exam-start-submit');
    const nameErr = document.getElementById('exam-err-name');
    const rollErr = document.getElementById('exam-err-roll');

    const validateForm = (showMessages = false) => {
      const nameVal = nameInput ? nameInput.value.trim() : '';
      const classVal = classInput ? classInput.value.trim() : '';
      const rollRaw = rollInput ? rollInput.value.trim() : '';
      const rollNum = Number(rollRaw);

      const isNameValid = nameVal.length > 0;
      const isClassValid = classVal.length > 0;
      const isRollValid = Number.isInteger(rollNum) && rollNum >= 1 && rollNum <= 40;

      if (nameErr) {
        nameErr.classList.toggle('hidden', !showMessages || isNameValid);
      }
      if (rollErr) {
        rollErr.classList.toggle('hidden', !showMessages || isRollValid);
      }
      if (startBtn) {
        startBtn.disabled = !(isNameValid && isClassValid && isRollValid);
      }
      return isNameValid && isClassValid && isRollValid;
    };

    [nameInput, classInput, rollInput].forEach((el) => {
      if (el) {
        el.addEventListener('input', () => validateForm(true));
        el.addEventListener('blur', () => validateForm(true));
      }
    });

    validateForm(false);
  }

  setupAntiCheatListeners() {
    if (typeof document === 'undefined') return;

    const handleLeave = () => {
      if (this.examManager.state !== EXAM_STATES.IN_PROGRESS) return;
      if (this._isUnloading || this._suppressAntiCheat || this._isAwayFromExam) return;

      this._isAwayFromExam = true;
      this.examManager.recordTabSwitch();
    };

    const handleReturn = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      this._isAwayFromExam = false;
    };

    window.addEventListener('beforeunload', () => {
      this._isUnloading = true;
    });

    window.addEventListener('pagehide', () => {
      this._isUnloading = true;
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        handleLeave();
      } else {
        handleReturn();
      }
    });

    window.addEventListener('blur', handleLeave);
    window.addEventListener('focus', handleReturn);
  }

  checkSessionRecovery() {
    const savedSession = LocalStorageAdapter.loadExamSession();
    if (!savedSession || !savedSession.endTime) return;

    if (savedSession.endTime <= Date.now()) {
      // Session already expired before reload -> force auto-submit immediately
      this.examManager.resumeExamSession(savedSession);
      const result = this.examManager.examResult;
      TabNavigatorAdapter.setExamInProgress(false);
      if (result) {
        TabNavigatorAdapter.showSection('exam-result');
        this.renderResultScreen(result);
        this.updateHomeLastScore(result.totalScore);
      }
      return;
    }

    const confirmResume = confirm(
      `พบเซสชันการสอบที่ค้างอยู่ของ ${savedSession.fullName} (เลขที่ ${savedSession.rollNumber})\nต้องการทำข้อสอบต่อหรือไม่?`
    );
    if (confirmResume) {
      this._isAwayFromExam = false;
      this.examManager.resumeExamSession(savedSession);
      TabNavigatorAdapter.setExamInProgress(true);
      TabNavigatorAdapter.showSection('exam-live');
      this.renderLiveExamScreen();
      this.updateTimerDisplay(this.examManager.timeRemaining, this.examManager.formatTimerString());
      this.goToQuestion(this.examManager.restoredActiveQuestionIdx || 0);
    } else {
      LocalStorageAdapter.clearExamSession();
    }
  }

  startLiveExam() {
    const nameInput = document.getElementById('exam-input-name');
    const classInput = document.getElementById('exam-input-class');
    const rollInput = document.getElementById('exam-input-roll');

    const fullName = nameInput ? nameInput.value.trim() : '';
    const className = classInput ? classInput.value.trim() : '';
    const rollNumber = rollInput ? Number(rollInput.value) : 1;

    if (!fullName) {
      const nameErr = document.getElementById('exam-err-name');
      if (nameErr) nameErr.classList.remove('hidden');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!Number.isInteger(rollNumber) || rollNumber < 1 || rollNumber > 40) {
      const rollErr = document.getElementById('exam-err-roll');
      if (rollErr) rollErr.classList.remove('hidden');
      if (rollInput) rollInput.focus();
      return;
    }

    this._isAwayFromExam = false;
    this._isUnloading = false;

    this.examManager.setIdentity(fullName, className, rollNumber);
    this.examManager.startExam();

    TabNavigatorAdapter.setExamInProgress(true);
    TabNavigatorAdapter.showSection('exam-live');

    this.currentQuestionIdx = 0;
    this.renderLiveExamScreen();
    this.updateTimerDisplay(this.examManager.timeRemaining, this.examManager.formatTimerString());
    this.goToQuestion(0);
  }

  renderLiveExamScreen() {
    const nameBadge = document.getElementById('exam-live-student-info');
    if (nameBadge) {
      nameBadge.textContent = `${this.examManager.fullName} (${this.examManager.className || 'ม.6'}) เลขที่ ${this.examManager.rollNumber}`;
    }

    this.renderQuestionPagination();
  }

  renderQuestionPagination() {
    const pager = document.getElementById('exam-question-pager');
    if (!pager) return;

    pager.innerHTML = this.examManager.questions
      .map((q, idx) => {
        const isAnswered = this.examManager.userAnswers[idx] !== undefined && this.examManager.userAnswers[idx] !== '';
        const isCurrent = idx === this.currentQuestionIdx;

        let btnClass = 'w-10 h-10 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ';
        if (isCurrent) {
          btnClass += 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300';
        } else if (isAnswered) {
          btnClass += 'bg-emerald-100 text-emerald-800 border border-emerald-300';
        } else {
          btnClass += 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200';
        }

        return `<button onclick="goToExamQuestion(${idx})" class="${btnClass}">${idx + 1}</button>`;
      })
      .join('');
  }

  goToQuestion(idx) {
    if (idx < 0 || idx >= this.examManager.questions.length) return;
    this.currentQuestionIdx = idx;
    this.examManager.setActiveQuestion(idx);

    const q = this.examManager.questions[idx];
    const titleEl = document.getElementById('exam-q-title');
    const textEl = document.getElementById('exam-q-text');
    const choiceZone = document.getElementById('exam-zone-choice');
    const numericZone = document.getElementById('exam-zone-numeric');
    const btnPrev = document.getElementById('btn-exam-prev');
    const btnNext = document.getElementById('btn-exam-next');

    if (titleEl) {
      titleEl.textContent = `ข้อที่ ${idx + 1}: ${q.title} (${q.score} คะแนน)`;
    }

    if (textEl) {
      textEl.innerHTML = q.problemText;
    }

    if (btnPrev) btnPrev.disabled = idx === 0;
    if (btnNext) {
      if (idx === this.examManager.questions.length - 1) {
        btnNext.innerHTML = '<span>ส่งข้อสอบ</span> <i class="fa-solid fa-check ml-1"></i>';
        btnNext.className = 'px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow cursor-pointer flex items-center gap-1.5';
        btnNext.onclick = () => this.confirmSubmitExam();
      } else {
        btnNext.innerHTML = '<span>ข้อถัดไป</span> <i class="fa-solid fa-chevron-right ml-1"></i>';
        btnNext.className = 'px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow cursor-pointer flex items-center gap-1.5';
        btnNext.onclick = () => this.goToQuestion(this.currentQuestionIdx + 1);
      }
    }

    // Toggle choice vs numeric input
    if (q.type === 'choice') {
      if (choiceZone) {
        choiceZone.classList.remove('hidden');
        choiceZone.innerHTML = q.choices
          .map((ch, cIdx) => {
            const isSelected = this.examManager.userAnswers[idx] === cIdx;
            const borderClass = isSelected ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 bg-slate-50 hover:bg-slate-100';
            return `
              <button onclick="selectExamChoice(${cIdx})"
                class="w-full text-left p-4 rounded-xl border ${borderClass} transition flex items-start gap-3 cursor-pointer">
                <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}">
                  ${String.fromCharCode(65 + cIdx)}
                </span>
                <span class="text-xs md:text-sm text-slate-800 leading-relaxed">${ch}</span>
              </button>
            `;
          })
          .join('');
      }
      if (numericZone) numericZone.classList.add('hidden');
    } else {
      if (choiceZone) choiceZone.classList.add('hidden');
      if (numericZone) {
        numericZone.classList.remove('hidden');
        const numInput = document.getElementById('exam-input-numeric');
        const unitLabel = document.getElementById('exam-lbl-numeric-unit');
        const unitBadge = document.getElementById('exam-unit-badge');
        if (unitLabel) unitLabel.textContent = q.unit || 'ตัวเลข';
        if (unitBadge) unitBadge.textContent = q.unit || '-';
        if (numInput) {
          numInput.value = this.examManager.userAnswers[idx] ?? '';
          numInput.oninput = (e) => this.recordNumericInput(e.target.value);
        }
      }
    }

    this.renderQuestionPagination();
    this.renderMathExpressions();
  }

  selectChoice(cIdx) {
    this.examManager.recordAnswer(this.currentQuestionIdx, cIdx);
    this.goToQuestion(this.currentQuestionIdx);
  }

  recordNumericInput(val) {
    this.examManager.recordAnswer(this.currentQuestionIdx, val.trim());
    this.renderQuestionPagination();
  }

  updateTimerDisplay(timeRemaining, timerStr) {
    const el = document.getElementById('exam-timer-display');
    if (el) {
      el.textContent = timerStr;
      if (timeRemaining <= 180) { // < 3 mins
        el.classList.add('text-red-600', 'animate-pulse');
      } else {
        el.classList.remove('text-red-600', 'animate-pulse');
      }
    }
  }

  showCheatWarning(count) {
    const banner = document.getElementById('cheat-warning-banner');
    const msg = document.getElementById('cheat-warning-msg');
    if (banner && msg) {
      msg.textContent = `ระบบตรวจพบการสลับหน้าจอครั้งที่ ${count}! โปรดทำข้อสอบด้วยความซื่อสัตย์`;
      banner.classList.remove('hidden');
      banner.classList.add('cheat-shake');
      setTimeout(() => {
        banner.classList.remove('cheat-shake');
      }, 500);
      setTimeout(() => {
        banner.classList.add('hidden');
      }, 4500);
    }
  }

  confirmSubmitExam() {
    const totalQ = this.examManager.questions.length;
    const answeredCount = Object.keys(this.examManager.userAnswers).filter(
      k => this.examManager.userAnswers[k] !== undefined && this.examManager.userAnswers[k] !== ''
    ).length;

    const unanswered = totalQ - answeredCount;
    let msg = 'คุณต้องการส่งกระดาษคำตอบใช่หรือไม่?';
    if (unanswered > 0) {
      msg = `คุณยังไม่ได้ตอบอีก ${unanswered} ข้อ ต้องการยืนยันส่งกระดาษคำตอบหรือไม่?`;
    }

    this._suppressAntiCheat = true;
    try {
      if (confirm(msg)) {
        this.submitExam();
      }
    } finally {
      this._suppressAntiCheat = false;
      this._isAwayFromExam = false;
    }
  }

  submitExam() {
    const result = this.examManager.submitExam(false);
    this._isAwayFromExam = false;
    TabNavigatorAdapter.setExamInProgress(false);
    TabNavigatorAdapter.showSection('exam-result');

    this.renderResultScreen(result);
    this.updateHomeLastScore(result.totalScore);
  }

  handleAutoSubmitted(result) {
    this._isAwayFromExam = false;
    TabNavigatorAdapter.setExamInProgress(false);
    TabNavigatorAdapter.showSection('exam-result');

    if (result) {
      this.renderResultScreen(result);
      this.updateHomeLastScore(result.totalScore);
    }
  }

  formatStudentAnswer(q) {
    if (q.type === 'choice') {
      if (q.userAnswer === null || q.userAnswer === undefined || q.userAnswer === '') {
        return 'ไม่ได้ตอบ';
      }
      const idx = Number(q.userAnswer);
      const choiceText = Array.isArray(q.choices) && q.choices[idx] ? q.choices[idx] : null;
      return choiceText ? `${String.fromCharCode(65 + idx)}. ${choiceText}` : 'ไม่ได้ตอบ';
    }

    if (q.userAnswer === null || q.userAnswer === undefined || q.userAnswer === '') {
      return 'ไม่ได้ตอบ';
    }
    return `${q.userAnswer} ${q.unit || ''}`.trim();
  }

  formatCorrectAnswer(q) {
    if (q.type === 'choice') {
      const idx = Number(q.correctChoiceIndex);
      const choiceText = Array.isArray(q.choices) && q.choices[idx] ? q.choices[idx] : '-';
      return `${String.fromCharCode(65 + idx)}. ${choiceText}`;
    }
    return `${q.correctAnswer} ${q.unit || ''}`.trim();
  }

  renderResultScreen(res) {
    const scoreVal = document.getElementById('res-score-value');
    const scorePct = document.getElementById('res-score-pct');
    const badgeGrade = document.getElementById('res-badge-grade');
    const studentInfo = document.getElementById('res-student-info');
    const tabSwitchBadge = document.getElementById('res-tab-switches');
    const autoBanner = document.getElementById('res-auto-submit-banner');
    const breakdownList = document.getElementById('res-breakdown-list');

    if (scoreVal) scoreVal.textContent = `${res.totalScore} / ${res.maxScore}`;
    if (scorePct) scorePct.textContent = `${res.percentage}%`;
    if (badgeGrade) {
      badgeGrade.textContent = res.gradeLevel;
      badgeGrade.className = res.isPassed
        ? 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300'
        : 'px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300';
    }

    if (studentInfo) {
      studentInfo.textContent = `${res.fullName} (${res.className || 'ม.6'}) เลขที่ ${res.rollNumber}`;
    }

    if (tabSwitchBadge) {
      tabSwitchBadge.textContent = res.tabSwitchCount > 0 ? `สลับจอ ${res.tabSwitchCount} ครั้ง` : 'ความโปร่งใส 100%';
    }

    if (autoBanner) {
      if (res.isAutoSubmit) {
        autoBanner.classList.remove('hidden');
        autoBanner.textContent = res.autoSubmitReason === 'timeout-on-recovery'
          ? '⏰ หมดเวลาการสอบขณะออกจากหน้าจอ ระบบตรวจคำตอบที่บันทึกไว้ล่าสุดให้อัตโนมัติแล้ว'
          : '⏰ หมดเวลาการสอบ 15 นาที ระบบบังคับส่งกระดาษคำตอบและคำนวณคะแนนอัตโนมัติแล้ว';
      } else {
        autoBanner.classList.add('hidden');
      }
    }

    if (breakdownList) {
      breakdownList.innerHTML = res.gradedQuestions
        .map((q, idx) => `
          <div class="p-4 rounded-xl border ${q.isCorrect ? 'border-emerald-200 bg-emerald-50/40' : 'border-red-200 bg-red-50/40'} space-y-3">
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-xs ${q.isCorrect ? 'text-emerald-700' : 'text-red-700'}">
                ข้อที่ ${idx + 1}: ${q.title}
              </span>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${q.isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'}">
                ${q.earnedScore} / ${q.score} คะแนน
              </span>
            </div>
            <p class="text-xs text-slate-700">${q.problemText}</p>
            <div class="text-xs space-y-1">
              <div><strong class="text-slate-600">คำตอบของคุณ:</strong> <span class="${q.isCorrect ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}">${this.formatStudentAnswer(q)}</span></div>
              <div><strong class="text-slate-600">เฉลย:</strong> <span class="text-emerald-700 font-bold">${this.formatCorrectAnswer(q)}</span></div>
              <div class="text-[11px] text-slate-500 mt-1 bg-white/70 p-2 rounded-lg border border-slate-200">${q.explanation}</div>
            </div>
          </div>
        `)
        .join('');
    }

    this.renderMathExpressions();
  }

  retakeExam() {
    TabNavigatorAdapter.showSection('exam-start');
  }

  toggleExamSolutionBox() {
    const box = document.getElementById('exam-solution-box');
    if (box) box.classList.toggle('hidden');
  }

  updateHomeLastScore(score) {
    const el = document.getElementById('lbl-last-score');
    if (el) el.textContent = `${score} / 10 คะแนน`;
  }

  showLatestResultModal() {
    const modal = document.getElementById('latest-result-modal');
    const content = document.getElementById('modal-latest-result-content');
    const res = LocalStorageAdapter.loadExamResult();

    if (!res) {
      alert('ยังไม่มีประวัติการสอบ กรุณาทำแบบทดสอบเก็บคะแนนก่อน');
      return;
    }

    if (content) {
      content.innerHTML = `
        <div class="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div class="text-4xl font-extrabold text-blue-600 font-mono">${res.totalScore} / 10</div>
          <div class="text-xs text-slate-500 mt-1">คะแนนรวม (${res.percentage}%) - ${res.gradeLevel}</div>
        </div>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">ชื่อผู้เข้าสอบ:</span>
            <span class="font-bold text-slate-800">${res.fullName} (${res.className}) เลขที่ ${res.rollNumber}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">ผลการประเมิน:</span>
            <span class="font-bold ${res.isPassed ? 'text-emerald-600' : 'text-amber-600'}">${res.isPassed ? 'ผ่านเกณฑ์' : 'ควรปรับปรุง'}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-100">
            <span class="text-slate-500">บันทึกเมื่อ:</span>
            <span class="font-bold text-slate-800">${new Date(res.submittedAt).toLocaleString('th-TH')}</span>
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.remove('hidden');
  }

  closeLatestResultModal() {
    const modal = document.getElementById('latest-result-modal');
    if (modal) modal.classList.add('hidden');
  }

  renderMathExpressions() {
    const liveContainer = document.getElementById('sec-exam-live');
    if (liveContainer && !liveContainer.classList.contains('hidden')) {
      KaTeXAdapter.renderAllMath(liveContainer);
    }
    const resultContainer = document.getElementById('sec-exam-result');
    if (resultContainer && !resultContainer.classList.contains('hidden')) {
      KaTeXAdapter.renderAllMath(resultContainer);
    }
  }
}

