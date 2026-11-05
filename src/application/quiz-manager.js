/**
 * @file quiz-manager.js
 * @description Dynamic Quiz Orchestrator for Unit 19 (Planck Hypothesis & Bohr Atom).
 * Dynamic Parameter Generation (Roll Number R ∈ [1, 40] + Attempt Seed)
 * Step-by-Step KaTeX Math Solutions & 3% Tolerance Grading.
 * Conforms to Dynamic Quiz System Rules (Standard v1.13.0).
 */

import { getSeededInt, getSeededChoice, getDynamicParam } from '../utils/random.js';
import { validateRollNumber, validateNumericAnswer } from '../utils/validation.js';
import {
  calculateQuantumEnergy,
  calculateEnergyFromWavelength,
  calculateWienPeakWavelength,
  calculateWienTemperature
} from '../physics/blackbody-solver.js';
import {
  calculateBohrRadius,
  calculateBohrVelocity,
  calculateEnergyLevel,
  calculateIonizationEnergy
} from '../physics/bohr-atom-solver.js';
import {
  calculateTransitionEnergy,
  calculateTransitionWavelength,
  getTransitionDetails
} from '../physics/hydrogen-spectrum-solver.js';
import { formatScientific, formatLatexScientific, formatEnergyEV } from '../utils/format.js';
import {
  SPEED_OF_LIGHT,
  PLANCK_CONSTANT,
  WIEN_CONSTANT,
  RYDBERG_CONSTANT,
  BOHR_RADIUS_1,
  GROUND_STATE_ENERGY_EV
} from '../shared/constants.js';

export class QuizManager {
  /**
   * @param {number} [rollNumber=1] - Student roll number R (1..40)
   */
  constructor(rollNumber = 1) {
    this.rollNumber = validateRollNumber(rollNumber);
    this.currentQuestionIndex = 0;
    this.currentQuestion = null;
    this.scoreHistory = [];
    this.attemptSeed = 0;
  }

  setRollNumber(newRollNumber) {
    this.rollNumber = validateRollNumber(newRollNumber);
    return this.generateQuestion(this.currentQuestionIndex);
  }

  /**
   * Generate question by category ('19.1.1', '19.1.2', or 'mixed')
   * @param {number} [questionIndex=0]
   * @param {'19.1.1' | '19.1.2' | 'mixed'} [category='mixed']
   * @param {number} [customSeed=null]
   */
  generateQuestion(questionIndex = 0, category = 'mixed', customSeed = null) {
    this.currentQuestionIndex = questionIndex;
    this.attemptSeed = customSeed !== null ? customSeed : ((Date.now() ^ Math.floor(Math.random() * 100000)) >>> 0);
    const R = this.rollNumber;
    const B = this.attemptSeed;

    let targetTopic = category;
    if (category === 'mixed') {
      const topics = ['19.1.1', '19.1.2'];
      targetTopic = getSeededChoice(R, questionIndex, topics, B);
    }

    if (targetTopic === '19.1.1') {
      this.currentQuestion = this._generateTopic1911Question(R, questionIndex, B);
    } else {
      this.currentQuestion = this._generateTopic1912Question(R, questionIndex, B);
    }

    return this.currentQuestion;
  }

  /**
   * Topic 19.1.1: Blackbody Radiation & Planck's Hypothesis (E = nhf, Wien's Law)
   */
  _generateTopic1911Question(R, qIndex, B) {
    const subType = (R + qIndex + B) % 2 === 0 ? 1 : 2;

    if (subType === 1) {
      // Variety A: Photon energy E (in eV) from wavelength λ (in nm)
      // λ = 400 + R * 8 + offset -> range ~410 nm to 750 nm (Visible Light)
      const lambdaNm = getDynamicParam(R, 400, 8, 15, { min: 380, max: 750, decimals: 1 }, B);
      const lambdaM = lambdaNm * 1e-9;
      const energy = calculateEnergyFromWavelength(lambdaM, 1);
      const ansEV = Math.round(energy.electronVolts * 100) / 100;

      return {
        id: `q_19_1_1_A_${qIndex}_${B}`,
        topic: '19.1.1 สมมติฐานของพลังค์ (Photon Energy)',
        title: `การคำนวณพลังงานโฟตอนของแสง (เลขที่ #${R})`,
        problemText: `คลื่นแสงสีหนึ่งมีความยาวคลื่นในสุญญากาศ \\(\\lambda = ${lambdaNm.toFixed(1)} \\text{ nm}\\) จงคำนวณพลังงานของโฟตอน 1 อนุภาค (\\(E\\)) ในหน่วยอิเล็กตรอนโวลต์ (eV) กำหนดให้ \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\), \\(c = 3.00 \\times 10^8 \\text{ m/s}\\) และ \\(1 \\text{ eV} = 1.602 \\times 10^{-19} \\text{ J}\\)`,
        unit: 'eV',
        correctAnswer: ansEV,
        tolerance: 0.03,
        solutionSteps: [
          `**สูตรที่ใช้**: \\(E = hf = \\frac{hc}{\\lambda}\\)`,
          `แทนค่าความยาวคลื่น \\(\\lambda = ${lambdaNm.toFixed(1)} \\times 10^{-9} \\text{ m}\\)`,
          `คำนวณพลังงานในหน่วยจูล: \\(E = \\frac{(6.626 \\times 10^{-34})(3.00 \\times 10^8)}{${lambdaNm.toFixed(1)} \\times 10^{-9}} = ${formatLatexScientific(energy.joules)} \\text{ J}\\)`,
          `แปลงเป็นหน่วยอิเล็กตรอนโวลต์: \\(E = \\frac{${formatLatexScientific(energy.joules)}}{1.602 \\times 10^{-19}} = ${ansEV.toFixed(2)} \\text{ eV}\\)`,
          `**ตอบ**: พลังงานของโฟตอนเท่ากับ **${ansEV.toFixed(2)} eV**`
        ]
      };
    } else {
      // Variety B: Wien's Displacement Law: Peak wavelength λ_max from Temperature T
      // T = 3000 + R * 150 + offset -> 3000 K to 9500 K
      const tempK = getDynamicParam(R, 3000, 150, 200, { min: 2500, max: 9500, decimals: 0 }, B);
      const lambdaPeakM = calculateWienPeakWavelength(tempK);
      const lambdaPeakNm = Math.round(lambdaPeakM * 1e9 * 10) / 10;

      return {
        id: `q_19_1_1_B_${qIndex}_${B}`,
        topic: '19.1.1 การแผ่รังสีของวัตถุดำ (Wien’s Law)',
        title: `ความยาวคลื่นที่มีความเข้มสูงสุดของวัตถุดำ (เลขที่ #${R})`,
        problemText: `เตาหลอมโลหะทำตัวเสมือนวัตถุดำมีอุณหภูมิผิว \\(T = ${tempK.toLocaleString()} \\text{ K}\\) จงหากำหนดค่าความยาวคลื่นสูงสุดที่แผ่ออกมา (\\(\\lambda_{\\max}\\)) ตามกฎการกระจัดของวีนในหน่วยนาโนเมตร (nm) กำหนดค่าคงตัวของวีน \\(b = 2.898 \\times 10^{-3} \\text{ m}\\cdot\\text{K}\\)`,
        unit: 'nm',
        correctAnswer: lambdaPeakNm,
        tolerance: 0.03,
        solutionSteps: [
          `**สูตรที่ใช้**: กฎการกระจัดของวีน \\(\\lambda_{\\max} T = b \\rightarrow \\lambda_{\\max} = \\frac{b}{T}\\)`,
          `แทนค่าคงตัว \\(b = 2.898 \\times 10^{-3} \\text{ m}\\cdot\\text{K}\\) และ \\(T = ${tempK.toLocaleString()} \\text{ K}\\)`,
          `\\(\\lambda_{\\max} = \\frac{2.898 \\times 10^{-3}}{${tempK}} = ${formatLatexScientific(lambdaPeakM)} \\text{ m}\\)`,
          `แปลงเป็นนาโนเมตร (nm): \\(\\lambda_{\\max} = ${lambdaPeakNm.toFixed(1)} \\text{ nm}\\)`,
          `**ตอบ**: ความยาวคลื่นที่เข้มที่สุดเท่ากับ **${lambdaPeakNm.toFixed(1)} nm**`
        ]
      };
    }
  }

  /**
   * Topic 19.1.2: Bohr's Atomic Model & Hydrogen Spectra (r_n, E_n, Transitions)
   */
  _generateTopic1912Question(R, qIndex, B) {
    const subType = (R + qIndex + B) % 2 === 0 ? 1 : 2;

    if (subType === 1) {
      // Variety A: Bohr Orbit Radius r_n = n² * r₁
      // Choose level n from 2, 3, 4, 5
      const nLevels = [2, 3, 4, 5];
      const n = getSeededChoice(R, qIndex, nLevels, B) || 2;
      const radiusM = calculateBohrRadius(n);
      const radiusAngstrom = Math.round(radiusM * 1e10 * 100) / 100;

      return {
        id: `q_19_1_2_A_${qIndex}_${B}`,
        topic: '19.1.2 ทฤษฎีอะตอมของโบร์ (Bohr Radius)',
        title: `รัศมีวงโคจรของอิเล็กตรอน (เลขที่ #${R})`,
        problemText: `ตามทฤษฎีอะตอมของโบร์ สำหรับอะตอมไฮโดรเจนที่ถูกกระตุ้นให้อิเล็กตรอนอยู่ที่ระดับพลังงาน \\(n = ${n}\\) จงหารัศมีวงโคจร (\\(r_{${n}}\\)) ในหน่วยอังสตรอม (\\(\\text{Å}\\)) กำหนดรัศมีวงโคจรที่สถานะพื้น \\(r_1 = 0.529 \\text{ Å} = 5.29 \\times 10^{-11} \\text{ m}\\)`,
        unit: 'Å',
        correctAnswer: radiusAngstrom,
        tolerance: 0.03,
        solutionSteps: [
          `**สูตรที่ใช้**: \\(r_n = n^2 r_1\\)`,
          `ที่ระดับพลังงาน \\(n = ${n}\\) จะได้ \\(n^2 = ${n}^2 = ${n * n}\\)`,
          `แทนค่า \\(r_1 = 0.529 \\text{ Å}\\): \\(r_{${n}} = (${n}^2)(0.529) = ${radiusAngstrom.toFixed(2)} \\text{ Å}\\)`,
          `หรือในหน่วยเมตร: \\(r_{${n}} = ${formatLatexScientific(radiusM)} \\text{ m}\\)`,
          `**ตอบ**: รัศมีวงโคจรเท่ากับ **${radiusAngstrom.toFixed(2)} Å**`
        ]
      };
    } else {
      // Variety B: Transition wavelength using Rydberg Formula (e.g. Balmer H-alpha 3->2 or Lyman 2->1)
      const transitions = [
        { ni: 3, nf: 2, name: 'อนุกรมบัลเมอร์ (Hα)' },
        { ni: 4, nf: 2, name: 'อนุกรมบัลเมอร์ (Hβ)' },
        { ni: 2, nf: 1, name: 'อนุกรมไลแมน (Lα)' },
        { ni: 4, nf: 3, name: 'อนุกรมพาสเชน' }
      ];
      const selected = getSeededChoice(R, qIndex, transitions, B) || transitions[0];
      const details = getTransitionDetails(selected.ni, selected.nf);
      const ansNm = Math.round(details.wavelengthNm * 10) / 10;

      return {
        id: `q_19_1_2_B_${qIndex}_${B}`,
        topic: '19.1.2 เส้นสเปกตรัมของไฮโดรเจน (Rydberg Formula)',
        title: `ความยาวคลื่นสเปกตรัมจากการเปลี่ยนระดับพลังงาน (เลขที่ #${R})`,
        problemText: `เมื่ออิเล็กตรอนในอะตอมของไฮโดรเจนเปลี่ยนระดับพลังงานจาก \\(n_i = ${selected.ni}\\) ลงมายัง \\(n_f = ${selected.nf}\\) (${selected.name}) จะแผ่โฟตอนออกมา จงคำนวณความยาวคลื่น (\\(\\lambda\\)) ของโฟตอนในหน่วยนาโนเมตร (nm) กำหนดค่าคงตัวของริดเบิร์ก \\(R_H = 1.097 \\times 10^7 \\text{ m}^{-1}\\)`,
        unit: 'nm',
        correctAnswer: ansNm,
        tolerance: 0.03,
        solutionSteps: [
          `**สูตรที่ใช้**: สูตรของริดเบิร์ก \\(\\frac{1}{\\lambda} = R_H \\left( \\frac{1}{n_f^2} - \\frac{1}{n_i^2} \\right)\\)`,
          `แทนค่า \\(n_f = ${selected.nf}\\) และ \\(n_i = ${selected.ni}\\): \\(\\frac{1}{${selected.nf}^2} - \\frac{1}{${selected.ni}^2} = \\frac{1}{${selected.nf * selected.nf}} - \\frac{1}{${selected.ni * selected.ni}}\\)` ,
          `แทนค่า \\(R_H = 1.097 \\times 10^7 \\text{ m}^{-1}\\): \\(\\frac{1}{\\lambda} = (1.097 \\times 10^7) \\times \\left( ${Math.abs(1 / (selected.nf * selected.nf) - 1 / (selected.ni * selected.ni)).toFixed(4)} \\right)\\)`,
          `จะได้ \\(\\lambda = ${formatLatexScientific(details.wavelengthMeters)} \\text{ m} = ${ansNm.toFixed(1)} \\text{ nm}\\)`,
          `**ตอบ**: ความยาวคลื่นของโฟตอนเท่ากับ **${ansNm.toFixed(1)} nm**`
        ]
      };
    }
  }

  /**
   * Evaluate student answer for current question
   * @param {number|string} studentAnswer
   * @returns {object} Evaluation result
   */
  evaluateAnswer(studentAnswer) {
    if (!this.currentQuestion) {
      return { isCorrect: false, message: 'ไม่มีโจทย์ปัจจุบัน' };
    }

    const evalResult = validateNumericAnswer(
      studentAnswer,
      this.currentQuestion.correctAnswer,
      this.currentQuestion.tolerance
    );

    this.scoreHistory.push({
      questionId: this.currentQuestion.id,
      topic: this.currentQuestion.topic,
      isCorrect: evalResult.isCorrect,
      userAnswer: evalResult.userVal,
      correctAnswer: evalResult.correctVal,
      relativeErrorPercent: evalResult.relativeErrorPercent,
      timestamp: Date.now()
    });

    return evalResult;
  }
}

