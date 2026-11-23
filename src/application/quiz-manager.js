/**
 * @file quiz-manager.js
 * @description Dynamic Quiz Orchestrator for Unit 19 (Planck Hypothesis & Bohr Atom).
 * Dynamic Parameter Generation (Roll Number R ∈ [1, 40] + Attempt Seed)
 * Supports 'standard' (Textbook fixed parameters) and 'random' (RNG based on Roll Number)
 * Step-by-Step KaTeX Math Solutions & 3% Tolerance Grading.
 * Conforms to Dynamic Quiz System Rules (Standard v1.13.0).
 */

import { createSeededRNG, getSeededInt, getSeededChoice, getDynamicParam } from '../utils/random.js';
import { validateRollNumber, validateNumericAnswer } from '../utils/validation.js';
import {
  calculateQuantumEnergy,
  calculatePhotonFrequency,
  calculatePhotonWavelength,
  electronVoltsToJoules
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
    this.mode = 'random'; // 'standard' or 'random'
    this.usedParamsByTemplate = new Map();
    this._rngCounter = 0;
  }

  setRollNumber(newRollNumber) {
    this.rollNumber = validateRollNumber(newRollNumber);
    return this.generateQuestion(this.currentQuestionIndex);
  }

  setMode(newMode) {
    this.mode = newMode === 'standard' ? 'standard' : 'random';
    return this.generateQuestion(this.currentQuestionIndex);
  }

  /**
   * Reset session anti-repeat parameter history
   */
  resetUsedParameters() {
    this.usedParamsByTemplate.clear();
  }

  /**
   * Generate a dynamic parameter combining student Roll Number R and Attempt Seed B
   * with strict 0% repeat guarantee against both standardValue and prior session values.
   * @param {string} templateKey - Unique template key (e.g. '19.1.1_Q1')
   * @param {number} R - Validated student roll number [1, 40]
   * @param {{ baseMin: number, baseStep: number, randomRange: number, min: number, max: number, decimals: number }} config
   * @param {number} B - Attempt seed
   * @param {number} standardValue - Textbook standard value forbidden in random mode
   * @param {boolean} [trackHistory=true] - Track session values to guarantee 0% repeat
   * @returns {number}
   */
  _generateUniqueParam(templateKey, R, config, B, standardValue, trackHistory = true) {
    const { baseMin, baseStep, randomRange, min, max, decimals } = config;
    const factor = Math.pow(10, decimals);
    const roundVal = (v) => Math.round(v * factor) / factor;
    const stdVal = roundVal(standardValue);

    let usedSet = null;
    if (trackHistory) {
      if (!this.usedParamsByTemplate.has(templateKey)) {
        this.usedParamsByTemplate.set(templateKey, new Set());
      }
      usedSet = this.usedParamsByTemplate.get(templateKey);
    }

    const isForbidden = (val) =>
      Math.abs(val - stdVal) < 1e-9 || (usedSet !== null && usedSet.has(val));

    // Pass 1: Dynamic formula R + B with retry salts
    const maxRetries = 50;
    for (let retry = 0; retry < maxRetries; retry++) {
      const retrySeed =
        retry === 0
          ? B
          : ((B + Math.imul(retry, 7919) + Math.imul(R, 131)) >>> 0);
      const candidate = roundVal(
        getDynamicParam(R, baseMin, baseStep, randomRange, { min, max, decimals }, retrySeed)
      );
      if (!isForbidden(candidate)) {
        if (usedSet) usedSet.add(candidate);
        return candidate;
      }
    }

    // Pass 2: Deterministic exhaustive unused-pool fallback (guarantees 0% repeat)
    const minInt = Math.round(min * factor);
    const maxInt = Math.round(max * factor);
    const buildUnusedPool = () => {
      const pool = [];
      for (let i = minInt; i <= maxInt; i++) {
        const val = roundVal(i / factor);
        if (!isForbidden(val)) {
          pool.push(val);
        }
      }
      return pool;
    };

    let unusedPool = buildUnusedPool();
    if (unusedPool.length === 0 && usedSet) {
      // Exhausted entire parameter space in one session: keep only most recent value forbidden
      const lastVal = Array.from(usedSet).pop();
      usedSet.clear();
      if (lastVal !== undefined) usedSet.add(lastVal);
      unusedPool = buildUnusedPool();
    }

    const fallbackSeed = (Math.imul(R, 10007) + Math.imul(B, 9973) + 31337) >>> 0;
    const rng = createSeededRNG(fallbackSeed);
    const picked = unusedPool[Math.floor(rng() * unusedPool.length)];
    if (usedSet && picked !== undefined) usedSet.add(picked);
    return picked;
  }

  /**
   * Generate question by category ('19.1.1', '19.1.2', '19.1.3', or 'mixed')
   * @param {number} [questionIndex=0]
   * @param {'19.1.1' | '19.1.2' | '19.1.3' | 'mixed'} [category='mixed']
   * @param {number} [customSeed=null]
   * @param {'standard' | 'random' | null} [mode=null]
   */
  generateQuestion(questionIndex = 0, category = 'mixed', customSeed = null, mode = null) {
    this.currentQuestionIndex = questionIndex;
    const isDeterministicReplay = customSeed !== null;
    if (isDeterministicReplay) {
      this.attemptSeed = customSeed;
    } else {
      this._rngCounter += 1;
      this.attemptSeed = (
        Date.now() ^
        Math.floor(Math.random() * 0xffffffff) ^
        Math.imul(this._rngCounter, 2654435761)
      ) >>> 0;
    }
    const R = this.rollNumber;
    const B = this.attemptSeed;
    const currentMode = mode || this.mode;
    const trackHistory = !isDeterministicReplay;

    let targetTopic = category;
    if (category === 'mixed') {
      const topics = ['19.1.1', '19.1.2', '19.1.3'];
      targetTopic = getSeededChoice(R, questionIndex, topics, B);
    }

    switch (targetTopic) {
      case '19.1.1':
        this.currentQuestion = this._generateTopic1911Question(R, questionIndex, B, currentMode, trackHistory);
        break;
      case '19.1.2':
        this.currentQuestion = this._generateTopic1912Question(R, questionIndex, B, currentMode);
        break;
      case '19.1.3':
      default:
        this.currentQuestion = this._generateTopic1913Question(R, questionIndex, B, currentMode);
        break;
    }

    return this.currentQuestion;
  }

  /**
   * Topic 19.1.1: Planck's Hypothesis & Quantum of Energy (IPST 5-Question Bank)
   * Q1: E (eV) from frequency f (×10¹⁴ Hz)
   * Q2: Frequency f (×10¹⁴ Hz) from energy E (eV)
   * Q3: Energy at n = 2 and n = 3 (×10⁻¹⁹ J) from minimum quantum energy E₁ (2-part multi-numeric)
   * Q4: E (eV) from frequency f (×10¹⁴ Hz, 1 decimal)
   * Q5: Wavelength λ (nm) from quantum energy E (×10⁻¹⁹ J)
   */
    _generateTopic1911Question(R, qIndex, B, mode = 'random', trackHistory = true) {
      const isStandard = mode === 'standard';
      const totalInTopic = 5;
      const subType = (((qIndex % totalInTopic) + totalInTopic) % totalInTopic) + 1;
      const titleSuffix = isStandard ? '(โจทย์ตัวเลขมาตรฐาน สสวท.)' : `(เลขที่ #${R})`;

      if (subType === 1) {
        // Q1: Quantum energy E (eV) from frequency f = 6.50 × 10^14 Hz
        const freqCoeff = isStandard
          ? 6.50
          : this._generateUniqueParam(
            '19.1.1_Q1',
            R,
            { baseMin: 4.10, baseStep: 0.11, randomRange: 0.95, min: 4.00, max: 9.50, decimals: 2 },
            B,
            6.50,
            trackHistory
          );
        const freqHz = freqCoeff * 1e14;
        const energy = calculateQuantumEnergy(freqHz, 1);
        const ansEV = Math.round(energy.electronVolts * 100) / 100;

        return {
          id: `q_19_1_1_Q1_${qIndex}_${B}`,
          type: 'numeric',
          questionNumber: 1,
          totalInTopic,
          generatedParam: freqCoeff,
          topic: '19.1.1 สมมติฐานของพลังค์ (ควอนตัมของพลังงาน)',
          title: `คำนวณควอนตัมของพลังงานจากความถี่ ${titleSuffix}`,
          problemText: `ควอนตัมของพลังงานของคลื่นแม่เหล็กไฟฟ้าที่มีความถี่ \\(f = ${freqCoeff.toFixed(2)} \\times 10^{14} \\text{ Hz}\\) มีค่าเท่าใดในหน่วยอิเล็กตรอนโวลต์ (\\(\\text{eV}\\)) กำหนดให้ \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\) และ \\(1 \\text{ eV} = 1.602 \\times 10^{-19} \\text{ J}\\)`,
          unit: 'eV',
          correctAnswer: ansEV,
          tolerance: 0.03,
          solutionSteps: [
            `**สูตรที่ใช้**: ควอนตัมของพลังงาน \\(E = hf\\)`,
            `แทนค่า \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\) และ \\(f = ${freqCoeff.toFixed(2)} \\times 10^{14} \\text{ Hz}\\)`,
            `คำนวณพลังงานในหน่วยจูล: \\(E = (6.626 \\times 10^{-34})(${freqCoeff.toFixed(2)} \\times 10^{14}) = ${formatLatexScientific(energy.joules)} \\text{ J}\\)`,
            `แปลงเป็นหน่วยอิเล็กตรอนโวลต์: \\(E = \\frac{${formatLatexScientific(energy.joules)}}{1.602 \\times 10^{-19}} = ${ansEV.toFixed(2)} \\text{ eV}\\)`,
              `**ตอบ**: ควอนตัมของพลังงานเท่ากับ **${ansEV.toFixed(2)} eV**`
          ]
        };
      }

      if (subType === 2) {
        // Q2: Frequency f (× 10^14 Hz) from quantum energy E = 2.50 eV
        const energyEV = isStandard
          ? 2.50
          : this._generateUniqueParam(
            '19.1.1_Q2',
            R,
            { baseMin: 1.55, baseStep: 0.065, randomRange: 0.55, min: 1.50, max: 4.50, decimals: 2 },
            B,
            2.50,
            trackHistory
          );
        const energyJ = electronVoltsToJoules(energyEV);
        const freqHz = calculatePhotonFrequency(energyJ);
        const ansFreq14 = Math.round((freqHz / 1e14) * 100) / 100;

        return {
          id: `q_19_1_1_Q2_${qIndex}_${B}`,
          type: 'numeric',
          questionNumber: 2,
          totalInTopic,
          generatedParam: energyEV,
          topic: '19.1.1 สมมติฐานของพลังค์ (หาความถี่ของแสง)',
          title: `คำนวณความถี่ของแสงจากควอนตัมของพลังงาน ${titleSuffix}`,
          problemText: `แสงมีควอนตัมของพลังงาน \\(E = ${energyEV.toFixed(2)} \\text{ eV}\\) มีความถี่ (\\(f\\)) เท่าใด (กรอกเฉพาะตัวเลขหน้าสัญกรณ์ในหน่วย \\(\\times 10^{14} \\text{ Hz}\\)) กำหนดให้ \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\) และ \\(1 \\text{ eV} = 1.602 \\times 10^{-19} \\text{ J}\\)`,
          unit: '× 10¹⁴ Hz',
          correctAnswer: ansFreq14,
          tolerance: 0.03,
          solutionSteps: [
              `**สูตรที่ใช้**: \\(E = hf \\rightarrow f = \\frac{E}{h}\\)`,
            `แปลงพลังงานจากหน่วย eV เป็นจูล: \\(E = (${energyEV.toFixed(2)})(1.602 \\times 10^{-19}) = ${formatLatexScientific(energyJ)} \\text{ J}\\)`,
            `แทนค่าคำนวณความถี่: \\(f = \\frac{${formatLatexScientific(energyJ)}}{6.626 \\times 10^{-34}} = ${ansFreq14.toFixed(2)} \\times 10^{14} \\text{ Hz}\\)`,
            `**ตอบ**: ความถี่ของแสงเท่ากับ **${ansFreq14.toFixed(2)} × 10¹⁴ Hz** (ตัวเลขคำตอบ: **${ansFreq14.toFixed(2)}**)`
          ]
        };
      }

      if (subType === 3) {
        // Q3: 2-part question — Energy for n = 2 and n = 3 given minimum energy E₁ = 21.76 × 10^-19 J
        const e1Coeff = isStandard
          ? 21.76
          : this._generateUniqueParam(
            '19.1.1_Q3',
            R,
            { baseMin: 10.50, baseStep: 0.55, randomRange: 3.50, min: 10.00, max: 35.00, decimals: 2 },
            B,
            21.76,
            trackHistory
          );
        const ansN2 = Math.round(2 * e1Coeff * 100) / 100;
        const ansN3 = Math.round(3 * e1Coeff * 100) / 100;

        return {
          id: `q_19_1_1_Q3_${qIndex}_${B}`,
          type: 'multi-numeric',
          questionNumber: 3,
          totalInTopic,
          generatedParam: e1Coeff,
          topic: '19.1.1 สมมติฐานของพลังค์ (จำนวนควอนตัมของพลังงาน)',
          title: `คำนวณพลังงานเมื่อจำนวนควอนตัมเป็น 2 และ 3 ${titleSuffix}`,
          problemText: `แสงความถี่หนึ่งมีพลังงานต่ำที่สุดเท่ากับ \\(E_1 = ${e1Coeff.toFixed(2)} \\times 10^{-19} \\text{ J}\\) จงหาพลังงานของแสงเมื่อมีจำนวนควอนตัมของพลังงานเป็น \\(n = 2\\) และ \\(n = 3\\) (กรอกเฉพาะตัวเลขหน้าสัญกรณ์ในหน่วย \\(\\times 10^{-19} \\text{ J}\\) ทั้ง 2 ช่อง)`,
          unit: '× 10⁻¹⁹ J',
          correctAnswer: ansN2,
          correctAnswers: [ansN2, ansN3],
          tolerance: 0.03,
          inputs: [
            {
              id: 'n2',
              label: 'พลังงานเมื่อ n = 2',
              unit: '× 10⁻¹⁹ J',
              correctAnswer: ansN2,
              tolerance: 0.03
            },
            {
              id: 'n3',
              label: 'พลังงานเมื่อ n = 3',
              unit: '× 10⁻¹⁹ J',
              correctAnswer: ansN3,
              tolerance: 0.03
            }
          ],
          solutionSteps: [
            `**สูตรที่ใช้**: ตามสมมติฐานของพลังค์ \\(E_n = nhf = nE_1\\) โดยพลังงานต่ำที่สุดคือเมื่อ \\(n = 1\\) (\\(E_1 = ${e1Coeff.toFixed(2)} \\times 10^{-19} \\text{ J}\\))`,
            `เมื่อมีจำนวนควอนตัม \\(n = 2\\): \\(E_2 = 2 \\times (${e1Coeff.toFixed(2)} \\times 10^{-19}) = ${ansN2.toFixed(2)} \\times 10^{-19} \\text{ J}\\)`,
            `เมื่อมีจำนวนควอนตัม \\(n = 3\\): \\(E_3 = 3 \\times (${e1Coeff.toFixed(2)} \\times 10^{-19}) = ${ansN3.toFixed(2)} \\times 10^{-19} \\text{ J}\\)`,
            `**ตอบ**: เมื่อ \\(n = 2\\) เท่ากับ **${ansN2.toFixed(2)} × 10⁻¹⁹ J** และเมื่อ \\(n = 3\\) เท่ากับ **${ansN3.toFixed(2)} × 10⁻¹⁹ J**`
          ]
        };
      }

      if (subType === 4) {
        // Q4: Quantum energy E (eV) from frequency f = 5.0 × 10^14 Hz
        const freqCoeff = isStandard
          ? 5.0
          : this._generateUniqueParam(
            '19.1.1_Q4',
            R,
            { baseMin: 3.6, baseStep: 0.12, randomRange: 0.9, min: 3.5, max: 9.0, decimals: 1 },
            B,
            5.0,
            trackHistory
          );
        const freqHz = freqCoeff * 1e14;
        const energy = calculateQuantumEnergy(freqHz, 1);
        const ansEV = Math.round(energy.electronVolts * 100) / 100;

        return {
          id: `q_19_1_1_Q4_${qIndex}_${B}`,
          type: 'numeric',
          questionNumber: 4,
          totalInTopic,
          generatedParam: freqCoeff,
          topic: '19.1.1 สมมติฐานของพลังค์ (ควอนตัมของพลังงานของแสง)',
          title: `คำนวณควอนตัมพลังงานของแสง ${titleSuffix}`,
          problemText: `แสงที่มีความถี่ \\(f = ${freqCoeff.toFixed(1)} \\times 10^{14} \\text{ Hz}\\) ควอนตัมของพลังงานมีค่าเท่าใดในหน่วยอิเล็กตรอนโวลต์ (\\(\\text{eV}\\)) กำหนดให้ \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\) และ \\(1 \\text{ eV} = 1.602 \\times 10^{-19} \\text{ J}\\)`,
          unit: 'eV',
          correctAnswer: ansEV,
          tolerance: 0.03,
          solutionSteps: [
            `**สูตรที่ใช้**: \\(E = hf\\)`,
            `แทนค่า \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\) และ \\(f = ${freqCoeff.toFixed(1)} \\times 10^{14} \\text{ Hz}\\)`,
            `คำนวณพลังงานในหน่วยจูล: \\(E = (6.626 \\times 10^{-34})(${freqCoeff.toFixed(1)} \\times 10^{14}) = ${formatLatexScientific(energy.joules)} \\text{ J}\\)`,
            `แปลงเป็นหน่วยอิเล็กตรอนโวลต์: \\(E = \\frac{${formatLatexScientific(energy.joules)}}{1.602 \\times 10^{-19}} = ${ansEV.toFixed(2)} \\text{ eV}\\)`,
            `**ตอบ**: ควอนตัมของพลังงานเท่ากับ **${ansEV.toFixed(2)} eV** (หรือประมาณ **${ansEV.toFixed(1)} eV**)`
          ]
        };
      }

      // Q5: Wavelength λ (nm) from quantum energy E = 3.62 × 10^-19 J
      const energyCoeff = isStandard
        ? 3.62
        : this._generateUniqueParam(
          '19.1.1_Q5',
          R,
          { baseMin: 2.85, baseStep: 0.052, randomRange: 0.45, min: 2.80, max: 5.20, decimals: 2 },
          B,
          3.62,
          trackHistory
        );
      const energyJ = energyCoeff * 1e-19;
      const lambdaM = calculatePhotonWavelength(energyJ);
      const ansNm = Math.round(lambdaM * 1e9 * 10) / 10;

      return {
        id: `q_19_1_1_Q5_${qIndex}_${B}`,
        type: 'numeric',
        questionNumber: 5,
        totalInTopic,
        generatedParam: energyCoeff,
        topic: '19.1.1 สมมติฐานของพลังค์ (หาความยาวคลื่นของแสง)',
        title: `คำนวณความยาวคลื่นของแสงจากควอนตัมของพลังงาน ${titleSuffix}`,
        problemText: `ถ้าควอนตัมของพลังงานของแสงที่ตามองเห็นได้มีพลังงาน \\(E = ${energyCoeff.toFixed(2)} \\times 10^{-19} \\text{ J}\\) จงหาความยาวคลื่น (\\(\\lambda\\)) ของแสงนี้ในหน่วยนาโนเมตร (\\(\\text{nm}\\)) กำหนดให้ \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\) และ \\(c = 3.00 \\times 10^8 \\text{ m/s}\\)`,
        unit: 'nm',
        correctAnswer: ansNm,
        tolerance: 0.03,
        solutionSteps: [
          `**สูตรที่ใช้**: \\(E = \\frac{hc}{\\lambda} \\rightarrow \\lambda = \\frac{hc}{E}\\)`,
          `แทนค่า \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\), \\(c = 3.00 \\times 10^8 \\text{ m/s}\\) และ \\(E = ${energyCoeff.toFixed(2)} \\times 10^{-19} \\text{ J}\\)`,
          `\\(\\lambda = \\frac{(6.626 \\times 10^{-34})(3.00 \\times 10^8)}{${energyCoeff.toFixed(2)} \\times 10^{-19}} = ${formatLatexScientific(lambdaM)} \\text{ m}\\)`,
          `แปลงเป็นหน่วยนาโนเมตร (\\(1 \\text{ nm} = 10^{-9} \\text{ m}\\)): \\(\\lambda = ${ansNm.toFixed(1)} \\text{ nm}\\)`,
          `**ตอบ**: ความยาวคลื่นของแสงเท่ากับ **${ansNm.toFixed(1)} nm**`
        ]
      };
    }

    /**
     * Topic 19.1.2: Bohr's Atomic Model (r_n, E_n, v_n)
     */
    _generateTopic1912Question(R, qIndex, B, mode = 'random') {
      const isStandard = mode === 'standard';
      const subType = isStandard ? ((qIndex % 2 === 0) ? 1 : 2) : ((R + qIndex + B) % 2 === 0 ? 1 : 2);

      if (subType === 1) {
        // Variety A: Bohr Orbit Radius r_n = n² * r₁
        const nLevels = [2, 3, 4, 5];
        const n = isStandard ? 3 : (getSeededChoice(R, qIndex, nLevels, B) || 2);
        const radiusM = calculateBohrRadius(n);
        const radiusAngstrom = Math.round(radiusM * 1e10 * 100) / 100;
        const titleSuffix = isStandard ? '(โจทย์ตัวเลขมาตรฐาน สสวท.)' : `(เลขที่ #${R})`;

        return {
          id: `q_19_1_2_A_${qIndex}_${B}`,
          topic: '19.1.2 ทฤษฎีอะตอมของโบร์ (Bohr Radius)',
          title: `รัศมีวงโคจรของอิเล็กตรอน ${titleSuffix}`,
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
        // Variety B: Ionization / Binding energy at level n: E_n = 13.6 / n²
        const nLevels = [2, 3, 4];
        const n = isStandard ? 2 : (getSeededChoice(R, qIndex, nLevels, B) || 2);
        const ionEnergyEV = Math.round((13.6 / (n * n)) * 100) / 100;
        const titleSuffix = isStandard ? '(โจทย์ตัวเลขมาตรฐาน สสวท.)' : `(เลขที่ #${R})`;

        return {
          id: `q_19_1_2_B_${qIndex}_${B}`,
          topic: '19.1.2 ทฤษฎีอะตอมของโบร์ (Energy Levels)',
          title: `พลังงานไอออไนเซชันจากสถานะกระตุ้น ${titleSuffix}`,
          problemText: `อะตอมไฮโดรเจนอยู่ในสถานะกระตุ้นที่มีระดับพลังงาน \\(n = ${n}\\) จงหาพลังงานต่ำสุดที่ต้องให้กับอิเล็กตรอน (พลังงานไอออไนเซชัน) เพื่อทำให้อิเล็กตรอนหลุดออกจากอะตอมเป็นอิสระ ในหน่วยอิเล็กตรอนโวลต์ (eV) กำหนดพลังงานที่สถานะพื้น \\(E_1 = -13.6 \\text{ eV}\\)`,
          unit: 'eV',
          correctAnswer: ionEnergyEV,
          tolerance: 0.03,
          solutionSteps: [
            `**สูตรที่ใช้**: ระดับพลังงานของโบร์ \\(E_n = \\frac{E_1}{n^2} = -\\frac{13.6}{n^2} \\text{ eV}\\)`,
            `พลังงานไอออไนเซชันคือพลังงานที่ต้องเพิ่มเพื่อพาอิเล็กตรอนไปที่ \\(n = \\infty\\) (ซึ่ง \\(E_\\infty = 0\\)): \\(\\text{IE} = 0 - E_n = \\frac{13.6}{n^2} \\text{ eV}\\)`,
            `แทนค่า \\(n = ${n}\\): \\(\\text{IE} = \\frac{13.6}{${n * n}} = ${ionEnergyEV.toFixed(2)} \\text{ eV}\\)`,
            `**ตอบ**: พลังงานไอออไนเซชันเท่ากับ **${ionEnergyEV.toFixed(2)} eV**`
          ]
        };
      }
    }

    /**
     * Topic 19.1.3: Hydrogen Spectra & Rydberg Transitions
     */
    _generateTopic1913Question(R, qIndex, B, mode = 'random') {
      const isStandard = mode === 'standard';
      const subType = isStandard ? ((qIndex % 2 === 0) ? 1 : 2) : ((R + qIndex + B) % 2 === 0 ? 1 : 2);

      if (subType === 1) {
        // Variety A: Transition wavelength using Rydberg Formula
        const transitions = [
          { ni: 3, nf: 2, name: 'อนุกรมบัลเมอร์ (Hα)' },
          { ni: 4, nf: 2, name: 'อนุกรมบัลเมอร์ (Hβ)' },
          { ni: 2, nf: 1, name: 'อนุกรมไลแมน (Lα)' },
          { ni: 4, nf: 3, name: 'อนุกรมพาสเชน' }
        ];
        const selected = isStandard ? transitions[0] : (getSeededChoice(R, qIndex, transitions, B) || transitions[0]);
        const details = getTransitionDetails(selected.ni, selected.nf);
        const ansNm = Math.round(details.wavelengthNm * 10) / 10;
        const titleSuffix = isStandard ? '(โจทย์ตัวเลขมาตรฐาน สสวท.)' : `(เลขที่ #${R})`;

        return {
          id: `q_19_1_3_A_${qIndex}_${B}`,
          topic: '19.1.3 เส้นสเปกตรัมของไฮโดรเจน (Rydberg Formula)',
          title: `ความยาวคลื่นสเปกตรัมจากการเปลี่ยนระดับพลังงาน ${titleSuffix}`,
          problemText: `เมื่ออิเล็กตรอนในอะตอมของไฮโดรเจนเปลี่ยนระดับพลังงานจาก \\(n_i = ${selected.ni}\\) ลงมายัง \\(n_f = ${selected.nf}\\) (${selected.name}) จะแผ่โฟตอนออกมา จงคำนวณความยาวคลื่น (\\(\\lambda\\)) ของโฟตอนในหน่วยนาโนเมตร (nm) กำหนดค่าคงตัวของริดเบิร์ก \\(R_H = 1.097 \\times 10^7 \\text{ m}^{-1}\\)`,
          unit: 'nm',
          correctAnswer: ansNm,
          tolerance: 0.03,
          solutionSteps: [
            `**สูตรที่ใช้**: สูตรของริดเบิร์ก \\(\\frac{1}{\\lambda} = R_H \\left( \\frac{1}{n_f^2} - \\frac{1}{n_i^2} \\right)\\)`,
            `แทนค่า \\(n_f = ${selected.nf}\\) และ \\(n_i = ${selected.ni}\\): \\(\\frac{1}{${selected.nf}^2} - \\frac{1}{${selected.ni}^2} = \\frac{1}{${selected.nf * selected.nf}} - \\frac{1}{${selected.ni * selected.ni}}\\)`,
            `แทนค่า \\(R_H = 1.097 \\times 10^7 \\text{ m}^{-1}\\): \\(\\frac{1}{\\lambda} = (1.097 \\times 10^7) \\times \\left( ${Math.abs(1 / (selected.nf * selected.nf) - 1 / (selected.ni * selected.ni)).toFixed(4)} \\right)\\)`,
            `จะได้ \\(\\lambda = ${formatLatexScientific(details.wavelengthMeters)} \\text{ m} = ${ansNm.toFixed(1)} \\text{ nm}\\)`,
            `**ตอบ**: ความยาวคลื่นของโฟตอนเท่ากับ **${ansNm.toFixed(1)} nm**`
          ]
        };
      } else {
        // Variety B: Transition photon energy ΔE = |Ef - Ei| in eV
        const transitions = [
          { ni: 2, nf: 1, name: 'อนุกรมไลแมน (Lα)' },
          { ni: 3, nf: 2, name: 'อนุกรมบัลเมอร์ (Hα)' },
          { ni: 3, nf: 1, name: 'อนุกรมไลแมน (Lβ)' }
        ];
        const selected = isStandard ? transitions[0] : (getSeededChoice(R, qIndex, transitions, B) || transitions[0]);
        const ei = -13.6 / (selected.ni * selected.ni);
        const ef = -13.6 / (selected.nf * selected.nf);
        const deltaE = Math.round(Math.abs(ef - ei) * 100) / 100;
        const titleSuffix = isStandard ? '(โจทย์ตัวเลขมาตรฐาน สสวท.)' : `(เลขที่ #${R})`;

        return {
          id: `q_19_1_3_B_${qIndex}_${B}`,
          topic: '19.1.3 พลังงานโฟตอนจากการเปลี่ยนระดับพลังงาน (Photon Emission)',
          title: `พลังงานของโฟตอนที่แผ่ออกมา ${titleSuffix}`,
          problemText: `อิเล็กตรอนในอะตอมไฮโดรเจนเปลี่ยนระดับพลังงานจาก \\(n_i = ${selected.ni}\\) ไปยัง \\(n_f = ${selected.nf}\\) (${selected.name}) จงคำนวณพลังงานของโฟตอนที่แผ่ออกมา (\\(\\Delta E\\)) ในหน่วยอิเล็กตรอนโวลต์ (eV) กำหนดพลังงานที่ระดับ \\(n\\) คือ \\(E_n = -\\frac{13.6}{n^2} \\text{ eV}\\)`,
          unit: 'eV',
          correctAnswer: deltaE,
          tolerance: 0.03,
          solutionSteps: [
            `**สูตรที่ใช้**: \\(\\Delta E = |E_f - E_i| = 13.6 \\left( \\frac{1}{n_f^2} - \\frac{1}{n_i^2} \\right) \\text{ eV}\\)`,
            `คำนวณ \\(E_i = -\\frac{13.6}{${selected.ni}^2} = ${ei.toFixed(2)} \\text{ eV}\\)`,
            `คำนวณ \\(E_f = -\\frac{13.6}{${selected.nf}^2} = ${ef.toFixed(2)} \\text{ eV}\\)`,
            `\\(\\Delta E = |${ef.toFixed(2)} - (${ei.toFixed(2)})| = ${deltaE.toFixed(2)} \\text{ eV}\\)`,
            `**ตอบ**: พลังงานของโฟตอนเท่ากับ **${deltaE.toFixed(2)} eV**`
          ]
        };
      }
    }

    /**
     * Evaluate student answer for current question (supports single numeric & multi-numeric)
     * @param {number|string|Array<number|string>} studentAnswer
     * @returns {object} Evaluation result
     */
    evaluateAnswer(studentAnswer) {
      if (!this.currentQuestion) {
        return { isCorrect: false, message: 'ไม่มีโจทย์ปัจจุบัน' };
      }

      if (this.currentQuestion.type === 'multi-numeric' || Array.isArray(studentAnswer)) {
        return this.evaluateMultiAnswer(Array.isArray(studentAnswer) ? studentAnswer : [studentAnswer]);
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

    /**
     * Evaluate multi-part numeric answers for questions with multiple sub-questions
     * @param {Array<number|string>} studentAnswers
     * @returns {{ isCorrect: boolean, results: Array<object>, message: string }}
     */
    evaluateMultiAnswer(studentAnswers = []) {
      if (!this.currentQuestion || !Array.isArray(this.currentQuestion.inputs)) {
        return { isCorrect: false, results: [], message: 'ไม่มีโจทย์หลายคำตอบในขณะนี้' };
      }

      const results = this.currentQuestion.inputs.map((inputSpec, idx) => {
        const rawAns = studentAnswers[idx];
        const evalRes = validateNumericAnswer(
          rawAns,
          inputSpec.correctAnswer,
          inputSpec.tolerance ?? this.currentQuestion.tolerance
        );
        return {
          id: inputSpec.id,
          label: inputSpec.label,
          unit: inputSpec.unit || this.currentQuestion.unit || '',
          ...evalRes
        };
      });

      const isCorrect = results.every((r) => r.isCorrect);

      this.scoreHistory.push({
        questionId: this.currentQuestion.id,
        topic: this.currentQuestion.topic,
        isCorrect,
        userAnswer: results.map((r) => r.userVal),
        correctAnswer: results.map((r) => r.correctVal),
        relativeErrorPercent: Math.max(...results.map((r) => r.relativeErrorPercent)),
        timestamp: Date.now()
      });

      return {
        isCorrect,
        results,
        message: isCorrect ? 'ถูกต้องครบทุกคำตอบ!' : 'ยังมีคำตอบบางช่องที่ไม่ถูกต้อง'
      };
    }
  }
