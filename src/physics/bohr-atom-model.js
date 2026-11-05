/**
 * @file bohr-atom-model.js
 * @description Bohr Hydrogen Atom State Model.
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
 * Creates a Bohr Atomic Orbit State for principal quantum number n.
 * @param {number} n - Principal quantum number (n = 1, 2, 3, ...)
 * @returns {object} Bohr orbit state object
 */
export function createBohrOrbit(n) {
  const quantumNumber = Math.max(1, parseInt(n, 10) || 1);
  const nSq = quantumNumber * quantumNumber;

  // Radius: r_n = n² * r₁
  const radiusMeters = nSq * BOHR_RADIUS_1;

  // Velocity: v_n = v₁ / n
  const velocityMps = BOHR_VELOCITY_1 / quantumNumber;

  // Orbital angular momentum: L = n * ħ = n * (h / (2*π))
  const angularMomentum = quantumNumber * HBAR;

  // Total Energy: E_n = E₁ / n² (-13.6 eV / n²)
  const totalEnergyEV = GROUND_STATE_ENERGY_EV / nSq;
  const totalEnergyJoules = GROUND_STATE_ENERGY_JOULES / nSq;

  // Kinetic energy: E_k = 13.6 eV / n²
  const kineticEnergyEV = -totalEnergyEV;
  const kineticEnergyJoules = kineticEnergyEV * EV_TO_JOULES;

  // Potential energy: E_p = -27.2 eV / n² = 2 * E_total
  const potentialEnergyEV = 2 * totalEnergyEV;
  const potentialEnergyJoules = potentialEnergyEV * EV_TO_JOULES;

  // State Name
  const stateLabelTh = quantumNumber === 1
    ? 'สถานะพื้น (Ground State)'
    : `สถานะกระตุ้นที่ ${quantumNumber - 1} (${getOrdinalTh(quantumNumber - 1)} Excited State)`;

  return {
    n: quantumNumber,
    radiusMeters,
    radiusAngstroms: radiusMeters * 1e10,
    velocityMps,
    angularMomentum,
    totalEnergyEV,
    totalEnergyJoules,
    kineticEnergyEV,
    kineticEnergyJoules,
    potentialEnergyEV,
    potentialEnergyJoules,
    stateLabelTh,
    isGroundState: quantumNumber === 1
  };
}

function getOrdinalTh(num) {
  const ordinals = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th' };
  return ordinals[num] || `${num}th`;
}

