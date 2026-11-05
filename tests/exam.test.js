/**
 * @file exam.test.js
 * @description Automated Unit Verification Script for Unit 19 Timed Exam System & Storage Adapter.
 */

import { ExamManager, EXAM_STATES } from '../src/application/exam-manager.js';
import { LocalStorageAdapter } from '../src/adapters/storage/local-storage.js';
import { getSeededShuffle } from '../src/utils/random.js';

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

console.log('=============== 🧪 RUNNING PHASE 5 EXAM ENGINE TESTS ===============\n');

// Mock localStorage for Node environment if absent
if (typeof globalThis.localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };
}

// --- 1. Exam State Machine & Identity Tests ---
console.log('--- Test Suite 1: Exam State Machine & Timer Setup ---');
const em = new ExamManager(1);
assert(em.state === EXAM_STATES.IDLE, 'Initial state is IDLE');

em.setIdentity('สมชาย ใจดี', 'ม.6/3', 5);
assert(em.fullName === 'สมชาย ใจดี', 'Learner full name set to สมชาย ใจดี');
assert(em.className === 'ม.6/3', 'Learner room set to ม.6/3');
assert(em.rollNumber === 5, 'Learner roll number set to 5');

const questions = em.startExam(12345);
assert(em.state === EXAM_STATES.IN_PROGRESS, 'State transitions to IN_PROGRESS on startExam()');
assert(questions.length === 5, 'Exam paper contains 5 questions');
assert(em.formatTimerString() === '15:00', 'Timer string initialized to 15:00');

// --- 2. Answer Recording & Grading Tests ---
console.log('\n--- Test Suite 2: Answer Recording & Scoring (10 Marks Total) ---');
// Q1 is Choice question (dynamic correctChoiceIndex)
em.recordAnswer(0, questions[0].correctChoiceIndex);

// Record correct answers for Q2..Q5
for (let i = 1; i < 5; i++) {
  em.recordAnswer(i, questions[i].correctAnswer);
}

const result = em.submitExam(false);
assert(em.state === EXAM_STATES.SUBMITTED, 'State transitions to SUBMITTED after submission');
assert(result.totalScore === 10, 'Perfect score is 10/10');
assert(result.percentage === 100, 'Percentage is 100%');
assert(result.gradedQuestions.every(q => q.isCorrect), 'All 5 questions graded correct');

// --- 3. Dynamic Randomized Exam Paper Tests ---
console.log('\n--- Test Suite 3: Dynamic Randomized Exam Paper (RNG) ---');
const em1 = new ExamManager(1);
const questionsAttempt1 = em1.startExam(1001);

const em2 = new ExamManager(1);
const questionsAttempt2 = em2.startExam(9999);

assert(questionsAttempt1[1].correctAnswer !== questionsAttempt2[1].correctAnswer,
  'Different exam attempts produce randomized questions and values (RNG)');

const em1Repeat = new ExamManager(1);
const questionsAttempt1Repeat = em1Repeat.startExam(1001);
assert(questionsAttempt1[1].correctAnswer === questionsAttempt1Repeat[1].correctAnswer,
  'Same attempt seed reproduces identical questions for attempt-scoped determinism');
assert(JSON.stringify(questionsAttempt1[0].choices) === JSON.stringify(questionsAttempt1Repeat[0].choices),
  'Same attempt seed reproduces identical Choice positions');
assert(questionsAttempt1[0].correctChoiceIndex === questionsAttempt1Repeat[0].correctChoiceIndex,
  'Same attempt seed reproduces the identical correct Choice index');

em1._stopTimer();
em2._stopTimer();
em1Repeat._stopTimer();

// --- 4. Exam Session Persistence & Resume (Refresh Protection) Tests ---
console.log('\n--- Test Suite 4: Exam Session Persistence & Resume ---');
LocalStorageAdapter.clearExamSession();

const sessionEm = new ExamManager(10);
sessionEm.setIdentity('อนันต์ มุ่งมั่น', 'ม.6/2', 12);
const sessionQs = sessionEm.startExam(5555);

// Record answer for Q0 and Q1
sessionEm.recordAnswer(0, sessionQs[0].correctChoiceIndex);
sessionEm.recordAnswer(1, sessionQs[1].correctAnswer);
sessionEm._saveSessionState(3);

// Verify session was saved to LocalStorage
const savedSession = LocalStorageAdapter.loadExamSession();
assert(savedSession !== null, 'Active exam session saved to LocalStorage');
assert(savedSession.fullName === 'อนันต์ มุ่งมั่น', 'Saved session contains learner name');
assert(savedSession.userAnswers[0] === sessionQs[0].correctChoiceIndex, 'Saved session contains user answer for Q0');
assert(savedSession.activeQuestionIdx === 3, 'Saved session contains the active question index');

// Simulate two minutes elapsed
savedSession.startTime = Date.now() - (2 * 60 * 1000);
savedSession.endTime = savedSession.startTime + (15 * 60 * 1000);
sessionEm._stopTimer();

// Simulate page refresh: Create new ExamManager and resume from savedSession
const freshEm = new ExamManager(1);
const resumedSuccess = freshEm.resumeExamSession(savedSession);

assert(resumedSuccess === true, 'Exam session resumed successfully');
assert(freshEm.state === EXAM_STATES.IN_PROGRESS, 'Resumed state is IN_PROGRESS');
assert(freshEm.questions[0].title === sessionQs[0].title, 'Resumed questions match original session');
assert(freshEm.userAnswers[0] === sessionQs[0].correctChoiceIndex, 'Resumed user answers match recorded choice');
assert(freshEm.restoredActiveQuestionIdx === 3, 'Resumed session restores the same active question');
assert(freshEm.timeRemaining <= 780 && freshEm.timeRemaining >= 779, 'Refresh keeps the original deadline after two elapsed minutes');

// Submit exam and verify session is cleared
freshEm.submitExam(false);
assert(LocalStorageAdapter.loadExamSession() === null, 'Active exam session cleared from LocalStorage upon submission');

console.log(`\n=======================================================`);
console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`=======================================================`);

if (failed > 0) {
  process.exit(1);
}

