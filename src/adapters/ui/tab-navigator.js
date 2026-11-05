/**
 * @file tab-navigator.js
 * @description Master Tab & Section Navigation Adapter for Unit 19.
 * Controls top-level sections (Home, Review, Practice, Exam) and Review sub-tabs.
 * Locks navigation during live exam according to Standard v1.13.0.
 */

import { KaTeXAdapter } from '../formula/katex-adapter.js';
import { SimulatorLoader } from './simulator-loader.js';

export class TabNavigatorAdapter {
  static currentSection = 'home';
  static currentReviewTab = '19-1-blackbody';
  static isExamInProgress = false;
  static simulators = {};

  static setExamInProgress(inProgress) {
    this.isExamInProgress = Boolean(inProgress);
  }

  /**
   * Switch between primary sections
   * @param {'home'|'review'|'practice'|'exam-start'|'exam-live'|'exam-result'} targetSection
   */
  static showSection(targetSection) {
    if (this.isExamInProgress && !['exam-live', 'exam-result'].includes(targetSection)) {
      alert('⚠️ อยู่ระหว่างการทำแบบทดสอบจับเวลา ไม่สามารถออกจากหน้าสอบได้จนกว่าจะส่งคำตอบ');
      return;
    }

    this.currentSection = targetSection;
    const sections = ['home', 'review', 'practice', 'exam-start', 'exam-live', 'exam-result'];

    sections.forEach((sec) => {
      const el = document.getElementById(`sec-${sec}`);
      if (el) {
        if (sec === targetSection) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    // Close mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) mobileMenu.classList.add('hidden');

    // Section specific lifecycle hooks
    if (targetSection === 'review') {
      this.switchReviewTab(this.currentReviewTab);
    }

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        const activeContainer = document.getElementById(`sec-${targetSection}`);
        if (activeContainer) {
          KaTeXAdapter.renderAllMath(activeContainer);
        }
      });
    }
  }

  /**
   * Switch between Review sub-tabs (19.1.1 Blackbody, 19.1.2A Bohr, 19.1.2B Spectrum)
   * @param {'19-1-blackbody'|'19-2-bohr'|'19-3-spectrum'} tabId
   */
  static switchReviewTab(tabId) {
    this.currentReviewTab = tabId;
    const tabKeys = ['19-1-blackbody', '19-2-bohr', '19-3-spectrum'];

    tabKeys.forEach((key) => {
      const btn = document.getElementById(`btn-tab-${key}`);
      const content = document.getElementById(`review-tab-${key}`);

      if (btn) {
        if (key === tabId) {
          btn.className = 'flex-1 min-w-[160px] text-center py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 bg-white text-blue-600 shadow-sm cursor-pointer';
        } else {
          btn.className = 'flex-1 min-w-[160px] text-center py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all duration-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 cursor-pointer';
        }
      }

      if (content) {
        if (key === tabId) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      }
    });

    this.handleSimulatorLifecycle(tabId);

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        const content = document.getElementById(`review-tab-${tabId}`);
        if (content) KaTeXAdapter.renderAllMath(content);
      });
    }
  }

  /**
   * Manage active simulator lifecycle on sub-tab switch
   * @param {string} tabId
   */
  static handleSimulatorLifecycle(tabId) {
    const { blackbodySim, bohrSim, spectrumSim } = this.simulators;

    SimulatorLoader.load(tabId, { duration: 600 });

    if (tabId === '19-1-blackbody' && blackbodySim) {
      blackbodySim.renderer.resize();
      blackbodySim.render();
    }

    if (tabId === '19-2-bohr' && bohrSim) {
      bohrSim.renderer.resize();
      bohrSim.updateReadouts();
    }

    if (tabId === '19-3-spectrum' && spectrumSim) {
      spectrumSim.renderer.resize();
      spectrumSim.render();
      spectrumSim.updateReadouts();
    }
  }

  static toggleMobileMenu() {
    if (typeof document === 'undefined') return;
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      mobileMenu.classList.toggle('hidden');
    }
  }

  static init(simulators = {}) {
    this.simulators = simulators;
    SimulatorLoader.initGlobalHandlers();

    if (typeof window !== 'undefined') {
      window.showSection = (sectionId) => this.showSection(sectionId);
      window.switchReviewTab = (tabId) => this.switchReviewTab(tabId);
      window.toggleMobileMenu = () => this.toggleMobileMenu();
    }

    if (this.isExamInProgress) {
      this.showSection('exam-live');
    } else {
      this.showSection('home');
    }
  }
}

