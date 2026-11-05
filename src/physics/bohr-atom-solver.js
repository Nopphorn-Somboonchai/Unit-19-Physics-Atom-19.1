/**
 * @file bohr-atom-solver.js
 * @description Physics Solvers for Bohr's Atomic Theory and Orbit Mechanics.
 * Conforms to Physics Learning Standard (v1.13.0) — zero DOM/Canvas dependencies.
 */

import {
  BOHR_RADIUS_1,
  BOHR_VELOCITY_1,
  HBAR,
  GROUND_STATE_ENERGY_EV,
  GROUND_STATE_ENERGY_JOULES,
  EV_TO_JOULES
} from '../shared/constants.js';

/**
 * Calculate electron orbit radius at principal quantum level n: r_n = n² * r₁
 * @param {number} n - Quantum level (1, 2, 3, ...)
 * @returns {number} Radius in meters
 */
export function calculateBohrRadius(n) {
  const level = Math.max(1, parseInt(n, 10) || 1);
  return level * level * BOHR_RADIUS_1;
}

/**
 * Calculate electron orbital speed at level n: v_n = v₁ / n
 * @param {number} n - Quantum level (1, 2, 3, ...)
 * @returns {number} Velocity in m/s
 */
export function calculateBohrVelocity(n) {
  const level = Math.max(1, parseInt(n, 10) || 1);
  return BOHR_VELOCITY_1 / level;
}

/**
 * Calculate electron orbital angular momentum at level n: L = n * ħ = n * (h / (2*π))
 * @param {number} n - Quantum level (1, 2, 3, ...)
 * @returns {number} Angular momentum in kg·m²/s (J·s)
 */
export function calculateAngularMomentum(n) {
  const level = Math.max(1, parseInt(n, 10) || 1);
  return level * HBAR;
}

/**
 * Calculate total energy level of hydrogen electron at level n: E_n = -13.6 / n² eV
 * @param {number} n - Quantum level (1, 2, 3, ...)
 * @returns {{ electronVolts: number, joules: number }}
 */
export function calculateEnergyLevel(n) {
  const level = Math.max(1, parseInt(n, 10) || 1);
  const nSq = level * level;
  const electronVolts = GROUND_STATE_ENERGY_EV / nSq;
  const joules = GROUND_STATE_ENERGY_JOULES / nSq;
  return { electronVolts, joules };
}

/**
 * Calculate ionization energy required to remove electron from level n to infinity: E_ion = |E_n|
 * @param {number} n - Quantum level (1, 2, 3, ...)
 * @returns {{ electronVolts: number, joules: number }}
 */
export function calculateIonizationEnergy(n) {
  const level = Math.max(1, parseInt(n, 10) || 1);
  const nSq = level * level;
  const electronVolts = -GROUND_STATE_ENERGY_EV / nSq;
  const joules = -GROUND_STATE_ENERGY_JOULES / nSq;
  return { electronVolts, joules };
}

/**
 * Calculate circumference of Bohr orbit: C = 2 * π * r_n
 * @param {number} n - Quantum level (1, 2, 3, ...)
 * @returns {number} Circumference in meters
 */
export function calculateOrbitCircumference(n) {
  return 2 * Math.PI * calculateBohrRadius(n);
}

