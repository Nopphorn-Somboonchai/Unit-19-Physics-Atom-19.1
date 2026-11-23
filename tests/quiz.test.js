/**
 * @file quiz.test.js
 * @description Automated Unit Verification Script for Unit 19 Quiz & RNG System.
 */

import { QuizManager } from '../src/application/quiz-manager.js';
import { validateRollNumber, validateNumericAnswer } from '../src/utils/validation.js';
import { formatScientific } from '../src/utils/format.js';

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

console.log('=============== 🧪 RUNNING PHASE 4 QUIZ ENGINE TESTS ===============\n');

// --- 1. Roll Number Validation Tests ---
console.log('--- Test Suite 1: Roll Number Validation & Boundary Limits ---');
assert(validateRollNumber(1) === 1, 'Roll number 1 is valid');
assert(validateRollNumber(40) === 40, 'Roll number 40 is valid');
assert(validateRollNumber(-5) === 1, 'Negative roll number clamped to 1');
assert(validateRollNumber(99) === 40, 'Roll number > 40 clamped to 40');
assert(validateRollNumber('25') === 25, 'String roll number parsed correctly');

// --- 2. Numeric Answer Grading & Tolerance Tests ---
console.log('\n--- Test Suite 2: Numeric Answer Grading & 3% Tolerance ---');
const exactEval = validateNumericAnswer(10.0, 10.0, 0.03);
assert(exactEval.isCorrect === true && exactEval.relativeErrorPercent === 0, 'Exact match has 0% error');

const closeEval = validateNumericAnswer(10.2, 10.0, 0.03);
assert(closeEval.isCorrect === true, '2% relative error is accepted within 3% tolerance');

const farEval = validateNumericAnswer(10.5, 10.0, 0.03);
assert(farEval.isCorrect === false, '5% relative error is rejected (exceeds 3% tolerance)');

const invalidTextEval = validateNumericAnswer('abc', 10.0, 0.03);
assert(invalidTextEval.isCorrect === false, 'Non-numeric text answer is rejected');

// --- 3. Quiz Manager RNG Generation Tests ---
console.log('\n--- Test Suite 3: Quiz Manager RNG Problem Generation ---');
const qmR1 = new QuizManager(1);
const q1_R1 = qmR1.generateQuestion(0, '19.1.1', 12345);
assert(q1_R1.topic.includes('19.1.1'), 'Topic 19.1.1 question generated');
assert(q1_R1.correctAnswer > 0, 'Topic 19.1.1 correct answer is positive');
assert(q1_R1.solutionSteps.length >= 4, 'Solution steps contain detailed explanation');

const qmR40 = new QuizManager(40);
const q1_R40 = qmR40.generateQuestion(0, '19.1.1', 12345);
assert(q1_R1.correctAnswer !== q1_R40.correctAnswer, 'Roll number 1 and Roll number 40 receive unique questions');

// Reproducibility test
const qmR1_again = new QuizManager(1);
const q1_R1_again = qmR1_again.generateQuestion(0, '19.1.1', 12345);
assert(q1_R1.correctAnswer === q1_R1_again.correctAnswer, 'RNG questions generated deterministically with same seed');

// Evaluation test
const gradResult = qmR1.evaluateAnswer(q1_R1.correctAnswer);
assert(gradResult.isCorrect === true, 'Submitting exact answer yields correct status');

// 19.1.2 Bohr topic test
const q2_bohr = qmR1.generateQuestion(1, '19.1.2', 54321);
assert(q2_bohr.topic.includes('19.1.2'), 'Topic 19.1.2 question generated');
assert(q2_bohr.correctAnswer > 0, 'Bohr question answer is positive');

// 19.1.3 Hydrogen spectrum topic test
const q3_spectrum = qmR1.generateQuestion(2, '19.1.3', 67890);
assert(q3_spectrum.topic.includes('19.1.3'), 'Topic 19.1.3 question generated');
assert(q3_spectrum.correctAnswer > 0, 'Spectrum question answer is positive');

// Standard mode tests for all 5 IPST 19.1.1 questions
console.log('\n--- Test Suite 4: Topic 19.1.1 IPST 5-Question Bank (Standard Mode) ---');
const qmStd = new QuizManager(1);
const std1 = qmStd.generateQuestion(0, '19.1.1', null, 'standard');
assert(std1.title.includes('มาตรฐาน สสวท.'), 'Standard Q1 has IPST standard title');
assert(std1.unit === 'eV' && std1.correctAnswer === 2.69, `Standard Q1 (6.50e14 Hz) = 2.69 eV (got ${std1.correctAnswer})`);

const std2 = qmStd.generateQuestion(1, '19.1.1', null, 'standard');
assert(std2.unit === '× 10¹⁴ Hz' && std2.correctAnswer === 6.04, `Standard Q2 (2.50 eV) = 6.04 × 10¹⁴ Hz (got ${std2.correctAnswer})`);

const std3 = qmStd.generateQuestion(2, '19.1.1', null, 'standard');
assert(std3.type === 'multi-numeric' && std3.inputs.length === 2, 'Standard Q3 is 2-part multi-numeric question');
assert(std3.inputs[0].correctAnswer === 43.52 && std3.inputs[1].correctAnswer === 65.28, `Standard Q3 (n=2,3) = [43.52, 65.28] (got [${std3.inputs[0].correctAnswer}, ${std3.inputs[1].correctAnswer}])`);
assert(qmStd.evaluateMultiAnswer([43.52, 65.28]).isCorrect === true, 'Multi-numeric accepts both correct answers');
assert(qmStd.evaluateMultiAnswer([43.52, 99.99]).isCorrect === false, 'Multi-numeric rejects when one sub-answer is wrong');

const std4 = qmStd.generateQuestion(3, '19.1.1', null, 'standard');
assert(std4.unit === 'eV' && std4.correctAnswer === 2.07, `Standard Q4 (5.0e14 Hz) = 2.07 eV (got ${std4.correctAnswer})`);
assert(!std4.problemText.includes('2.1 eV'), 'Standard Q4 does not leak answer hint in problem text');
assert(qmStd.evaluateAnswer(2.1).isCorrect === true, 'Standard Q4 accepts textbook rounded answer 2.1 eV within ±3%');

const std5 = qmStd.generateQuestion(4, '19.1.1', null, 'standard');
assert(std5.type === 'numeric' && std5.unit === 'nm' && std5.correctAnswer === 549.1, `Standard Q5 (3.62e-19 J) = 549.1 nm (got ${std5.correctAnswer})`);
assert(!std5.problemText.includes('สีอะไร'), 'Standard Q5 asks wavelength in nm without color question');
assert(qmStd.evaluateAnswer(549).isCorrect === true, 'Standard Q5 accepts rounded 549 nm within ±3%');

// Zero-repeat RNG test for 19.1.1 random mode
console.log('\n--- Test Suite 5: Topic 19.1.1 Zero-Repeat RNG Guarantee (0% Repeat) ---');
const qmUnique = new QuizManager(12);
const stdValues = [6.50, 2.50, 21.76, 5.0, 3.62];
for (let slot = 0; slot < 5; slot++) {
  const seen = new Set();
  const iterations = slot === 3 ? 40 : 60;
  let repeated = false;
  let hitStandard = false;
  for (let i = 0; i < iterations; i++) {
    const q = qmUnique.generateQuestion(slot, '19.1.1', null, 'random');
    if (Math.abs(q.generatedParam - stdValues[slot]) < 1e-9) {
      hitStandard = true;
    }
    if (seen.has(q.generatedParam)) {
      repeated = true;
    }
    seen.add(q.generatedParam);
  }
  assert(!hitStandard, `19.1.1 Q${slot + 1} random mode never repeats standard value (${stdValues[slot]}) across ${iterations} draws`);
  assert(!repeated, `19.1.1 Q${slot + 1} random mode has 0% repeat across ${iterations} consecutive draws`);
}

// Topic 19.1.2 5-question bank tests (standard + zero-repeat random)
console.log('\n--- Test Suite 6: Topic 19.1.2 Bohr Model 5-Question Bank & 0% Repeat ---');
const b1 = qmStd.generateQuestion(0, '19.1.2', null, 'standard');
assert(b1.unit === 'Å' && b1.correctAnswer === 4.76, `19.1.2 Standard Q1 (n=3 radius) = 4.76 Å (got ${b1.correctAnswer})`);
const b2 = qmStd.generateQuestion(1, '19.1.2', null, 'standard');
assert(b2.unit === '× 10⁶ m/s' && b2.correctAnswer === 1.09, `19.1.2 Standard Q2 (n=2 velocity) = 1.09 × 10⁶ m/s (got ${b2.correctAnswer})`);
const b3 = qmStd.generateQuestion(2, '19.1.2', null, 'standard');
assert(b3.unit === '× 10⁻³⁴ J·s' && b3.correctAnswer === 3.16, `19.1.2 Standard Q3 (n=3 angular momentum) = 3.16 × 10⁻³⁴ J·s (got ${b3.correctAnswer})`);
const b4 = qmStd.generateQuestion(3, '19.1.2', null, 'standard');
assert(b4.unit === 'eV' && b4.correctAnswer === 3.4, `19.1.2 Standard Q4 (n=2 ionization) = 3.40 eV (got ${b4.correctAnswer})`);
const b5 = qmStd.generateQuestion(4, '19.1.2', null, 'standard');
assert(b5.type === 'multi-numeric' && b5.inputs[0].correctAnswer === 8.46 && b5.inputs[1].correctAnswer === 0.85, `19.1.2 Standard Q5 (n=4 multi) = [8.46 Å, 0.85 eV] (got [${b5.inputs[0].correctAnswer}, ${b5.inputs[1].correctAnswer}])`);
assert(qmStd.evaluateMultiAnswer([8.46, 0.85]).isCorrect === true, '19.1.2 Q5 multi-numeric accepts both correct answers');

const bStdVals = [3, 2, 3, 2, 4];
for (let slot = 0; slot < 5; slot++) {
  const seen = new Set();
  let repeated = false;
  let hitStd = false;
  for (let i = 0; i < 8; i++) {
    const q = qmUnique.generateQuestion(slot, '19.1.2', null, 'random');
    if (q.generatedParam === bStdVals[slot]) hitStd = true;
    if (seen.has(q.generatedParam)) repeated = true;
    seen.add(q.generatedParam);
  }
  assert(!hitStd, `19.1.2 Q${slot + 1} random mode never repeats standard n=${bStdVals[slot]}`);
  assert(!repeated, `19.1.2 Q${slot + 1} random mode has 0% repeat across full 8 non-standard levels`);
}

// Topic 19.1.3 5-question bank tests (standard + zero-repeat random)
console.log('\n--- Test Suite 7: Topic 19.1.3 Hydrogen Spectra 5-Question Bank & 0% Repeat ---');
const s1 = qmStd.generateQuestion(0, '19.1.3', null, 'standard');
assert(s1.unit === 'nm' && s1.correctAnswer === 656.3, `19.1.3 Standard Q1 (3->2 λ) = 656.3 nm (got ${s1.correctAnswer})`);
const s2 = qmStd.generateQuestion(1, '19.1.3', null, 'standard');
assert(s2.unit === 'eV' && s2.correctAnswer === 10.2, `19.1.3 Standard Q2 (2->1 ΔE) = 10.20 eV (got ${s2.correctAnswer})`);
const s3 = qmStd.generateQuestion(2, '19.1.3', null, 'standard');
assert(s3.unit === '× 10¹⁴ Hz' && s3.correctAnswer === 4.57, `19.1.3 Standard Q3 (3->2 f) = 4.57 × 10¹⁴ Hz (got ${s3.correctAnswer})`);
const s4 = qmStd.generateQuestion(3, '19.1.3', null, 'standard');
assert(s4.unit === 'nm' && s4.correctAnswer === 364.6, `19.1.3 Standard Q4 (Balmer limit) = 364.6 nm (got ${s4.correctAnswer})`);
const s5 = qmStd.generateQuestion(4, '19.1.3', null, 'standard');
assert(s5.type === 'multi-numeric' && s5.inputs[0].correctAnswer === 2.55 && s5.inputs[1].correctAnswer === 486.2, `19.1.3 Standard Q5 (4->2 multi) = [2.55 eV, 486.2 nm] (got [${s5.inputs[0].correctAnswer}, ${s5.inputs[1].correctAnswer}])`);
assert(qmStd.evaluateMultiAnswer([2.55, 486.2]).isCorrect === true, '19.1.3 Q5 multi-numeric accepts both correct answers');

const sStdVals = ['3->2', '2->1', '3->2', 2, '4->2'];
const sDrawCounts = [19, 19, 13, 5, 19];
for (let slot = 0; slot < 5; slot++) {
  const seen = new Set();
  let repeated = false;
  let hitStd = false;
  for (let i = 0; i < sDrawCounts[slot]; i++) {
    const q = qmUnique.generateQuestion(slot, '19.1.3', null, 'random');
    if (q.generatedParam === sStdVals[slot]) hitStd = true;
    if (seen.has(q.generatedParam)) repeated = true;
    seen.add(q.generatedParam);
  }
  assert(!hitStd, `19.1.3 Q${slot + 1} random mode never repeats standard (${sStdVals[slot]})`);
  assert(!repeated, `19.1.3 Q${slot + 1} random mode has 0% repeat across all ${sDrawCounts[slot]} non-standard items`);
}

console.log(`\n=======================================================`);
console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`=======================================================`);

if (failed > 0) {
  process.exit(1);
}

