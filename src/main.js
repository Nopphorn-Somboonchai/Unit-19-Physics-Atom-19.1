/**
 * @file main.js
 * @description Main application entry point for Unit 19 Interactive Physics Portal.
 * Initializes Simulators, Adapters, Quiz System, Timed Exam, Section Navigator, and KaTeX rendering.
 * Conforms to Physics Learning Standard (v1.13.0).
 */

import { APP_CONFIG } from './shared/config.js';
import {
  SPEED_OF_LIGHT,
  PLANCK_CONSTANT,
  RYDBERG_CONSTANT,
  BOHR_RADIUS_1,
  GROUND_STATE_ENERGY_EV
} from './shared/constants.js';

import { BlackbodySimulator } from './application/blackbody-simulator.js';
import { BohrAtomSimulator } from './application/bohr-atom-simulator.js';
import { HydrogenSpectrumSimulator } from './application/hydrogen-spectrum-simulator.js';

import { ControlPanelAdapter } from './adapters/ui/control-panel.js';
import { TabNavigatorAdapter } from './adapters/ui/tab-navigator.js';
import { QuizUIAdapter } from './adapters/ui/quiz-ui.js';
import { ExamUIAdapter } from './adapters/ui/exam-ui.js';
import { KaTeXAdapter } from './adapters/formula/katex-adapter.js';

setupErrorBoundary();

document.addEventListener('DOMContentLoaded', () => {
  console.log(`[Physics Portal] Initializing ${APP_CONFIG.appName} v${APP_CONFIG.version}`);
  console.log(`[Physics Constants] c = ${SPEED_OF_LIGHT.toExponential(2)} m/s, h = ${PLANCK_CONSTANT.toExponential(3)} J·s, RH = ${RYDBERG_CONSTANT.toExponential(3)} m⁻¹`);

  verifyKaTeXLoaded();

  try {
    // 1. Initialize Simulator 19.1.1 (Blackbody Radiation & Planck Hypothesis)
    const canvasBlackbody = document.getElementById('canvas-blackbody');
    let blackbodySim = null;
    if (canvasBlackbody) {
      blackbodySim = new BlackbodySimulator(canvasBlackbody);
      ControlPanelAdapter.bindBlackbodyControls(blackbodySim);
    }

    // 2. Initialize Simulator 19.1.2A (Bohr Atomic Orbits & Dynamics)
    const canvasBohr = document.getElementById('canvas-bohr');
    let bohrSim = null;
    if (canvasBohr) {
      bohrSim = new BohrAtomSimulator(canvasBohr);
      ControlPanelAdapter.bindBohrControls(bohrSim);
    }

    // 3. Initialize Simulator 19.1.2B (Hydrogen Transitions & Spectra)
    const canvasSpectrum = document.getElementById('canvas-spectrum');
    let spectrumSim = null;
    if (canvasSpectrum) {
      spectrumSim = new HydrogenSpectrumSimulator(canvasSpectrum);
      ControlPanelAdapter.bindSpectrumControls(spectrumSim);
    }

    // 4. Initialize Practice & Dynamic RNG Quiz System
    const quizUI = new QuizUIAdapter();

    // 5. Initialize Timed Exam System & Anti-Cheat Manager
    const examUI = new ExamUIAdapter();

    // 6. Initialize Section & Tab Navigation Adapter
    TabNavigatorAdapter.init({
      blackbodySim,
      bohrSim,
      spectrumSim
    });

    // 7. Render All Mathematical Notation across Document
    renderAllMathFormulas();

    console.log('[Physics Portal] All modules and simulators initialized successfully.');
  } catch (err) {
    console.error('[Physics Portal Error] Failed to initialize portal modules:', err);
  }
});

function renderAllMathFormulas() {
  let attempts = 0;
  const maxAttempts = 20;

  const tryRender = () => {
    attempts++;
    if (typeof window.katex !== 'undefined') {
      KaTeXAdapter.renderAllMath(document.body);
    } else if (attempts < maxAttempts) {
      setTimeout(tryRender, 80);
    }
  };

  tryRender();
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => {
      KaTeXAdapter.renderAllMath(document.body);
    });
  }
}

function verifyKaTeXLoaded() {
  if (typeof window.katex !== 'undefined') {
    console.log('[KaTeX Adapter] Local KaTeX engine loaded successfully for offline formula rendering.');
  } else {
    console.warn('[KaTeX Adapter] KaTeX not found in global window context. Retrying...');
  }
}

function setupErrorBoundary() {
  window.addEventListener('error', (evt) => {
    console.error('[Global Error Boundary]', evt.message, evt.filename, evt.lineno);
  });

  window.addEventListener('unhandledrejection', (evt) => {
    console.error('[Unhandled Rejection Boundary]', evt.reason);
  });
}

