/**
 * @file exam-manager.js
 * @description Timed Exam Orchestrator for Unit 19 (15 minutes, 5 questions, 10 marks total).
 * Implements Finite State Machine (IDLE -> IN_PROGRESS -> SUBMITTED),
 * Deterministic RNG seeded by Roll Number + Attempt Seed,
 * Anti-Cheat Monitoring, Session Persistence & Refresh Recovery.
 * Conforms to Timed Exam System Rules (Standard v1.13.0).
 */

import { APP_CONFIG } from '../shared/config.js';
import { validateRollNumber, validateNumericAnswer } from '../utils/validation.js';
import { getSeededInt, getSeededShuffle, getDynamicParam } from '../utils/random.js';
import { LocalStorageAdapter } from '../adapters/storage/local-storage.js';
import {
  calculateQuantumEnergy,
  calculateEnergyFromWavelength,
  calculateWienPeakWavelength
} from '../physics/blackbody-solver.js';
import {
  calculateBohrRadius,
  calculateEnergyLevel
} from '../physics/bohr-atom-solver.js';
import {
  calculateTransitionWavelength,
  getTransitionDetails
} from '../physics/hydrogen-spectrum-solver.js';
import { formatScientific, formatLatexScientific } from '../utils/format.js';

export const EXAM_STATES = {
  IDLE: 'IDLE',
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED'
};

export class ExamManager {
  /**
   * @param {number} [rollNumber=1]
   */
  constructor(rollNumber = 1) {
    this.rollNumber = validateRollNumber(rollNumber);
    this.fullName = '';
    this.className = '';
    this.state = EXAM_STATES.IDLE;

    this.durationSeconds = APP_CONFIG.exam.durationMinutes * 60; // 900 seconds
    this.timeRemaining = this.durationSeconds;
    this.startTime = null;
    this.endTime = null;

    this.attemptSeed = 0;
    this.questions = [];
    this.userAnswers = {};
    this.tabSwitchCount = 0;
    this.examResult = null;

    this.timerInterval = null;
    this.onTimerTick = null;
    this.onTimeExpired = null;
    this.onCheatDetected = null;

    this.restoredActiveQuestionIdx = 0;
  }

  setIdentity(fullName, className, rollNumber) {
    this.fullName = String(fullName || '').trim();
    this.className = String(className || '').trim();
    this.rollNumber = validateRollNumber(rollNumber);
  }

  /**
   * Start a new exam session
   * @param {number} [customSeed=null]
   * @returns {Array<object>} Generated 5 exam questions
   */
  startExam(customSeed = null) {
    this.state = EXAM_STATES.IN_PROGRESS;
    this.attemptSeed = customSeed !== null
      ? customSeed
      : ((Date.now() ^ Math.floor(Math.random() * 999999)) >>> 0);

    this.timeRemaining = this.durationSeconds;
    this.startTime = Date.now();
    this.endTime = this.startTime + (this.durationSeconds * 1000);
    this.tabSwitchCount = 0;
    this.userAnswers = {};
    this.examResult = null;

    // Generate balanced 5 questions
    this.questions = this._generateExamPaper(this.rollNumber, this.attemptSeed);

    // Save initial session state
    this._saveSessionState(0);

    // Start timer interval
    this._startTimer();

    return this.questions;
  }

  /**
   * Generate 5 balanced exam questions (1 Choice + 4 Numeric calculations)
   */
  _generateExamPaper(R, seed) {
    const paper = [];

    // =========================================================================
    // Q1: Concept Multiple Choice (2 Marks)
    // =========================================================================
    const rawChoicePool = [
      {
        questionText: 'ข้อใดกล่าวถึง "สมมติฐานของพลังค์" (Planck’s Hypothesis) ได้ถูกต้องที่สุด?',
        correctText: 'พลังงานที่วัตถุดำดูดกลืนหรือแผ่ออกมามีค่าได้เฉพาะบางค่าที่เป็นจำนวนเต็มเท่าของ hf (ควอนตัมของพลังงาน)',
        distractors: [
          'พลังงานคลื่นแม่เหล็กไฟฟ้าถูกแผ่ออกมาอย่างต่อเนื่องไม่มีที่สิ้นสุดตามทฤษฎีกลศาสตร์ดั้งเดิม',
          'วัตถุที่มีอุณหภูมิสูงจะแผ่คลื่นแม่เหล็กไฟฟ้าเฉพาะช่วงความถี่เดียวเท่านั้น',
          'อิเล็กตรอนในอะตอมเคลื่อนที่เป็นวงกลมรอบนิวเคลียสโดยแผ่รังสีออกมาอย่างต่อเนื่องจนตกลงสู่นิวเคลียส'
        ],
        explanation: 'มักซ์ พลังค์ เสนอว่าอะตอมที่สั่นดูดกลืนหรือแผ่รังสีเป็นก้อนพลังงานเฉพาะค่า เรียกว่า ควอนตัม ตามสมการ E = nhf'
      },
      {
        questionText: 'ตามทฤษฎีแบบจำลองอะตอมของโบร์ ข้อใดอธิบายสถานะคงตัว (Stationary State) ได้ถูกต้อง?',
        correctText: 'อิเล็กตรอนโคจรรอบนิวเคลียสในบางวงโคจรโดยไม่แผ่คลื่นแม่เหล็กไฟฟ้า และมีโมเมนตัมเชิงมุมเป็นจำนวนเต็มเท่าของ h/(2π)',
        distractors: [
          'อิเล็กตรอนต้องเคลื่อนที่ด้วยความเร็วแสงในทุกระดับชั้นวงโคจร',
          'อิเล็กตรอนจะแผ่คลื่นแม่เหล็กไฟฟ้าออกมาตลอดเวลาขณะเคลื่อนที่เป็นวงกลม',
          'อิเล็กตรอนสามารถอยู่ในระดับพลังงานใดๆ ก็ได้ระหว่างชั้นพลังงานได้อย่างต่อเนื่อง'
        ],
        explanation: 'สมมติฐานข้อที่ 1 ของโบร์ระบุว่า อิเล็กตรอนเคลื่อนที่ในวงโคจรคงตัวโดยไม่แผ่คลื่น และมีโมเมนตัมเชิงมุม L = nħ'
      }
    ];

    const chosenConcept = (R + seed) % 2 === 0 ? rawChoicePool[0] : rawChoicePool[1];
    const originalChoices = [
      { text: chosenConcept.correctText, isCorrect: true },
      ...chosenConcept.distractors.map(d => ({ text: d, isCorrect: false }))
    ];

    const shuffledChoices = getSeededShuffle(R, 101, originalChoices, seed);
    const correctIdx = shuffledChoices.findIndex(c => c.isCorrect);

    paper.push({
      index: 0,
      type: 'choice',
      topic: '19.1 แนวคิดสมมติฐานของพลังค์และแบบจำลองอะตอมของโบร์',
      title: 'ข้อที่ 1: ทฤษฎีฟิสิกส์อะตอม (ปรนัย 4 ตัวเลือก)',
      score: 2,
      problemText: chosenConcept.questionText,
      choices: shuffledChoices.map(c => c.text),
      correctChoiceIndex: correctIdx,
      explanation: chosenConcept.explanation
    });

    // =========================================================================
    // Q2: Calculation 19.1.1 — Photon Energy E = hc / λ (2 Marks)
    // =========================================================================
    const q2LambdaNm = getDynamicParam(R, 420, 7.5, 12, { min: 400, max: 700, decimals: 1 }, seed);
    const q2LambdaM = q2LambdaNm * 1e-9;
    const q2Energy = calculateEnergyFromWavelength(q2LambdaM, 1);
    const q2AnsEV = Math.round(q2Energy.electronVolts * 100) / 100;

    paper.push({
      index: 1,
      type: 'numeric',
      topic: '19.1.1 สมมติฐานของพลังค์ (Photon Energy)',
      title: 'ข้อที่ 2: การคำนวณพลังงานโฟตอนของแสง',
      score: 2,
      problemText: `หลอดไฟให้แสงสีเดียวมีความยาวคลื่น \\(\\lambda = ${q2LambdaNm.toFixed(1)} \\text{ nm}\\) จงคำนวณพลังงานของโฟตอนแต่ละตัวในหน่วยอิเล็กตรอนโวลต์ (eV) กำหนด \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\), \\(c = 3.00 \\times 10^8 \\text{ m/s}\\) และ \\(1 \\text{ eV} = 1.602 \\times 10^{-19} \\text{ J}\\)`,
      unit: 'eV',
      correctAnswer: q2AnsEV,
      tolerance: 0.03,
      explanation: `\\(E = \\frac{hc}{\\lambda} = \\frac{(6.626 \\times 10^{-34})(3.00 \\times 10^8)}{${q2LambdaNm.toFixed(1)} \\times 10^{-9}} \\text{ J} = ${q2AnsEV.toFixed(2)} \\text{ eV}\\)`
    });

    // =========================================================================
    // Q3: Calculation 19.1.1 — Wien's Law: λ_max = b / T (2 Marks)
    // =========================================================================
    const q3TempK = getDynamicParam(R, 3500, 120, 150, { min: 3000, max: 8000, decimals: 0 }, seed);
    const q3PeakM = calculateWienPeakWavelength(q3TempK);
    const q3AnsNm = Math.round(q3PeakM * 1e9 * 10) / 10;

    paper.push({
      index: 2,
      type: 'numeric',
      topic: '19.1.1 การแผ่รังสีของวัตถุดำ (Wien’s Law)',
      title: 'ข้อที่ 3: กฎการกระจัดของวีนสำหรับวัตถุดำ',
      score: 2,
      problemText: `ดาวฤกษ์ดวงหนึ่งแผ่รังสีเสมือนวัตถุดำที่มีอุณหภูมิยังผลที่ผิว \\(T = ${q3TempK.toLocaleString()} \\text{ K}\\) จงคำนวณหาความยาวคลื่นที่ให้ความเข้มการแผ่รังสีสูงสุด (\\(\\lambda_{\\max}\\)) ในหน่วยนาโนเมตร (nm) กำหนดค่าคงตัวของวีน \\(b = 2.898 \\times 10^{-3} \\text{ m}\\cdot\\text{K}\\)`,
      unit: 'nm',
      correctAnswer: q3AnsNm,
      tolerance: 0.03,
      explanation: `\\(\\lambda_{\\max} = \\frac{b}{T} = \\frac{2.898 \\times 10^{-3}}{${q3TempK}} \\text{ m} = ${q3AnsNm.toFixed(1)} \\text{ nm}\\)`
    });

    // =========================================================================
    // Q4: Calculation 19.1.2 — Bohr Orbit Radius r_n = n² * r₁ (2 Marks)
    // =========================================================================
    const q4NLevels = [2, 3, 4, 5];
    const q4N = q4NLevels[(R + seed) % q4NLevels.length];
    const q4RadiusM = calculateBohrRadius(q4N);
    const q4AnsAng = Math.round(q4RadiusM * 1e10 * 100) / 100;

    paper.push({
      index: 3,
      type: 'numeric',
      topic: '19.1.2 ทฤษฎีอะตอมของโบร์ (Bohr Radius)',
      title: 'ข้อที่ 4: รัศมีวงโคจรของอิเล็กตรอนในอะตอมไฮโดรเจน',
      score: 2,
      problemText: `ตามแบบจำลองอะตอมของโบร์ เมื่ออิเล็กตรอนของอะตอมไฮโดรเจนถูกกระตุ้นให้อยู่ในระดับพลังงาน \\(n = ${q4N}\\) จงคำนวณรัศมีของวงโคจรนี้ (\\(r_{${q4N}}\\)) ในหน่วยอังสตรอม (\\(\\text{Å}\\)) กำหนดรัศมีวงโคจรแรก \\(r_1 = 0.529 \\text{ Å}\\)`,
      unit: 'Å',
      correctAnswer: q4AnsAng,
      tolerance: 0.03,
      explanation: `\\(r_{${q4N}} = n^2 r_1 = (${q4N}^2)(0.529 \\text{ Å}) = ${q4AnsAng.toFixed(2)} \\text{ Å}\\)`
    });

    // =========================================================================
    // Q5: Calculation 19.1.2 — Spectral Transition: Rydberg Formula (2 Marks)
    // =========================================================================
    const transitionsPool = [
      { ni: 3, nf: 2, label: 'อนุกรมบัลเมอร์ (Hα)' },
      { ni: 4, nf: 2, label: 'อนุกรมบัลเมอร์ (Hβ)' },
      { ni: 2, nf: 1, label: 'อนุกรมไลแมน (Lα)' }
    ];
    const q5Trans = transitionsPool[(R + seed) % transitionsPool.length];
    const q5Details = getTransitionDetails(q5Trans.ni, q5Trans.nf);
    const q5AnsNm = Math.round(q5Details.wavelengthNm * 10) / 10;

    paper.push({
      index: 4,
      type: 'numeric',
      topic: '19.1.2 เส้นสเปกตรัมของไฮโดรเจน (Rydberg Formula)',
      title: 'ข้อที่ 5: ความยาวคลื่นของโฟตอนจากการเปลี่ยนระดับพลังงาน',
      score: 2,
      problemText: `เมื่ออิเล็กตรอนในอะตอมของไฮโดรเจนเปลี่ยนระดับพลังงานจาก \\(n_i = ${q5Trans.ni}\\) ลงมายัง \\(n_f = ${q5Trans.nf}\\) (${q5Trans.label}) จะแผ่โฟตอนออกมา จงคำนวณความยาวคลื่นของโฟตอนในหน่วยนาโนเมตร (nm) กำหนดค่าคงตัวของริดเบิร์ก \\(R_H = 1.097 \\times 10^7 \\text{ m}^{-1}\\)`,
      unit: 'nm',
      correctAnswer: q5AnsNm,
      tolerance: 0.03,
      explanation: `\\(\\frac{1}{\\lambda} = R_H \\left(\\frac{1}{${q5Trans.nf}^2} - \\frac{1}{${q5Trans.ni}^2}\\right) \\rightarrow \\lambda = ${q5AnsNm.toFixed(1)} \\text{ nm}\\)`
    });

    return paper;
  }

  recordAnswer(questionIndex, answer) {
    if (this.state !== EXAM_STATES.IN_PROGRESS) return;
    this.userAnswers[questionIndex] = answer;
    this._saveSessionState(questionIndex);
  }

  recordTabSwitch() {
    if (this.state !== EXAM_STATES.IN_PROGRESS) return;
    this.tabSwitchCount++;
    this._saveSessionState();
    if (typeof this.onCheatDetected === 'function') {
      this.onCheatDetected(this.tabSwitchCount);
    }
  }

  _startTimer() {
    this._stopTimer();
    this.timerInterval = setInterval(() => {
      const now = Date.now();
      const remainMs = Math.max(0, this.endTime - now);
      this.timeRemaining = Math.ceil(remainMs / 1000);

      if (typeof this.onTimerTick === 'function') {
        this.onTimerTick(this.timeRemaining, this.formatTimerString());
      }

      if (this.timeRemaining <= 0) {
        this._stopTimer();
        if (typeof this.onTimeExpired === 'function') {
          this.onTimeExpired();
        }
        this.submitExam(true);
      }
    }, 1000);
  }

  _stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTimerString() {
    const mins = Math.floor(this.timeRemaining / 60);
    const secs = this.timeRemaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  _saveSessionState(activeQuestionIdx = 0) {
    if (this.state !== EXAM_STATES.IN_PROGRESS) return;
    LocalStorageAdapter.saveExamSession({
      fullName: this.fullName,
      className: this.className,
      rollNumber: this.rollNumber,
      attemptSeed: this.attemptSeed,
      startTime: this.startTime,
      endTime: this.endTime,
      questions: this.questions,
      userAnswers: this.userAnswers,
      tabSwitchCount: this.tabSwitchCount,
      activeQuestionIdx
    });
  }

  resumeExamSession(savedSession) {
    if (!savedSession || !savedSession.endTime) return false;

    const now = Date.now();
    const remainMs = savedSession.endTime - now;

    if (remainMs <= 0) {
      // Auto-submit expired session
      this.fullName = savedSession.fullName;
      this.className = savedSession.className;
      this.rollNumber = savedSession.rollNumber;
      this.questions = savedSession.questions;
      this.userAnswers = savedSession.userAnswers || {};
      this.tabSwitchCount = savedSession.tabSwitchCount || 0;
      this.state = EXAM_STATES.SUBMITTED;
      this.submitExam(true);
      return false;
    }

    this.fullName = savedSession.fullName;
    this.className = savedSession.className;
    this.rollNumber = savedSession.rollNumber;
    this.attemptSeed = savedSession.attemptSeed;
    this.startTime = savedSession.startTime;
    this.endTime = savedSession.endTime;
    this.timeRemaining = Math.ceil(remainMs / 1000);
    this.questions = savedSession.questions;
    this.userAnswers = savedSession.userAnswers || {};
    this.tabSwitchCount = savedSession.tabSwitchCount || 0;
    this.restoredActiveQuestionIdx = savedSession.activeQuestionIdx || 0;
    this.state = EXAM_STATES.IN_PROGRESS;

    this._startTimer();
    return true;
  }

  submitExam(isAutoSubmit = false) {
    this._stopTimer();
    this.state = EXAM_STATES.SUBMITTED;

    let totalScore = 0;
    const gradedQuestions = this.questions.map((q, idx) => {
      const userAns = this.userAnswers[idx];
      let isCorrect = false;

      if (q.type === 'choice') {
        isCorrect = parseInt(userAns, 10) === q.correctChoiceIndex;
      } else {
        const valRes = validateNumericAnswer(userAns, q.correctAnswer, q.tolerance);
        isCorrect = valRes.isCorrect;
      }

      const earnedScore = isCorrect ? q.score : 0;
      totalScore += earnedScore;

      return {
        ...q,
        userAnswer: userAns !== undefined ? userAns : null,
        isCorrect,
        earnedScore
      };
    });

    const percentage = Math.round((totalScore / APP_CONFIG.exam.maxScore) * 100);
    const isPassed = totalScore >= APP_CONFIG.exam.passingScore;

    let gradeLevel = 'ปรับปรุง';
    if (percentage >= 80) gradeLevel = 'ดีเยี่ยม (Excellent)';
    else if (percentage >= 70) gradeLevel = 'ดีมาก (Very Good)';
    else if (percentage >= 60) gradeLevel = 'ผ่านเกณฑ์ (Passed)';

    this.examResult = {
      fullName: this.fullName,
      className: this.className,
      rollNumber: this.rollNumber,
      totalScore,
      maxScore: APP_CONFIG.exam.maxScore,
      percentage,
      isPassed,
      gradeLevel,
      tabSwitchCount: this.tabSwitchCount,
      isAutoSubmit,
      submittedAt: new Date().toISOString(),
      gradedQuestions
    };

    // Save result to LocalStorage & clear active session
    LocalStorageAdapter.saveExamResult(this.examResult);
    LocalStorageAdapter.clearExamSession();

    return this.examResult;
  }
}

