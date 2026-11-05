/**
 * @file blackbody-solver.js
 * @description Physics Solvers for Planck's Hypothesis & Blackbody Radiation.
 * Conforms to Physics Learning Standard (v1.13.0) — pure calculations.
 */

import {
  SPEED_OF_LIGHT,
  PLANCK_CONSTANT,
  WIEN_CONSTANT,
  EV_TO_JOULES,
  JOULES_TO_EV
} from '../shared/constants.js';

/**
 * Calculate quantum of energy: E = n * h * f
 * @param {number} frequencyHz - Frequency in Hz
 * @param {number} [n=1] - Quantum number / number of photons
 * @returns {{ joules: number, electronVolts: number }}
 */
export function calculateQuantumEnergy(frequencyHz, n = 1) {
  const f = Math.max(0, Number(frequencyHz) || 0);
  const count = Math.max(1, parseInt(n, 10) || 1);
  const joules = count * PLANCK_CONSTANT * f;
  const electronVolts = joules * JOULES_TO_EV;
  return { joules, electronVolts };
}

/**
 * Calculate photon energy from wavelength: E = n * h * c / λ
 * @param {number} wavelengthMeters - Wavelength in meters
 * @param {number} [n=1] - Quantum number / number of photons
 * @returns {{ joules: number, electronVolts: number }}
 */
export function calculateEnergyFromWavelength(wavelengthMeters, n = 1) {
  const lambda = Math.max(1e-15, Number(wavelengthMeters) || 1e-7);
  const count = Math.max(1, parseInt(n, 10) || 1);
  const joules = (count * PLANCK_CONSTANT * SPEED_OF_LIGHT) / lambda;
  const electronVolts = joules * JOULES_TO_EV;
  return { joules, electronVolts };
}

/**
 * Calculate photon frequency from energy in Joules: f = E / h
 * @param {number} energyJoules
 * @returns {number} Frequency in Hz
 */
export function calculatePhotonFrequency(energyJoules) {
  const E = Math.max(0, Number(energyJoules) || 0);
  return E / PLANCK_CONSTANT;
}

/**
 * Calculate photon wavelength from energy in Joules: λ = h * c / E
 * @param {number} energyJoules
 * @returns {number} Wavelength in meters
 */
export function calculatePhotonWavelength(energyJoules) {
  const E = Math.max(1e-35, Number(energyJoules) || 1e-19);
  return (PLANCK_CONSTANT * SPEED_OF_LIGHT) / E;
}

/**
 * Calculate peak wavelength of blackbody radiation using Wien's Law: λ_max = b / T
 * @param {number} temperatureKelvin - Absolute temperature in Kelvin
 * @returns {number} Peak wavelength in meters
 */
export function calculateWienPeakWavelength(temperatureKelvin) {
  const T = Math.max(1, Number(temperatureKelvin) || 1);
  return WIEN_CONSTANT / T;
}

/**
 * Calculate blackbody temperature from peak wavelength: T = b / λ_max
 * @param {number} wavelengthMeters - Peak wavelength in meters
 * @returns {number} Temperature in Kelvin
 */
export function calculateWienTemperature(wavelengthMeters) {
  const lambda = Math.max(1e-12, Number(wavelengthMeters) || 1e-7);
  return WIEN_CONSTANT / lambda;
}

/**
 * Convert Joules to electron-volts
 * @param {number} joules
 * @returns {number}
 */
export function joulesToElectronVolts(joules) {
  return Number(joules) * JOULES_TO_EV;
}

/**
 * Convert electron-volts to Joules
 * @param {number} eV
 * @returns {number}
 */
export function electronVoltsToJoules(eV) {
  return Number(eV) * EV_TO_JOULES;
}

/**
 * Calculate number of photons given total energy and single photon energy: n = E_total / E_photon
 * @param {number} totalEnergyJoules
 * @param {number} singlePhotonEnergyJoules
 * @returns {number}
 */
export function calculatePhotonCount(totalEnergyJoules, singlePhotonEnergyJoules) {
  const total = Math.max(0, Number(totalEnergyJoules) || 0);
  const single = Math.max(1e-35, Number(singlePhotonEnergyJoules) || 1e-19);
  return total / single;
}

