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

// Standard mode test
const q_std = qmR1.generateQuestion(0, '19.1.1', null, 'standard');
assert(q_std.title.includes('มาตรฐาน สสวท.'), 'Standard mode question generated with standard textbook values');

console.log(`\n=======================================================`);
console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`=======================================================`);

if (failed > 0) {
  process.exit(1);
}

