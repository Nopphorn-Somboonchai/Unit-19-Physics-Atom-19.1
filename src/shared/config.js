/**
 * @file config.js
 * @description Application Configuration for Unit 19 Interactive Physics Learning Portal.
 */

export const APP_CONFIG = {
  appName: 'Physics Unit 19: Planck Hypothesis & Bohr Atomic Model',
  version: '1.0.0',
  standardVersion: 'v1.13.0',
  courseCode: 'ว33206',
  courseName: 'ฟิสิกส์ 6 (ม.6)',
  chapterNumber: 19,
  chapterTitleTh: 'ฟิสิกส์อะตอม (สมมติฐานของพลังค์และทฤษฎีอะตอมของโบร์)',
  chapterTitleEn: "Atomic Physics: Planck's Hypothesis and Bohr's Atomic Theory",
  schoolName: 'โรงเรียนห้องสอนศึกษา ในพระอุปถัมภ์ฯ',
  
  minRollNumber: 1,
  maxRollNumber: 40,
  numericAnswerTolerance: 0.03, // 3% tolerance

  exam: {
    durationMinutes: 15,
    totalQuestions: 5,
    maxScore: 10,
    scorePerQuestion: 2,
    passingScore: 6, // 60%
    tolerancePercent: 3.0 // 3% tolerance for numeric responses
  },

  storageKeys: {
    examResult: 'u19_exam_latest_result',
    examSession: 'u19_exam_active_session',
    userPreferences: 'u19_user_prefs'
  }
};
