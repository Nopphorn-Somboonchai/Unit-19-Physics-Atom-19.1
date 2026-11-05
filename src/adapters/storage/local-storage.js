/**
 * @file local-storage.js
 * @description LocalStorage Adapter for persisting student exam results and active sessions in Unit 19.
 * Conforms to Physics Learning Standard (v1.13.0).
 */

import { APP_CONFIG } from '../../shared/config.js';

export class LocalStorageAdapter {
  /**
   * Save completed exam result object to LocalStorage
   * @param {Object} result - Exam result data
   * @returns {boolean} Success status
   */
  static saveExamResult(result) {
    try {
      const key = APP_CONFIG.storageKeys.examResult;
      const serialized = JSON.stringify({
        ...result,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(key, serialized);
      return true;
    } catch (err) {
      console.warn('[LocalStorageAdapter] Failed to save exam result:', err);
      return false;
    }
  }

  /**
   * Load last saved exam result from LocalStorage
   * @returns {Object|null} Exam result object or null
   */
  static loadExamResult() {
    try {
      const key = APP_CONFIG.storageKeys.examResult;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (err) {
      console.warn('[LocalStorageAdapter] Failed to load exam result:', err);
      return null;
    }
  }

  /**
   * Clear saved exam result from LocalStorage
   * @returns {boolean} Success status
   */
  static clearExamResult() {
    try {
      const key = APP_CONFIG.storageKeys.examResult;
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.warn('[LocalStorageAdapter] Failed to clear exam result:', err);
      return false;
    }
  }

  /**
   * Save active in-progress exam session to LocalStorage (page refresh protection)
   * @param {Object} sessionData - Active exam state and question data
   * @returns {boolean} Success status
   */
  static saveExamSession(sessionData) {
    try {
      const key = APP_CONFIG.storageKeys.examSession;
      const serialized = JSON.stringify(sessionData);
      localStorage.setItem(key, serialized);
      return true;
    } catch (err) {
      console.warn('[LocalStorageAdapter] Failed to save exam session:', err);
      return false;
    }
  }

  /**
   * Load saved active exam session from LocalStorage
   * @returns {Object|null} Exam session object or null
   */
  static loadExamSession() {
    try {
      const key = APP_CONFIG.storageKeys.examSession;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (err) {
      console.warn('[LocalStorageAdapter] Failed to load exam session:', err);
      return null;
    }
  }

  /**
   * Clear saved active exam session from LocalStorage upon submission
   * @returns {boolean} Success status
   */
  static clearExamSession() {
    try {
      const key = APP_CONFIG.storageKeys.examSession;
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.warn('[LocalStorageAdapter] Failed to clear exam session:', err);
      return false;
    }
  }
}

