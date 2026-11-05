/**
 * @file integration.test.js
 * @description Master Integration QA Test Suite for Unit 19 Physics Portal.
 * Verifies physics accuracy, RNG reproducibility, grading tolerances, and exam state machine.
 */

import { createBlackbody } from '../src/physics/blackbody-model.js';
import {
  calculateQuantumEnergy,
  calculateEnergyFromWavelength,
  calculateWienPeakWavelength
} from '../src/physics/blackbody-solver.js';
import {
  calculateBohrRadius,
  calculateBohrVelocity,
  calculateEnergyLevel
} from '../src/physics/bohr-atom-solver.js';
import {
  getTransitionDetails,
  calculateTransitionWavelength
} from '../src/physics/hydrogen-spectrum-solver.js';
import { QuizManager } from '../src/application/quiz-manager.js';
import { ExamManager, EXAM_STATES } from '../src/application/exam-manager.js';
import { validateRollNumber, validateNumericAnswer } from '../src/utils/validation.js';
import { LocalStorageAdapter } from '../src/adapters/storage/local-storage.js';
import { TabNavigatorAdapter } from '../src/adapters/ui/tab-navigator.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failed++;
  }
}

function assertCloseTo(actual, expected, precision = 1e-3, message = '') {
  const diff = Math.abs(actual - expected);
  assert(diff <= precision, `${message} (Expected: ~${expected}, Got: ${actual})`);
}

// Mock localStorage for Node environment if absent
if (typeof globalThis.localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };
}

console.log('================================================================');
console.log('🧪 MASTER INTEGRATION & QA TEST SUITE — UNIT 19 PHYSICS PORTAL');
console.log('================================================================\n');

// --- 1. Physics Engine Accuracy Audit ---
console.log('--- 1. Physics Engine & Solver Accuracy Audit ---');
assertCloseTo(calculateWienPeakWavelength(5800) * 1e9, 499.65, 0.5, 'Wien Law: Sun peak wavelength ≈ 500 nm');

const photon500nm = calculateEnergyFromWavelength(500e-9);
assertCloseTo(photon500nm.electronVolts, 2.48, 0.05, 'E = hc/λ: 500 nm photon energy ≈ 2.48 eV');

const r1 = calculateBohrRadius(1);
assertCloseTo(r1, 5.29e-11, 1e-13, 'Bohr radius r1 = 5.29e-11 m (0.529 Å)');

const r2 = calculateBohrRadius(2);
assertCloseTo(r2, 4 * 5.29e-11, 1e-13, 'Bohr radius scales with n²: r2 = 4*r1');

const e1 = calculateEnergyLevel(1);
assertCloseTo(e1.electronVolts, -13.6, 0.01, 'Bohr ground state energy E1 = -13.6 eV');

const e2 = calculateEnergyLevel(2);
assertCloseTo(e2.electronVolts, -3.4, 0.01, 'Bohr excited state energy E2 = -3.40 eV');

const balmerAlpha = getTransitionDetails(3, 2);
assertCloseTo(balmerAlpha.wavelengthNm, 656.3, 1.5, 'Balmer H-alpha wavelength ≈ 656.3 nm');
assert(balmerAlpha.colorHex.toLowerCase() === '#ef4444', 'Balmer H-alpha is Red color');

// --- 2. Roll-Number RNG & Validation Audit ---
console.log('\n--- 2. Roll-Number RNG & Student Answer Validation ---');
assert(validateRollNumber(1) === 1, 'Roll number min bound = 1');
assert(validateRollNumber(40) === 40, 'Roll number max bound = 40');
assert(validateRollNumber(-10) === 1, 'Negative roll number clamped');

const qm1 = new QuizManager(1);
const qm40 = new QuizManager(40);
const q1 = qm1.generateQuestion(0, '19.1.1', 9999);
const q40 = qm40.generateQuestion(0, '19.1.1', 9999);
assert(q1.correctAnswer !== q40.correctAnswer, 'RNG generates distinct questions for R=1 vs R=40');

const valResult = validateNumericAnswer(q1.correctAnswer, q1.correctAnswer, 0.03);
assert(valResult.isCorrect === true, 'Student answer within 3% tolerance accepted');

// --- 3. Timed Exam & Dashboard Persistence Audit ---
console.log('\n--- 3. Timed Exam System & LocalStorage Audit ---');
const exam = new ExamManager(15);
assert(exam.state === EXAM_STATES.IDLE, 'Exam state machine starts in IDLE');

const examQuestions = exam.startExam(7777);
assert(exam.state === EXAM_STATES.IN_PROGRESS, 'Exam state transitions to IN_PROGRESS');
assert(examQuestions.length === 5, 'Exam paper contains 5 questions');

// Simulate student completing exam
exam.recordAnswer(0, examQuestions[0].correctChoiceIndex);
for (let i = 1; i < 5; i++) {
  exam.recordAnswer(i, examQuestions[i].correctAnswer);
}

const examResult = exam.submitExam(false);
assert(exam.state === EXAM_STATES.SUBMITTED, 'Exam state transitions to SUBMITTED');
assert(examResult.totalScore === 10, 'Full score is 10/10 marks');
assert(examResult.percentage === 100, 'Percentage is 100%');

// Test Tab Navigator Exam Protection Lock
TabNavigatorAdapter.setExamInProgress(true);
assert(TabNavigatorAdapter.isExamInProgress === true, 'TabNavigatorAdapter locks navigation during IN_PROGRESS exam');

TabNavigatorAdapter.setExamInProgress(false);
assert(TabNavigatorAdapter.isExamInProgress === false, 'TabNavigatorAdapter unlocks navigation after exam submission');

const loadedRecord = LocalStorageAdapter.loadExamResult();
assert(loadedRecord !== null && loadedRecord.totalScore === 10, 'Exam score persisted in LocalStorage');

console.log(`\n================================================================`);
console.log(`📊 MASTER TEST SUITE RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log(`================================================================`);

if (failed > 0) {
  process.exit(1);
}

