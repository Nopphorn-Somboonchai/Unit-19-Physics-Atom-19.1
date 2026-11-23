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
  calculateAngularMomentum,
  calculateEnergyLevel,
  calculateIonizationEnergy
} from '../physics/bohr-atom-solver.js';
import {
  calculateTransitionEnergy,
  calculateTransitionWavelength,
  calculateTransitionFrequency,
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
   * Pick a discrete item (e.g. quantum level n or transition pair) combining Roll Number R
   * and Attempt Seed B with 0% repeat guarantee against standardKey and prior session picks.
   * @template T
   * @param {string} templateKey
   * @param {number} R
   * @param {T[]} pool
   * @param {number} B
   * @param {string|number} standardKey
   * @param {(item: T) => string|number} keyFn
   * @param {boolean} [trackHistory=true]
   * @returns {T}
   */
  _generateUniqueChoice(templateKey, R, pool, B, standardKey, keyFn, trackHistory = true) {
    let usedSet = null;
    if (trackHistory) {
      if (!this.usedParamsByTemplate.has(templateKey)) {
        this.usedParamsByTemplate.set(templateKey, new Set());
      }
      usedSet = this.usedParamsByTemplate.get(templateKey);
    }

    const isForbidden = (key) => key === standardKey || (usedSet !== null && usedSet.has(key));

    let available = pool.filter((item) => !isForbidden(keyFn(item)));
    if (available.length === 0 && usedSet) {
      const lastKey = Array.from(usedSet).pop();
      usedSet.clear();
      if (lastKey !== undefined) usedSet.add(lastKey);
      available = pool.filter((item) => !isForbidden(keyFn(item)));
    }
    if (available.length === 0) {
      available = pool.filter((item) => keyFn(item) !== standardKey);
    }

    const seed = (Math.imul(R, 10007) + Math.imul(B, 9973) + 42424) >>> 0;
    const rng = createSeededRNG(seed);
    const picked = available[Math.floor(rng() * available.length)] || pool[0];
    if (usedSet && picked !== undefined) {
      usedSet.add(keyFn(picked));
    }
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
        this.currentQuestion = this._generateTopic1912Question(R, questionIndex, B, currentMode, trackHistory);
        break;
      case '19.1.3':
      default:
        this.currentQuestion = this._generateTopic1913Question(R, questionIndex, B, currentMode, trackHistory);
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
     * Topic 19.1.2: Bohr's Atomic Model (5-Question Bank: r_n, v_n, L_n, IE, and 2-part r_n & IE)
     */
    _generateTopic1912Question(R, qIndex, B, mode = 'random', trackHistory = true) {
      const isStandard = mode === 'standard';
      const totalInTopic = 5;
      const subType = (((qIndex % totalInTopic) + totalInTopic) % totalInTopic) + 1;
      const titleSuffix = isStandard ? '(โจทย์ตัวเลขมาตรฐาน สสวท.)' : `(เลขที่ #${R})`;
      const nPool = [2, 3, 4, 5, 6, 7, 8, 9, 10];

      if (subType === 1) {
        // Q1: Bohr Orbit Radius r_n = n² * r₁ (Å)
        const n = isStandard
          ? 3
          : this._generateUniqueChoice('19.1.2_Q1', R, nPool, B, 3, (v) => v, trackHistory);
        const radiusM = calculateBohrRadius(n);
        const radiusAngstrom = Math.round(radiusM * 1e10 * 100) / 100;

        return {
          id: `q_19_1_2_Q1_${qIndex}_${B}`,
          type: 'numeric',
          questionNumber: 1,
          totalInTopic,
          generatedParam: n,
          topic: '19.1.2 ทฤษฎีอะตอมของโบร์ (รัศมีวงโคจร)',
          title: `รัศมีวงโคจรของอิเล็กตรอน ${titleSuffix}`,
          problemText: `ตามทฤษฎีอะตอมของโบร์ สำหรับอะตอมไฮโดรเจนที่ถูกกระตุ้นให้อิเล็กตรอนอยู่ที่ระดับพลังงาน \\(n = ${n}\\) จงหารัศมีวงโคจร (\\(r_{${n}}\\)) ในหน่วยอังสตรอม (\\(\\text{Å}\\)) กำหนดรัศมีวงโคจรที่สถานะพื้น \\(r_1 = 0.529 \\text{ Å} = 5.29 \\times 10^{-11} \\text{ m}\\)`,
          unit: 'Å',
          correctAnswer: radiusAngstrom,
          tolerance: 0.03,
          solutionSteps: [
            `**สูตรที่ใช้**: \\(r_n = n^2 r_1\\)`,
            `ที่ระดับพลังงาน \\(n = ${n}\\) จะได้ \\(n^2 = ${n}^2 = ${n * n}\\)`,
            `แทนค่า \\(r_1 = 0.529 \\text{ Å}\\): \\(r_{${n}} = (${n * n})(0.529) = ${radiusAngstrom.toFixed(2)} \\text{ Å}\\)`,
            `หรือในหน่วยเมตร: \\(r_{${n}} = ${formatLatexScientific(radiusM)} \\text{ m}\\)`,
            `**ตอบ**: รัศมีวงโคจรเท่ากับ **${radiusAngstrom.toFixed(2)} Å**`
          ]
        };
      }

      if (subType === 2) {
        // Q2: Bohr Orbital Velocity v_n = v₁ / n (× 10^6 m/s)
        const n = isStandard
          ? 2
          : this._generateUniqueChoice('19.1.2_Q2', R, nPool, B, 2, (v) => v, trackHistory);
        const velocityMs = calculateBohrVelocity(n);
        const ansVel6 = Math.round((velocityMs / 1e6) * 100) / 100;

        return {
          id: `q_19_1_2_Q2_${qIndex}_${B}`,
          type: 'numeric',
          questionNumber: 2,
          totalInTopic,
          generatedParam: n,
          topic: '19.1.2 ทฤษฎีอะตอมของโบร์ (อัตราเร็ววงโคจร)',
          title: `อัตราเร็วของอิเล็กตรอนในวงโคจรของโบร์ ${titleSuffix}`,
          problemText: `อิเล็กตรอนในอะตอมไฮโดรเจนโคจรอยู่ที่ระดับพลังงาน \\(n = ${n}\\) จงหาอัตราเร็วของอิเล็กตรอนในวงโคจรนี้ (\\(v_{${n}}\\)) (กรอกเฉพาะตัวเลขหน้าสัญกรณ์ในหน่วย \\(\\times 10^6 \\text{ m/s}\\)) กำหนดอัตราเร็วที่สถานะพื้น \\(v_1 = 2.18 \\times 10^6 \\text{ m/s}\\)`,
          unit: '× 10⁶ m/s',
          correctAnswer: ansVel6,
          tolerance: 0.03,
          solutionSteps: [
            `**สูตรที่ใช้**: \\(v_n = \\frac{v_1}{n}\\)`,
            `แทนค่า \\(v_1 = 2.18 \\times 10^6 \\text{ m/s}\\) และ \\(n = ${n}\\)`,
            `คำนวณอัตราเร็ว: \\(v_{${n}} = \\frac{2.18 \\times 10^6}{${n}} = ${ansVel6.toFixed(2)} \\times 10^6 \\text{ m/s}\\)`,
            `**ตอบ**: อัตราเร็วของอิเล็กตรอนเท่ากับ **${ansVel6.toFixed(2)} × 10⁶ m/s** (ตัวเลขคำตอบ: **${ansVel6.toFixed(2)}**)`
          ]
        };
      }

      if (subType === 3) {
        // Q3: Orbital Angular Momentum L_n = n * h / (2π) (× 10^-34 J·s)
        const n = isStandard
          ? 3
          : this._generateUniqueChoice('19.1.2_Q3', R, nPool, B, 3, (v) => v, trackHistory);
        const angularMom = calculateAngularMomentum(n);
        const ansL34 = Math.round((angularMom / 1e-34) * 100) / 100;

        return {
          id: `q_19_1_2_Q3_${qIndex}_${B}`,
          type: 'numeric',
          questionNumber: 3,
          totalInTopic,
          generatedParam: n,
          topic: '19.1.2 ทฤษฎีอะตอมของโบร์ (โมเมนตัมเชิงมุม)',
          title: `โมเมนตัมเชิงมุมของอิเล็กตรอนตามสมมติฐานโบร์ ${titleSuffix}`,
          problemText: `ตามสมมติฐานของโบร์ อิเล็กตรอนในอะตอมไฮโดรเจนที่ระดับพลังงาน \\(n = ${n}\\) จะมีขนาดของโมเมนตัมเชิงมุม (\\(L_{${n}}\\)) เท่าใด (กรอกเฉพาะตัวเลขหน้าสัญกรณ์ในหน่วย \\(\\times 10^{-34} \\text{ J}\\cdot\\text{s}\\)) กำหนด \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\) และ \\(\\hbar = \\frac{h}{2\\pi} \\approx 1.055 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\)`,
          unit: '× 10⁻³⁴ J·s',
          correctAnswer: ansL34,
          tolerance: 0.03,
          solutionSteps: [
            `**สูตรที่ใช้**: \\(L_n = n\\hbar = n\\frac{h}{2\\pi}\\)`,
            `แทนค่า \\(n = ${n}\\) และ \\(h = 6.626 \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\)`,
            `\\(L_{${n}} = ${n} \\times \\frac{6.626 \\times 10^{-34}}{2\\pi} = ${n} \\times (1.0546 \\times 10^{-34}) = ${ansL34.toFixed(2)} \\times 10^{-34} \\text{ J}\\cdot\\text{s}\\)`,
            `**ตอบ**: ขนาดของโมเมนตัมเชิงมุมเท่ากับ **${ansL34.toFixed(2)} × 10⁻³⁴ J·s** (ตัวเลขคำตอบ: **${ansL34.toFixed(2)}**)`
          ]
        };
      }

      if (subType === 4) {
        // Q4: Ionization Energy from excited state n: IE = 13.6 / n² (eV)
        const n = isStandard
          ? 2
          : this._generateUniqueChoice('19.1.2_Q4', R, nPool, B, 2, (v) => v, trackHistory);
        const ionEnergy = calculateIonizationEnergy(n);
        const ionEnergyEV = Math.round(ionEnergy.electronVolts * 100) / 100;

        return {
          id: `q_19_1_2_Q4_${qIndex}_${B}`,
          type: 'numeric',
          questionNumber: 4,
          totalInTopic,
          generatedParam: n,
          topic: '19.1.2 ทฤษฎีอะตอมของโบร์ (พลังงานไอออไนเซชัน)',
          title: `พลังงานไอออไนเซชันจากสถานะกระตุ้น ${titleSuffix}`,
          problemText: `อะตอมไฮโดรเจนอยู่ในสถานะกระตุ้นที่มีระดับพลังงาน \\(n = ${n}\\) จงหาพลังงานต่ำสุดที่ต้องให้กับอิเล็กตรอน (พลังงานไอออไนเซชัน) เพื่อทำให้อิเล็กตรอนหลุดออกจากอะตอมเป็นอิสระ ในหน่วยอิเล็กตรอนโวลต์ (\\(\\text{eV}\\)) กำหนดพลังงานที่สถานะพื้น \\(E_1 = -13.6 \\text{ eV}\\)`,
          unit: 'eV',
          correctAnswer: ionEnergyEV,
          tolerance: 0.03,
          solutionSteps: [
            `**สูตรที่ใช้**: ระดับพลังงานของโบร์ \\(E_n = \\frac{E_1}{n^2} = -\\frac{13.6}{n^2} \\text{ eV}\\)`,
            `พลังงานไอออไนเซชันคือพลังงานที่ต้องเพิ่มเพื่อพาอิเล็กตรอนไปที่ \\(n = \\infty\\) (ซึ่ง \\(E_\\infty = 0\\)): \\(\\text{IE} = 0 - E_n = \\frac{13.6}{n^2} \\text{ eV}\\)`,
            `แทนค่า \\(n = ${n}\\): \\(\\text{IE} = \\frac{13.6}{${n}^2} = \\frac{13.6}{${n * n}} = ${ionEnergyEV.toFixed(2)} \\text{ eV}\\)`,
            `**ตอบ**: พลังงานไอออไนเซชันเท่ากับ **${ionEnergyEV.toFixed(2)} eV**`
          ]
        };
      }

      // Q5: 2-part multi-numeric — Both Bohr Radius r_n (Å) and Ionization Energy IE (eV)
      const n = isStandard
        ? 4
        : this._generateUniqueChoice('19.1.2_Q5', R, nPool, B, 4, (v) => v, trackHistory);
      const radiusM = calculateBohrRadius(n);
      const radiusAngstrom = Math.round(radiusM * 1e10 * 100) / 100;
      const ionEnergyEV = Math.round(calculateIonizationEnergy(n).electronVolts * 100) / 100;

      return {
        id: `q_19_1_2_Q5_${qIndex}_${B}`,
        type: 'multi-numeric',
        questionNumber: 5,
        totalInTopic,
        generatedParam: n,
        topic: '19.1.2 ทฤษฎีอะตอมของโบร์ (รัศมีและพลังงานไอออไนเซชัน)',
        title: `คำนวณรัศมีวงโคจรและพลังงานไอออไนเซชัน ${titleSuffix}`,
        problemText: `อิเล็กตรอนในอะตอมไฮโดรเจนอยู่ที่ระดับพลังงาน \\(n = ${n}\\) จงหา 1) รัศมีวงโคจร (\\(r_{${n}}\\)) ในหน่วยอังสตรอม (\\(\\text{Å}\\)) และ 2) พลังงานไอออไนเซชัน (\\(\\text{IE}\\)) ในหน่วยอิเล็กตรอนโวลต์ (\\(\\text{eV}\\)) กำหนด \\(r_1 = 0.529 \\text{ Å}\\) และ \\(E_1 = -13.6 \\text{ eV}\\)`,
        unit: 'Å / eV',
        correctAnswer: radiusAngstrom,
        correctAnswers: [radiusAngstrom, ionEnergyEV],
        tolerance: 0.03,
        inputs: [
          {
            id: 'radius',
            label: `รัศมีวงโคจร r_${n}`,
            unit: 'Å',
            correctAnswer: radiusAngstrom,
            tolerance: 0.03
          },
          {
            id: 'ionization',
            label: 'พลังงานไอออไนเซชัน (IE)',
            unit: 'eV',
            correctAnswer: ionEnergyEV,
            tolerance: 0.03
          }
        ],
        solutionSteps: [
          `**สูตรที่ใช้**: \\(r_n = n^2 r_1\\) และ \\(\\text{IE} = 0 - E_n = \\frac{13.6}{n^2} \\text{ eV}\\)`,
          `คำนวณรัศมีวงโคจรที่ \\(n = ${n}\\): \\(r_{${n}} = (${n}^2)(0.529) = (${n * n})(0.529) = ${radiusAngstrom.toFixed(2)} \\text{ Å}\\)`,
          `คำนวณพลังงานไอออไนเซชันที่ \\(n = ${n}\\): \\(\\text{IE} = \\frac{13.6}{${n}^2} = \\frac{13.6}{${n * n}} = ${ionEnergyEV.toFixed(2)} \\text{ eV}\\)`,
          `**ตอบ**: รัศมีวงโคจรเท่ากับ **${radiusAngstrom.toFixed(2)} Å** และพลังงานไอออไนเซชันเท่ากับ **${ionEnergyEV.toFixed(2)} eV**`
        ]
      };
    }

    /**
     * Topic 19.1.3: Hydrogen Spectra & Rydberg Transitions (5-Question Bank)
     * Q1: Transition wavelength λ (nm) via Rydberg formula
     * Q2: Transition photon energy ΔE (eV)
     * Q3: Transition photon frequency f (× 10^14 Hz)
     * Q4: Series limit shortest wavelength λ_min (nm) for n_i = ∞ -> n_f
     * Q5: 2-part multi-numeric — Both ΔE (eV) and λ (nm)
     */
    _generateTopic1913Question(R, qIndex, B, mode = 'random', trackHistory = true) {
      const isStandard = mode === 'standard';
      const totalInTopic = 5;
      const subType = (((qIndex % totalInTopic) + totalInTopic) % totalInTopic) + 1;
      const titleSuffix = isStandard ? '(โจทย์ตัวเลขมาตรฐาน สสวท.)' : `(เลขที่ #${R})`;

      const allTransitions = [
        { ni: 2, nf: 1, name: 'อนุกรมไลแมน (Lα)' },
        { ni: 3, nf: 1, name: 'อนุกรมไลแมน (Lβ)' },
        { ni: 4, nf: 1, name: 'อนุกรมไลแมน (Lγ)' },
        { ni: 5, nf: 1, name: 'อนุกรมไลแมน' },
        { ni: 6, nf: 1, name: 'อนุกรมไลแมน' },
        { ni: 3, nf: 2, name: 'อนุกรมบัลเมอร์ (Hα)' },
        { ni: 4, nf: 2, name: 'อนุกรมบัลเมอร์ (Hβ)' },
        { ni: 5, nf: 2, name: 'อนุกรมบัลเมอร์ (Hγ)' },
        { ni: 6, nf: 2, name: 'อนุกรมบัลเมอร์ (Hδ)' },
        { ni: 7, nf: 2, name: 'อนุกรมบัลเมอร์' },
        { ni: 4, nf: 3, name: 'อนุกรมพาสเชน' },
        { ni: 5, nf: 3, name: 'อนุกรมพาสเชน' },
        { ni: 6, nf: 3, name: 'อนุกรมพาสเชน' },
        { ni: 7, nf: 3, name: 'อนุกรมพาสเชน' },
        { ni: 5, nf: 4, name: 'อนุกรมแบร์เก็ตต์' },
        { ni: 6, nf: 4, name: 'อนุกรมแบร์เก็ตต์' },
        { ni: 7, nf: 4, name: 'อนุกรมแบร์เก็ตต์' },
        { ni: 6, nf: 5, name: 'อนุกรมฟุนด์' },
        { ni: 7, nf: 5, name: 'อนุกรมฟุนด์' },
        { ni: 8, nf: 5, name: 'อนุกรมฟุนด์' }
      ];
      const transKey = (t) => `${t.ni}->${t.nf}`;

      if (subType === 1) {
        // Q1: Transition wavelength λ (nm) using Rydberg Formula
        const stdItem = allTransitions.find((t) => t.ni === 3 && t.nf === 2);
        const selected = isStandard
          ? stdItem
          : this._generateUniqueChoice('19.1.3_Q1', R, allTransitions, B, '3->2', transKey, trackHistory);
        const details = getTransitionDetails(selected.ni, selected.nf);
        const ansNm = Math.round(details.wavelengthNm * 10) / 10;
        const termVal = Math.abs(1 / (selected.nf * selected.nf) - 1 / (selected.ni * selected.ni));

        return {
          id: `q_19_1_3_Q1_${qIndex}_${B}`,
          type: 'numeric',
          questionNumber: 1,
          totalInTopic,
          generatedParam: transKey(selected),
          topic: '19.1.3 เส้นสเปกตรัมของไฮโดรเจน (สูตรของริดเบิร์ก)',
          title: `ความยาวคลื่นสเปกตรัมจากการเปลี่ยนระดับพลังงาน ${titleSuffix}`,
          problemText: `เมื่ออิเล็กตรอนในอะตอมของไฮโดรเจนเปลี่ยนระดับพลังงานจาก \\(n_i = ${selected.ni}\\) ลงมายัง \\(n_f = ${selected.nf}\\) (${selected.name}) จะแผ่โฟตอนออกมา จงคำนวณความยาวคลื่น (\\(\\lambda\\)) ของโฟตอนในหน่วยนาโนเมตร (\\(\\text{nm}\\)) กำหนดค่าคงตัวของริดเบิร์ก \\(R_H = 1.097 \\times 10^7 \\text{ m}^{-1}\\)`,
          unit: 'nm',
          correctAnswer: ansNm,
          tolerance: 0.03,
          solutionSteps: [
            `**สูตรที่ใช้**: สูตรของริดเบิร์ก \\(\\frac{1}{\\lambda} = R_H \\left( \\frac{1}{n_f^2} - \\frac{1}{n_i^2} \\right)\\)`,
            `แทนค่า \\(n_f = ${selected.nf}\\) และ \\(n_i = ${selected.ni}\\): \\(\\frac{1}{${selected.nf}^2} - \\frac{1}{${selected.ni}^2} = \\frac{1}{${selected.nf * selected.nf}} - \\frac{1}{${selected.ni * selected.ni}} = ${termVal.toFixed(5)}\\)`,
            `แทนค่า \\(R_H = 1.097 \\times 10^7 \\text{ m}^{-1}\\): \\(\\frac{1}{\\lambda} = (1.097 \\times 10^7)(${termVal.toFixed(5)})\\)`,
            `จะได้ \\(\\lambda = ${formatLatexScientific(details.wavelengthMeters)} \\text{ m} = ${ansNm.toFixed(1)} \\text{ nm}\\)`,
            `**ตอบ**: ความยาวคลื่นของโฟตอนเท่ากับ **${ansNm.toFixed(1)} nm**`
          ]
        };
      }

      if (subType === 2) {
        // Q2: Transition photon energy ΔE = |Ef - Ei| in eV
        const stdItem = allTransitions.find((t) => t.ni === 2 && t.nf === 1);
        const selected = isStandard
          ? stdItem
          : this._generateUniqueChoice('19.1.3_Q2', R, allTransitions, B, '2->1', transKey, trackHistory);
        const energy = calculateTransitionEnergy(selected.ni, selected.nf);
        const ei = -13.6 / (selected.ni * selected.ni);
        const ef = -13.6 / (selected.nf * selected.nf);
        const deltaE = Math.round(energy.electronVolts * 100) / 100;

        return {
          id: `q_19_1_3_Q2_${qIndex}_${B}`,
          type: 'numeric',
          questionNumber: 2,
          totalInTopic,
          generatedParam: transKey(selected),
          topic: '19.1.3 เส้นสเปกตรัมของไฮโดรเจน (พลังงานโฟตอน)',
          title: `พลังงานของโฟตอนที่แผ่ออกมา ${titleSuffix}`,
          problemText: `อิเล็กตรอนในอะตอมไฮโดรเจนเปลี่ยนระดับพลังงานจาก \\(n_i = ${selected.ni}\\) ไปยัง \\(n_f = ${selected.nf}\\) (${selected.name}) จงคำนวณพลังงานของโฟตอนที่แผ่ออกมา (\\(\\Delta E\\)) ในหน่วยอิเล็กตรอนโวลต์ (\\(\\text{eV}\\)) กำหนดพลังงานที่ระดับ \\(n\\) คือ \\(E_n = -\\frac{13.6}{n^2} \\text{ eV}\\)`,
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

      if (subType === 3) {
        // Q3: Photon frequency f (× 10^14 Hz) from transition n_i -> n_f
        const freqPool = allTransitions.filter((t) => t.nf <= 3); // Lyman, Balmer, Paschen (f in 1.60 - 31.99 × 10^14 Hz)
        const stdItem = freqPool.find((t) => t.ni === 3 && t.nf === 2);
        const selected = isStandard
          ? stdItem
          : this._generateUniqueChoice('19.1.3_Q3', R, freqPool, B, '3->2', transKey, trackHistory);
        const freqHz = calculateTransitionFrequency(selected.ni, selected.nf);
        const details = getTransitionDetails(selected.ni, selected.nf);
        const ansFreq14 = Math.round((freqHz / 1e14) * 100) / 100;

        return {
          id: `q_19_1_3_Q3_${qIndex}_${B}`,
          type: 'numeric',
          questionNumber: 3,
          totalInTopic,
          generatedParam: transKey(selected),
          topic: '19.1.3 เส้นสเปกตรัมของไฮโดรเจน (ความถี่โฟตอน)',
          title: `ความถี่ของโฟตอนจากการเปลี่ยนระดับพลังงาน ${titleSuffix}`,
          problemText: `อิเล็กตรอนในอะตอมไฮโดรเจนเปลี่ยนระดับพลังงานจาก \\(n_i = ${selected.ni}\\) ลงมายัง \\(n_f = ${selected.nf}\\) (${selected.name}) จงคำนวณความถี่ของโฟตอนที่แผ่ออกมา (\\(f\\)) (กรอกเฉพาะตัวเลขหน้าสัญกรณ์ในหน่วย \\(\\times 10^{14} \\text{ Hz}\\)) กำหนด \\(R_H = 1.097 \\times 10^7 \\text{ m}^{-1}\\) และ \\(c = 3.00 \\times 10^8 \\text{ m/s}\\)`,
          unit: '× 10¹⁴ Hz',
          correctAnswer: ansFreq14,
          tolerance: 0.03,
          solutionSteps: [
            `**สูตรที่ใช้**: \\(\\frac{1}{\\lambda} = R_H \\left( \\frac{1}{n_f^2} - \\frac{1}{n_i^2} \\right)\\) และ \\(f = \\frac{c}{\\lambda} = c R_H \\left( \\frac{1}{n_f^2} - \\frac{1}{n_i^2} \\right)\\)`,
            `คำนวณความยาวคลื่น: \\(\\lambda = ${formatLatexScientific(details.wavelengthMeters)} \\text{ m} = ${details.wavelengthNm.toFixed(1)} \\text{ nm}\\)`,
            `คำนวณความถี่: \\(f = \\frac{3.00 \\times 10^8}{${formatLatexScientific(details.wavelengthMeters)}} = ${ansFreq14.toFixed(2)} \\times 10^{14} \\text{ Hz}\\)`,
            `**ตอบ**: ความถี่ของโฟตอนเท่ากับ **${ansFreq14.toFixed(2)} × 10¹⁴ Hz** (ตัวเลขคำตอบ: **${ansFreq14.toFixed(2)}**)`
          ]
        };
      }

      if (subType === 4) {
        // Q4: Series Limit (Shortest Wavelength, n_i = ∞ -> n_f): λ_min = n_f² / R_H (nm)
        const seriesLimits = [
          { nf: 1, name: 'อนุกรมไลแมน (Lyman)' },
          { nf: 2, name: 'อนุกรมบัลเมอร์ (Balmer)' },
          { nf: 3, name: 'อนุกรมพาสเชน (Paschen)' },
          { nf: 4, name: 'อนุกรมแบร์เก็ตต์ (Brackett)' },
          { nf: 5, name: 'อนุกรมฟุนด์ (Pfund)' },
          { nf: 6, name: 'อนุกรมฮัมฟรีส์ (Humphreys)' }
        ];
        const stdSeries = seriesLimits.find((s) => s.nf === 2);
        const selected = isStandard
          ? stdSeries
          : this._generateUniqueChoice('19.1.3_Q4', R, seriesLimits, B, 2, (s) => s.nf, trackHistory);
        const lambdaMinM = (selected.nf * selected.nf) / RYDBERG_CONSTANT;
        const ansNm = Math.round(lambdaMinM * 1e9 * 10) / 10;

        return {
          id: `q_19_1_3_Q4_${qIndex}_${B}`,
          type: 'numeric',
          questionNumber: 4,
          totalInTopic,
          generatedParam: selected.nf,
          topic: '19.1.3 เส้นสเปกตรัมของไฮโดรเจน (ความยาวคลื่นสั้นที่สุด)',
          title: `ความยาวคลื่นสั้นที่สุดของอนุกรมสเปกตรัม ${titleSuffix}`,
          problemText: `จงคำนวณความยาวคลื่นสั้นที่สุด (\\(\\lambda_{\\min}\\)) ของเส้นสเปกตรัมอะตอมไฮโดรเจนใน<strong>${selected.name}</strong> ซึ่งเกิดจากการเปลี่ยนระดับพลังงานจาก \\(n_i = \\infty\\) ลงมายัง \\(n_f = ${selected.nf}\\) ในหน่วยนาโนเมตร (\\(\\text{nm}\\)) กำหนด \\(R_H = 1.097 \\times 10^7 \\text{ m}^{-1}\\)`,
          unit: 'nm',
          correctAnswer: ansNm,
          tolerance: 0.03,
          solutionSteps: [
            `**สูตรที่ใช้**: ความยาวคลื่นสั้นที่สุดเกิดเมื่อ \\(n_i = \\infty\\) จะได้ \\(\\frac{1}{\\lambda_{\\min}} = R_H \\left( \\frac{1}{n_f^2} - 0 \\right) \\rightarrow \\lambda_{\\min} = \\frac{n_f^2}{R_H}\\)`,
            `แทนค่า \\(n_f = ${selected.nf}\\) และ \\(R_H = 1.097 \\times 10^7 \\text{ m}^{-1}\\)`,
            `\\(\\lambda_{\\min} = \\frac{${selected.nf}^2}{1.097 \\times 10^7} = \\frac{${selected.nf * selected.nf}}{1.097 \\times 10^7} = ${formatLatexScientific(lambdaMinM)} \\text{ m}\\)`,
            `แปลงเป็นหน่วยนาโนเมตร: \\(\\lambda_{\\min} = ${ansNm.toFixed(1)} \\text{ nm}\\)`,
            `**ตอบ**: ความยาวคลื่นสั้นที่สุดเท่ากับ **${ansNm.toFixed(1)} nm**`
          ]
        };
      }

      // Q5: 2-part multi-numeric — Both Photon Energy ΔE (eV) and Wavelength λ (nm)
      const stdItem = allTransitions.find((t) => t.ni === 4 && t.nf === 2);
      const selected = isStandard
        ? stdItem
        : this._generateUniqueChoice('19.1.3_Q5', R, allTransitions, B, '4->2', transKey, trackHistory);
      const details = getTransitionDetails(selected.ni, selected.nf);
      const deltaE = Math.round(details.deltaEEV * 100) / 100;
      const ansNm = Math.round(details.wavelengthNm * 10) / 10;

      return {
        id: `q_19_1_3_Q5_${qIndex}_${B}`,
        type: 'multi-numeric',
        questionNumber: 5,
        totalInTopic,
        generatedParam: transKey(selected),
        topic: '19.1.3 เส้นสเปกตรัมของไฮโดรเจน (พลังงานและความยาวคลื่น)',
        title: `คำนวณพลังงานและความยาวคลื่นของโฟตอน ${titleSuffix}`,
        problemText: `อิเล็กตรอนในอะตอมไฮโดรเจนเปลี่ยนระดับพลังงานจาก \\(n_i = ${selected.ni}\\) ลงมายัง \\(n_f = ${selected.nf}\\) (${selected.name}) จงหา 1) พลังงานของโฟตอนที่แผ่ออกมา (\\(\\Delta E\\)) ในหน่วยอิเล็กตรอนโวลต์ (\\(\\text{eV}\\)) และ 2) ความยาวคลื่นของโฟตอน (\\(\\lambda\\)) ในหน่วยนาโนเมตร (\\(\\text{nm}\\)) กำหนด \\(E_n = -\\frac{13.6}{n^2} \\text{ eV}\\) และ \\(R_H = 1.097 \\times 10^7 \\text{ m}^{-1}\\)`,
        unit: 'eV / nm',
        correctAnswer: deltaE,
        correctAnswers: [deltaE, ansNm],
        tolerance: 0.03,
        inputs: [
          {
            id: 'deltaE',
            label: 'พลังงานโฟตอน (ΔE)',
            unit: 'eV',
            correctAnswer: deltaE,
            tolerance: 0.03
          },
          {
            id: 'wavelength',
            label: 'ความยาวคลื่น (λ)',
            unit: 'nm',
            correctAnswer: ansNm,
            tolerance: 0.03
          }
        ],
        solutionSteps: [
          `**สูตรที่ใช้**: \\(\\Delta E = 13.6 \\left( \\frac{1}{n_f^2} - \\frac{1}{n_i^2} \\right) \\text{ eV}\\) และ \\(\\frac{1}{\\lambda} = R_H \\left( \\frac{1}{n_f^2} - \\frac{1}{n_i^2} \\right)\\)`,
          `คำนวณพลังงานโฟตอน: \\(\\Delta E = 13.6 \\left( \\frac{1}{${selected.nf}^2} - \\frac{1}{${selected.ni}^2} \\right) = ${deltaE.toFixed(2)} \\text{ eV}\\)`,
          `คำนวณความยาวคลื่น: \\(\\frac{1}{\\lambda} = (1.097 \\times 10^7) \\left( \\frac{1}{${selected.nf * selected.nf}} - \\frac{1}{${selected.ni * selected.ni}} \\right) \\rightarrow \\lambda = ${ansNm.toFixed(1)} \\text{ nm}\\)`,
          `**ตอบ**: พลังงานโฟตอนเท่ากับ **${deltaE.toFixed(2)} eV** และความยาวคลื่นเท่ากับ **${ansNm.toFixed(1)} nm**`
        ]
      };
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
