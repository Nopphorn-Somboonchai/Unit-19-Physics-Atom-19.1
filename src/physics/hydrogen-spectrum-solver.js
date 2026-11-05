/**
 * @file hydrogen-spectrum-solver.js
 * @description Physics Solvers for Hydrogen Transitions & Rydberg Formula.
 * Conforms to Physics Learning Standard (v1.13.0) — zero DOM/Canvas dependencies.
 */

import {
  SPEED_OF_LIGHT,
  PLANCK_CONSTANT,
  RYDBERG_CONSTANT,
  GROUND_STATE_ENERGY_EV,
  EV_TO_JOULES,
  JOULES_TO_EV
} from '../shared/constants.js';
import { findSeriesByNf, BALMER_LINES } from './hydrogen-spectrum-model.js';

/**
 * Calculate energy difference between two levels: ΔE = |E_i - E_f|
 * @param {number} ni - Initial level (1, 2, ...)
 * @param {number} nf - Final level (1, 2, ...)
 * @returns {{ electronVolts: number, joules: number }}
 */
export function calculateTransitionEnergy(ni, nf) {
  const i = Math.max(1, parseInt(ni, 10) || 1);
  const f = Math.max(1, parseInt(nf, 10) || 1);

  if (i === f) {
    return { electronVolts: 0, joules: 0 };
  }

  // ΔE = 13.6 * |1/nf² - 1/ni²| eV
  const term = Math.abs(1 / (f * f) - 1 / (i * i));
  const electronVolts = Math.abs(GROUND_STATE_ENERGY_EV) * term;
  const joules = electronVolts * EV_TO_JOULES;

  return { electronVolts, joules };
}

/**
 * Calculate wavelength of transition using Rydberg formula:
 * 1/λ = R_H * |1/nf² - 1/ni²|
 * @param {number} ni - Initial level (1, 2, ...)
 * @param {number} nf - Final level (1, 2, ...)
 * @returns {{ meters: number, nanometers: number, angstroms: number }}
 */
export function calculateTransitionWavelength(ni, nf) {
  const i = Math.max(1, parseInt(ni, 10) || 1);
  const f = Math.max(1, parseInt(nf, 10) || 1);

  if (i === f) {
    return { meters: Infinity, nanometers: Infinity, angstroms: Infinity };
  }

  const term = Math.abs(1 / (f * f) - 1 / (i * i));
  const invLambda = RYDBERG_CONSTANT * term;
  const meters = 1 / invLambda;

  return {
    meters,
    nanometers: meters * 1e9,
    angstroms: meters * 1e10
  };
}

/**
 * Calculate frequency of transition photon: f = c / λ
 * @param {number} ni - Initial level
 * @param {number} nf - Final level
 * @returns {number} Frequency in Hz
 */
export function calculateTransitionFrequency(ni, nf) {
  const { meters } = calculateTransitionWavelength(ni, nf);
  if (!isFinite(meters) || meters <= 0) return 0;
  return SPEED_OF_LIGHT / meters;
}

/**
 * Approximate RGB hex color from wavelength in nanometers (380 - 750 nm)
 * Uses standard optical physics approximation for visual feedback.
 * @param {number} lambdaNm - Wavelength in nanometers
 * @returns {{ hex: string, rgb: string, isVisible: boolean }}
 */
export function wavelengthToRGB(lambdaNm) {
  const wl = Number(lambdaNm);
  if (wl < 380 || wl > 750) {
    // Non-visible: UV or IR
    return {
      hex: wl < 380 ? '#7c3aed' : '#dc2626',
      rgb: wl < 380 ? 'rgb(124, 58, 237)' : 'rgb(220, 38, 38)',
      isVisible: false
    };
  }

  let r = 0, g = 0, b = 0;

  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wl >= 440 && wl < 490) {
    r = 0.0;
    g = (wl - 440) / (490 - 440);
    b = 1.0;
  } else if (wl >= 490 && wl < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wl - 510) / (510 - 490);
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wl >= 580 && wl < 645) {
    r = 1.0;
    g = -(wl - 645) / (645 - 580);
    b = 0.0;
  } else if (wl >= 645 && wl <= 750) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  }

  // Vision sensitivity fall-off near edges
  let factor = 1.0;
  if (wl >= 380 && wl < 420) {
    factor = 0.3 + 0.7 * (wl - 380) / (420 - 380);
  } else if (wl >= 700 && wl <= 750) {
    factor = 0.3 + 0.7 * (750 - wl) / (750 - 700);
  }

  const red = Math.round(255 * Math.pow(r * factor, 0.8));
  const green = Math.round(255 * Math.pow(g * factor, 0.8));
  const blue = Math.round(255 * Math.pow(b * factor, 0.8));

  const hex = `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;

  return {
    hex,
    rgb: `rgb(${red}, ${green}, ${blue})`,
    isVisible: true
  };
}

/**
 * Get comprehensive transition information
 * @param {number} ni - Initial level
 * @param {number} nf - Final level
 * @returns {object} Full transition metadata
 */
export function getTransitionDetails(ni, nf) {
  const i = Math.max(1, parseInt(ni, 10) || 1);
  const f = Math.max(1, parseInt(nf, 10) || 1);

  const isEmission = i > f;
  const lower = Math.min(i, f);
  const upper = Math.max(i, f);

  const energy = calculateTransitionEnergy(i, f);
  const wavelength = calculateTransitionWavelength(i, f);
  const frequency = calculateTransitionFrequency(i, f);
  const series = findSeriesByNf(lower);
  const opticalColor = wavelengthToRGB(wavelength.nanometers);

  // Check if matches known Balmer line
  const balmerMatch = BALMER_LINES.find(l => l.ni === upper && l.nf === lower);

  return {
    ni: i,
    nf: f,
    isEmission,
    typeTh: isEmission ? 'การคายพลังงาน (Emission)' : 'การดูดกลืนพลังงาน (Absorption)',
    deltaEEV: energy.electronVolts,
    deltaEJoules: energy.joules,
    wavelengthMeters: wavelength.meters,
    wavelengthNm: wavelength.nanometers,
    frequencyHz: frequency,
    series,
    colorHex: balmerMatch ? balmerMatch.colorHex : opticalColor.hex,
    colorRgb: opticalColor.rgb,
    isVisible: opticalColor.isVisible,
    balmerLabel: balmerMatch ? balmerMatch.label : null
  };
}

