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
  calculatePhotonFrequency,
  calculatePhotonWavelength,
  electronVoltsToJoules
} from '../physics/blackbody-solver.js';
import {
  calculateBohrRadius,
  calculateBohrVelocity,
  calculateIonizationEnergy
} from '../physics/bohr-atom-solver.js';
import {
  calculateTransitionEnergy,
  getTransitionDetails
} from '../physics/hydrogen-spectrum-solver.js';
import { RYDBERG_CONSTANT } from '../shared/constants.js';
import { formatLatexScientific } from '../utils/format.js';

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

    this.attemptId = null;
    this.attemptSeed = 0;
    this._seedCounter = 0;
    this.questions = [];
    this.userAnswers = {};
    this.tabSwitchCount = 0;
    this.examResult = null;

    this.timerInterval = null;
    this.onTimerTick = null;
    this.onTimeExpired = null;
    this.onAutoSubmitted = null;
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
    if (customSeed !== null) {
      this.attemptSeed = customSeed;
    } else {
      this._seedCounter += 1;
      this.attemptSeed = (
        Date.now() ^
        Math.floor(Math.random() * 0xffffffff) ^
        Math.imul(this._seedCounter, 2654435761)
      ) >>> 0;
    }

    this.timeRemaining = this.durationSeconds;
    this.startTime = Date.now();
    this.endTime = this.startTime + (this.durationSeconds * 1000);
    this.attemptId = `u19_exam_${this.rollNumber}_${this.attemptSeed}_${this.startTime}`;
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
   * Generate 5 balanced IPST exam questions (1 Choice + 4 Numeric calculations)
   * Scope: 19.1.1 Planck's Hypothesis, 19.1.2 Bohr's Model, 19.1.3 Hydrogen Spectra (No Wien's Law)
   */
  _generateExamPaper(R, seed) {
    const paper = [];

    // =========================================================================
    // Q1: Concept Multiple Choice across 19.1.1 - 19.1.3 (2 Marks, 6-item pool)
    // =========================================================================
    const rawChoicePool = [
      {
        questionText: 'ข้อใดกล่าวถึง "สมมติฐานของพลังค์" (Planck’s Hypothesis) ได้ถูกต้องที่สุด?',
        correctText: 'พลังงานที่วัตถุรับหรือแผ่ออกมาในรูปคลื่นแม่เหล็กไฟฟ้ามีค่าเฉพาะที่เป็นจำนวนเต็มเท่าของ hf (E = nhf)',
        distractors: [
          'พลังงานคลื่นแม่เหล็กไฟฟ้าถูกแผ่ออกมาอย่างต่อเนื่องไม่มีที่สิ้นสุดตามทฤษฎีกลศาสตร์ดั้งเดิม',
          'พลังงานของโฟตอนแปรผกผันกับความถี่ของคลื่นแม่เหล็กไฟฟ้า',
          'อะตอมสามารถดูดกลืนหรือคายพลังงานในปริมาณใดๆ ก็ได้โดยไม่จำกัดค่า'
        ],
        explanation: 'มักซ์ พลังค์ เสนอว่าพลังงานของคลื่นแม่เหล็กไฟฟ้าที่สั่นมีค่าเฉพาะเป็นก้อนพลังงาน (ควอนตัม) ตามสมการ E = nhf'
      },
      {
        questionText: 'ตามทฤษฎีแบบจำลองอะตอมของโบร์ ข้อใดอธิบายสถานะคงตัว (Stationary State) ได้ถูกต้อง?',
        correctText: 'อิเล็กตรอนโคจรรอบนิวเคลียสในบางวงโคจรโดยไม่แผ่คลื่นแม่เหล็กไฟฟ้า และมีโมเมนตัมเชิงมุมเป็นจำนวนเต็มเท่าของ h/(2π)',
        distractors: [
          'อิเล็กตรอนต้องเคลื่อนที่ด้วยอัตราเร็วแสงในทุกระดับชั้นวงโคจร',
          'อิเล็กตรอนจะแผ่คลื่นแม่เหล็กไฟฟ้าออกมาตลอดเวลาขณะเคลื่อนที่เป็นวงกลม',
          'อิเล็กตรอนสามารถอยู่ในระดับพลังงานใดๆ ก็ได้ระหว่างชั้นพลังงานได้อย่างต่อเนื่อง'
        ],
        explanation: 'สมมติฐานข้อที่ 1 ของโบร์ระบุว่า อิเล็กตรอนเคลื่อนที่ในวงโคจรคงตัวโดยไม่แผ่คลื่น และมีโมเมนตัมเชิงมุม L = nħ'
      },
      {
        questionText: 'เมื่ออิเล็กตรอนในอะตอมไฮโดรเจนเปลี่ยนระดับพลังงานจากชั้นที่สูงกว่าลงมายังชั้นที่ต่ำกว่า จะเกิดปรากฏการณ์ใด?',
        correctText: 'อะตอมจะปล่อยโฟตอนที่มีพลังงานเท่ากับผลต่างระหว่างระดับพลังงานทั้งสอง (ΔE = |E_f - E_i|)',
        distractors: [
          'อะตอมจะดูดกลืนโฟตอนเข้าไปเพื่อรักษาความเสถียรของนิวเคลียส',
          'โปรตอนในนิวเคลียสจะหลุดออกจากอะตอมเป็นรังสีแคโทด',
          'อิเล็กตรอนจะเพิ่มอัตราเร็วในวงโคจรให้สูงขึ้นกว่าเดิมโดยไม่ปล่อยพลังงาน'
        ],
        explanation: 'การเปลี่ยนจากระดับพลังงานสูงลงสู่ระดับพลังงานต่ำจะคายพลังงานออกมาเป็นโฟตอนหนึ่งตัวที่มีพลังงาน ΔE = hf'
      },
      {
        questionText: 'เส้นสเปกตรัมของอะตอมไฮโดรเจนในช่วงแสงที่ตามองเห็นได้ (Visible Light) จัดอยู่ในอนุกรมใด?',
        correctText: 'อนุกรมบัลเมอร์ (Balmer Series) ที่เปลี่ยนระดับพลังงานลงมายัง n_f = 2',
        distractors: [
          'อนุกรมไลแมน (Lyman Series) ที่เปลี่ยนระดับพลังงานลงมายัง n_f = 1',
          'อนุกรมพาสเชน (Paschen Series) ที่เปลี่ยนระดับพลังงานลงมายัง n_f = 3',
          'อนุกรมฟุนด์ (Pfund Series) ที่เปลี่ยนระดับพลังงานลงมายัง n_f = 5'
        ],
        explanation: 'อนุกรมบัลเมอร์ (n_f = 2) ให้เส้นสเปกตรัมในย่านแสงที่ตามองเห็น ส่วนไลแมนอยู่ในย่าน UV และพาสเชน/แบร์เก็ตต์/ฟุนด์อยู่ในย่าน IR'
      },
      {
        questionText: 'ตามแบบจำลองอะตอมของโบร์ รัศมีวงโคจรของอิเล็กตรอนในอะตอมไฮโดรเจนที่ระดับพลังงาน n แปรผันอย่างไร?',
        correctText: 'แปรผันตรงกับกำลังสองของเลขควอนตัม (r_n = n² r₁)',
        distractors: [
          'แปรผันตรงกับเลขควอนตัมกำลังหนึ่ง (r_n = n r₁)',
          'แปรผกผันกับเลขควอนตัม (r_n = r₁ / n)',
          'แปรผกผันกับกำลังสองของเลขควอนตัม (r_n = r₁ / n²)'
        ],
        explanation: 'ตามทฤษฎีของโบร์ รัศมีวงโคจรที่ระดับ n มีค่า r_n = n² r₁ (เช่น n = 2 มีรัศมีเป็น 4 เท่าของ r₁)'
      },
      {
        questionText: 'แสงสีน้ำเงินมีความยาวคลื่นสั้นกว่าแสงสีแดง เมื่อเปรียบเทียบพลังงานของโฟตอน 1 อนุภาค ข้อใดถูกต้อง?',
        correctText: 'โฟตอนของแสงสีน้ำเงินมีพลังงานมากกว่าโฟตอนของแสงสีแดง เพราะ E = hc/λ',
        distractors: [
          'โฟตอนของแสงสีแดงมีพลังงานมากกว่า เพราะมีความยาวคลื่นมากกว่า',
          'โฟตอนทั้งสองสีมีพลังงานเท่ากัน เพราะเคลื่อนที่ในสุญญากาศด้วยอัตราเร็ว c เท่ากัน',
          'ไม่สามารถเปรียบเทียบได้จนกว่าจะทราบความเข้มของแหล่งกำเนิดแสง'
        ],
        explanation: 'พลังงานของโฟตอน 1 ตัวแปรผกผันกับความยาวคลื่นตามสมการ E = hc/λ จึงทำให้แสงสีน้ำเงิน (λ สั้นกว่า) มีพลังงานต่อโฟตอนสูงกว่า'
      }
    ];

    const choiceIdxPick = getSeededInt(R, 100, 0, rawChoicePool.length - 1, seed);
    const chosenConcept = rawChoicePool[choiceIdxPick];
    const originalChoices = [
      { text: chosenConcept.correctText, isCorrect: true },
      ...chosenConcept.distractors.map(d => ({ text: d, isCorrect: false }))
    ];

    const shuffledChoices = getSeededShuffle(R, 101, originalChoices, seed);
    const correctIdx = shuffledChoices.findIndex(c => c.isCorrect);

    paper.push({
      index: 0,
      type: 'choice',
      topic: '19.1.1 - 19.1.3 แนวคิดฟิสิกส์อะตอม (สมมติฐานพลังค์ โบร์ และสเปกตรัม)',
      title: 'ทฤษฎีฟิสิกส์อะตอม (ปรนัย 4 ตัวเลือก)',
      score: 2,
      problemText: chosenConcept.questionText,
      choices: shuffledChoices.map(c => c.text),
      correctChoiceIndex: correctIdx,
      explanation: chosenConcept.explanation
    });

    // =========================================================================
    // Q2: Calculation 19.1.1 — Quantum Energy E (eV) OR Frequency f (×10¹⁴ Hz)
    // =========================================================================
    const q2Variant = getSeededInt(R, 200, 0, 1, seed);
    if (q2Variant === 0) {
      const freqCoeff = getDynamicParam(R, 4.10, 0.11, 0.90, { min: 4.00, max: 9.50, decimals: 2 }, seed + 201);
      const energy = calculateQuantumEnergy(freqCoeff * 1e14, 1);
      const ansEV = Math.round(energy.electronVolts * 100) / 100;

      paper.push({
        index: 1,
        type: 'numeric',
        topic: '19.1.1 สมมติฐานของพลังค์ (ควอนตัมของพลังงาน)',
        title: 'การคำนวณควอนตัมของพลังงานจากความถี่',
        score: 2,
        problemText: `คลื่นแม่เหล็กไฟฟ้ามีความถี่ \\(f = ${freqCoeff.toFixed(2)} \\times 10^{14} \\text{ Hz}\\) จงคำนวณควอนตัมของพลังงาน (\\(E\\)) ในหน่วยอิเล็กตรอนโวลต์ (\\(\\text{eV}\\)) กำหนด \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\) และ \\(1 \\text{ eV} = 1.602 \\times 10^{-19} \\text{ J}\\)`,
        unit: 'eV',
        correctAnswer: ansEV,
        tolerance: 0.03,
        explanation: `\\(E = \\frac{hf}{e} = \\frac{(6.626 \\times 10^{-34})(${freqCoeff.toFixed(2)} \\times 10^{14})}{1.602 \\times 10^{-19}} = ${ansEV.toFixed(2)} \\text{ eV}\\)`
      });
    } else {
      const energyEV = getDynamicParam(R, 1.55, 0.065, 0.55, { min: 1.50, max: 4.50, decimals: 2 }, seed + 202);
      const energyJ = electronVoltsToJoules(energyEV);
      const freqHz = calculatePhotonFrequency(energyJ);
      const ansFreq14 = Math.round((freqHz / 1e14) * 100) / 100;

      paper.push({
        index: 1,
        type: 'numeric',
        topic: '19.1.1 สมมติฐานของพลังค์ (ความถี่ของแสง)',
        title: 'การคำนวณความถี่ของแสงจากควอนตัมของพลังงาน',
        score: 2,
        problemText: `แสงมีควอนตัมของพลังงาน \\(E = ${energyEV.toFixed(2)} \\text{ eV}\\) จงหาความถี่ของแสงนี้ (กรอกเฉพาะตัวเลขหน้าสัญกรณ์ในหน่วย \\(\\times 10^{14} \\text{ Hz}\\)) กำหนด \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\) และ \\(1 \\text{ eV} = 1.602 \\times 10^{-19} \\text{ J}\\)`,
        unit: '× 10¹⁴ Hz',
        correctAnswer: ansFreq14,
        tolerance: 0.03,
        explanation: `\\(f = \\frac{E}{h} = \\frac{(${energyEV.toFixed(2)})(1.602 \\times 10^{-19})}{6.626 \\times 10^{-34}} = ${ansFreq14.toFixed(2)} \\times 10^{14} \\text{ Hz}\\)`
      });
    }

    // =========================================================================
    // Q3: Calculation 19.1.1 — Wavelength λ (nm) OR Quantum Multiple E_n = nE₁
    // =========================================================================
    const q3Variant = getSeededInt(R, 300, 0, 1, seed);
    if (q3Variant === 0) {
      const energyCoeff = getDynamicParam(R, 2.85, 0.052, 0.45, { min: 2.80, max: 5.20, decimals: 2 }, seed + 301);
      const lambdaM = calculatePhotonWavelength(energyCoeff * 1e-19);
      const ansNm = Math.round(lambdaM * 1e9 * 10) / 10;

      paper.push({
        index: 2,
        type: 'numeric',
        topic: '19.1.1 สมมติฐานของพลังค์ (ความยาวคลื่นของแสง)',
        title: 'การคำนวณความยาวคลื่นจากควอนตัมของพลังงาน',
        score: 2,
        problemText: `ถ้าควอนตัมของพลังงานของแสงที่ตามองเห็นได้มีพลังงาน \\(E = ${energyCoeff.toFixed(2)} \\times 10^{-19} \\text{ J}\\) จงหาความยาวคลื่น (\\(\\lambda\\)) ในหน่วยนาโนเมตร (\\(\\text{nm}\\)) กำหนด \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\) และ \\(c = 3.00 \\times 10^8 \\text{ m/s}\\)`,
        unit: 'nm',
        correctAnswer: ansNm,
        tolerance: 0.03,
        explanation: `\\(\\lambda = \\frac{hc}{E} = \\frac{(6.626 \\times 10^{-34})(3.00 \\times 10^8)}{${energyCoeff.toFixed(2)} \\times 10^{-19}} = ${formatLatexScientific(lambdaM)} \\text{ m} = ${ansNm.toFixed(1)} \\text{ nm}\\)`
      });
    } else {
      const e1Coeff = getDynamicParam(R, 10.50, 0.50, 3.00, { min: 10.00, max: 35.00, decimals: 2 }, seed + 302);
      const nChoices = [2, 3, 4];
      const nQuantum = nChoices[getSeededInt(R, 303, 0, nChoices.length - 1, seed)];
      const ansEn = Math.round(nQuantum * e1Coeff * 100) / 100;

      paper.push({
        index: 2,
        type: 'numeric',
        topic: '19.1.1 สมมติฐานของพลังค์ (จำนวนควอนตัม)',
        title: 'การคำนวณพลังงานจากจำนวนควอนตัม',
        score: 2,
        problemText: `แสงความถี่หนึ่งมีพลังงานต่ำที่สุดเท่ากับ \\(E_1 = ${e1Coeff.toFixed(2)} \\times 10^{-19} \\text{ J}\\) จงหาพลังงานของแสงเมื่อมีจำนวนควอนตัมของพลังงานเป็น \\(n = ${nQuantum}\\) (กรอกเฉพาะตัวเลขหน้าสัญกรณ์ในหน่วย \\(\\times 10^{-19} \\text{ J}\\))`,
        unit: '× 10⁻¹⁹ J',
        correctAnswer: ansEn,
        tolerance: 0.03,
        explanation: `\\(E_{${nQuantum}} = nE_1 = ${nQuantum} \\times (${e1Coeff.toFixed(2)} \\times 10^{-19}) = ${ansEn.toFixed(2)} \\times 10^{-19} \\text{ J}\\)`
      });
    }

    // =========================================================================
    // Q4: Calculation 19.1.2 — Bohr Model (r_n, v_n, or IE)
    // =========================================================================
    const q4NLevels = [2, 3, 4, 5, 6, 7, 8];
    const q4N = q4NLevels[getSeededInt(R, 400, 0, q4NLevels.length - 1, seed)];
    const q4Variant = getSeededInt(R, 401, 0, 2, seed);

    if (q4Variant === 0) {
      const q4RadiusM = calculateBohrRadius(q4N);
      const q4AnsAng = Math.round(q4RadiusM * 1e10 * 100) / 100;

      paper.push({
        index: 3,
        type: 'numeric',
        topic: '19.1.2 ทฤษฎีอะตอมของโบร์ (รัศมีวงโคจร)',
        title: 'รัศมีวงโคจรของอิเล็กตรอนในอะตอมไฮโดรเจน',
        score: 2,
        problemText: `ตามแบบจำลองอะตอมของโบร์ เมื่ออิเล็กตรอนของอะตอมไฮโดรเจนอยู่ในระดับพลังงาน \\(n = ${q4N}\\) จงคำนวณรัศมีวงโคจร (\\(r_{${q4N}}\\)) ในหน่วยอังสตรอม (\\(\\text{Å}\\)) กำหนดรัศมีวงโคจรแรก \\(r_1 = 0.529 \\text{ Å}\\)`,
        unit: 'Å',
        correctAnswer: q4AnsAng,
        tolerance: 0.03,
        explanation: `\\(r_{${q4N}} = n^2 r_1 = (${q4N}^2)(0.529 \\text{ Å}) = ${q4AnsAng.toFixed(2)} \\text{ Å}\\)`
      });
    } else if (q4Variant === 1) {
      const q4VelMs = calculateBohrVelocity(q4N);
      const q4AnsVel6 = Math.round((q4VelMs / 1e6) * 100) / 100;

      paper.push({
        index: 3,
        type: 'numeric',
        topic: '19.1.2 ทฤษฎีอะตอมของโบร์ (อัตราเร็ววงโคจร)',
        title: 'อัตราเร็วของอิเล็กตรอนในวงโคจรของโบร์',
        score: 2,
        problemText: `อิเล็กตรอนในอะตอมไฮโดรเจนโคจรอยู่ที่ระดับพลังงาน \\(n = ${q4N}\\) จงหาอัตราเร็วของอิเล็กตรอน (กรอกเฉพาะตัวเลขหน้าสัญกรณ์ในหน่วย \\(\\times 10^6 \\text{ m/s}\\)) กำหนด \\(v_1 = 2.18 \\times 10^6 \\text{ m/s}\\)`,
        unit: '× 10⁶ m/s',
        correctAnswer: q4AnsVel6,
        tolerance: 0.03,
        explanation: `\\(v_{${q4N}} = \\frac{v_1}{n} = \\frac{2.18 \\times 10^6}{${q4N}} = ${q4AnsVel6.toFixed(2)} \\times 10^6 \\text{ m/s}\\)`
      });
    } else {
      const q4IonEV = Math.round(calculateIonizationEnergy(q4N).electronVolts * 100) / 100;

      paper.push({
        index: 3,
        type: 'numeric',
        topic: '19.1.2 ทฤษฎีอะตอมของโบร์ (พลังงานไอออไนเซชัน)',
        title: 'พลังงานไอออไนเซชันจากสถานะกระตุ้น',
        score: 2,
        problemText: `อะตอมไฮโดรเจนอยู่ในสถานะกระตุ้นที่ระดับพลังงาน \\(n = ${q4N}\\) จงหาพลังงานไอออไนเซชัน (\\(\\text{IE}\\)) ในหน่วยอิเล็กตรอนโวลต์ (\\(\\text{eV}\\)) กำหนดพลังงานที่สถานะพื้น \\(E_1 = -13.6 \\text{ eV}\\)`,
        unit: 'eV',
        correctAnswer: q4IonEV,
        tolerance: 0.03,
        explanation: `\\(\\text{IE} = 0 - E_{${q4N}} = \\frac{13.6}{${q4N}^2} = \\frac{13.6}{${q4N * q4N}} = ${q4IonEV.toFixed(2)} \\text{ eV}\\)`
      });
    }

    // =========================================================================
    // Q5: Calculation 19.1.3 — Hydrogen Spectra (λ, ΔE, or Series Limit λ_min)
    // =========================================================================
    const transitionsPool = [
      { ni: 2, nf: 1, label: 'อนุกรมไลแมน (Lα)' },
      { ni: 3, nf: 1, label: 'อนุกรมไลแมน (Lβ)' },
      { ni: 4, nf: 1, label: 'อนุกรมไลแมน (Lγ)' },
      { ni: 3, nf: 2, label: 'อนุกรมบัลเมอร์ (Hα)' },
      { ni: 4, nf: 2, label: 'อนุกรมบัลเมอร์ (Hβ)' },
      { ni: 5, nf: 2, label: 'อนุกรมบัลเมอร์ (Hγ)' },
      { ni: 6, nf: 2, label: 'อนุกรมบัลเมอร์ (Hδ)' },
      { ni: 4, nf: 3, label: 'อนุกรมพาสเชน' },
      { ni: 5, nf: 3, label: 'อนุกรมพาสเชน' },
      { ni: 6, nf: 3, label: 'อนุกรมพาสเชน' },
      { ni: 5, nf: 4, label: 'อนุกรมแบร์เก็ตต์' },
      { ni: 6, nf: 4, label: 'อนุกรมแบร์เก็ตต์' },
      { ni: 6, nf: 5, label: 'อนุกรมฟุนด์' },
      { ni: 7, nf: 5, label: 'อนุกรมฟุนด์' }
    ];
    const q5Variant = getSeededInt(R, 500, 0, 2, seed);
    const q5Trans = transitionsPool[getSeededInt(R, 501, 0, transitionsPool.length - 1, seed)];

    if (q5Variant === 0) {
      const q5Details = getTransitionDetails(q5Trans.ni, q5Trans.nf);
      const q5AnsNm = Math.round(q5Details.wavelengthNm * 10) / 10;

      paper.push({
        index: 4,
        type: 'numeric',
        topic: '19.1.3 เส้นสเปกตรัมของไฮโดรเจน (สูตรของริดเบิร์ก)',
        title: 'ความยาวคลื่นของโฟตอนจากการเปลี่ยนระดับพลังงาน',
        score: 2,
        problemText: `เมื่ออิเล็กตรอนในอะตอมไฮโดรเจนเปลี่ยนระดับพลังงานจาก \\(n_i = ${q5Trans.ni}\\) ลงมายัง \\(n_f = ${q5Trans.nf}\\) (${q5Trans.label}) จะแผ่โฟตอนออกมา จงคำนวณความยาวคลื่นในหน่วยนาโนเมตร (\\(\\text{nm}\\)) กำหนด \\(R_H = 1.097 \\times 10^7 \\text{ m}^{-1}\\)`,
        unit: 'nm',
        correctAnswer: q5AnsNm,
        tolerance: 0.03,
        explanation: `\\(\\frac{1}{\\lambda} = R_H \\left(\\frac{1}{${q5Trans.nf}^2} - \\frac{1}{${q5Trans.ni}^2}\\right) \\rightarrow \\lambda = ${q5AnsNm.toFixed(1)} \\text{ nm}\\)`
      });
    } else if (q5Variant === 1) {
      const q5Energy = calculateTransitionEnergy(q5Trans.ni, q5Trans.nf);
      const q5AnsEV = Math.round(q5Energy.electronVolts * 100) / 100;

      paper.push({
        index: 4,
        type: 'numeric',
        topic: '19.1.3 เส้นสเปกตรัมของไฮโดรเจน (พลังงานโฟตอน)',
        title: 'พลังงานของโฟตอนจากการเปลี่ยนระดับพลังงาน',
        score: 2,
        problemText: `อิเล็กตรอนในอะตอมไฮโดรเจนเปลี่ยนระดับพลังงานจาก \\(n_i = ${q5Trans.ni}\\) ลงมายัง \\(n_f = ${q5Trans.nf}\\) (${q5Trans.label}) จงคำนวณพลังงานของโฟตอนที่แผ่ออกมา (\\(\\Delta E\\)) ในหน่วยอิเล็กตรอนโวลต์ (\\(\\text{eV}\\)) กำหนด \\(E_n = -\\frac{13.6}{n^2} \\text{ eV}\\)`,
        unit: 'eV',
        correctAnswer: q5AnsEV,
        tolerance: 0.03,
        explanation: `\\(\\Delta E = 13.6\\left(\\frac{1}{${q5Trans.nf}^2} - \\frac{1}{${q5Trans.ni}^2}\\right) = ${q5AnsEV.toFixed(2)} \\text{ eV}\\)`
      });
    } else {
      const seriesLimits = [
        { nf: 1, name: 'อนุกรมไลแมน (Lyman)' },
        { nf: 2, name: 'อนุกรมบัลเมอร์ (Balmer)' },
        { nf: 3, name: 'อนุกรมพาสเชน (Paschen)' },
        { nf: 4, name: 'อนุกรมแบร์เก็ตต์ (Brackett)' },
        { nf: 5, name: 'อนุกรมฟุนด์ (Pfund)' }
      ];
      const chosenSeries = seriesLimits[getSeededInt(R, 502, 0, seriesLimits.length - 1, seed)];
      const lambdaMinM = (chosenSeries.nf * chosenSeries.nf) / RYDBERG_CONSTANT;
      const ansMinNm = Math.round(lambdaMinM * 1e9 * 10) / 10;

      paper.push({
        index: 4,
        type: 'numeric',
        topic: '19.1.3 เส้นสเปกตรัมของไฮโดรเจน (ความยาวคลื่นสั้นที่สุด)',
        title: 'ความยาวคลื่นสั้นที่สุดของอนุกรมสเปกตรัม',
        score: 2,
        problemText: `จงคำนวณความยาวคลื่นสั้นที่สุด (\\(\\lambda_{\\min}\\)) ของเส้นสเปกตรัมไฮโดรเจนใน<strong>${chosenSeries.name}</strong> (\\(n_i = \\infty \\rightarrow n_f = ${chosenSeries.nf}\\)) ในหน่วยนาโนเมตร (\\(\\text{nm}\\)) กำหนด \\(R_H = 1.097 \\times 10^7 \\text{ m}^{-1}\\)`,
        unit: 'nm',
        correctAnswer: ansMinNm,
        tolerance: 0.03,
        explanation: `\\(\\lambda_{\\min} = \\frac{n_f^2}{R_H} = \\frac{${chosenSeries.nf * chosenSeries.nf}}{1.097 \\times 10^7} \\text{ m} = ${ansMinNm.toFixed(1)} \\text{ nm}\\)`
      });
    }

    return paper;
  }

  recordAnswer(questionIndex, answer) {
    if (this.state !== EXAM_STATES.IN_PROGRESS) return;
    this.userAnswers[questionIndex] = answer;
    this._saveSessionState(questionIndex);
  }

  setActiveQuestion(questionIndex) {
    if (this.state !== EXAM_STATES.IN_PROGRESS) return;
    this._saveSessionState(questionIndex);
  }

  recordTabSwitch() {
    if (this.state !== EXAM_STATES.IN_PROGRESS) return;
    this.tabSwitchCount++;
    this._saveSessionState(this.restoredActiveQuestionIdx);
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
        const result = this.submitExam(true, 'timeout');
        if (typeof this.onTimeExpired === 'function') {
          this.onTimeExpired(result);
        }
        if (typeof this.onAutoSubmitted === 'function') {
          this.onAutoSubmitted(result);
        }
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
    this.restoredActiveQuestionIdx = activeQuestionIdx;
    LocalStorageAdapter.saveExamSession({
      attemptId: this.attemptId,
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

    this.attemptId = savedSession.attemptId || `u19_exam_${savedSession.rollNumber}_${savedSession.attemptSeed}_${savedSession.startTime}`;
    this.fullName = savedSession.fullName;
    this.className = savedSession.className;
    this.rollNumber = validateRollNumber(savedSession.rollNumber);
    this.attemptSeed = savedSession.attemptSeed;
    this.startTime = savedSession.startTime;
    this.endTime = savedSession.endTime;
    this.questions = savedSession.questions || [];
    this.userAnswers = savedSession.userAnswers || {};
    this.tabSwitchCount = savedSession.tabSwitchCount || 0;
    this.restoredActiveQuestionIdx = savedSession.activeQuestionIdx || 0;

    if (remainMs <= 0) {
      // Force auto-submit expired session immediately upon recovery
      this.timeRemaining = 0;
      this.submitExam(true, 'timeout-on-recovery');
      return false;
    }

    this.timeRemaining = Math.ceil(remainMs / 1000);
    this.state = EXAM_STATES.IN_PROGRESS;

    this._startTimer();
    return true;
  }

  submitExam(isAutoSubmit = false, autoSubmitReason = null) {
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
        userAnswer: userAns !== undefined && userAns !== '' ? userAns : null,
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

    const submissionStatus = isAutoSubmit ? 'auto-submitted' : 'submitted';
    const resolvedReason = isAutoSubmit ? (autoSubmitReason || 'timeout') : null;

    this.examResult = {
      attemptId: this.attemptId,
      examId: 'unit-19-1-timed-exam',
      examTitle: 'แบบทดสอบเก็บคะแนนบทที่ 19: ฟิสิกส์อะตอม (19.1)',
      fullName: this.fullName,
      className: this.className,
      rollNumber: this.rollNumber,
      durationMinutes: APP_CONFIG.exam.durationMinutes,
      totalScore,
      maxScore: APP_CONFIG.exam.maxScore,
      percentage,
      isPassed,
      gradeLevel,
      tabSwitchCount: this.tabSwitchCount,
      isAutoSubmit,
      submissionStatus,
      autoSubmitReason: resolvedReason,
      syncStatus: 'local-only',
      startedAt: this.startTime ? new Date(this.startTime).toISOString() : null,
      submittedAt: new Date().toISOString(),
      gradedQuestions
    };

    // Save result to LocalStorage & clear active session
    LocalStorageAdapter.saveExamResult(this.examResult);
    LocalStorageAdapter.clearExamSession();

    return this.examResult;
  }
}

