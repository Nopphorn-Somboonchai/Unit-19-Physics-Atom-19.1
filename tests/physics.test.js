/**
 * @file physics.test.js
 * @description Automated Unit Verification Script for Unit 19 Physics Engine & Models.
 * Runs in pure Node.js environment without DOM/Canvas dependencies.
 */

import { createBlackbody } from '../src/physics/blackbody-model.js';
import {
  calculateQuantumEnergy,
  calculateEnergyFromWavelength,
  calculateWienPeakWavelength,
  calculateWienTemperature,
  calculatePhotonCount
} from '../src/physics/blackbody-solver.js';

import { createBohrOrbit } from '../src/physics/bohr-atom-model.js';
import {
  calculateBohrRadius,
  calculateBohrVelocity,
  calculateAngularMomentum,
  calculateEnergyLevel,
  calculateIonizationEnergy
} from '../src/physics/bohr-atom-solver.js';

import { findSeriesByNf, getAllSpectralSeries } from '../src/physics/hydrogen-spectrum-model.js';
import {
  calculateTransitionEnergy,
  calculateTransitionWavelength,
  calculateTransitionFrequency,
  getTransitionDetails,
  wavelengthToRGB
} from '../src/physics/hydrogen-spectrum-solver.js';

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

function assertCloseTo(actual, expected, precision = 1e-4, message = '') {
  const diff = Math.abs(actual - expected);
  assert(diff <= precision, `${message} (Expected: ~${expected}, Got: ${actual})`);
}

console.log('=============== 🧪 RUNNING PHASE 2 PHYSICS ENGINE TESTS ===============\n');

// --- 1. Blackbody & Planck Hypothesis Tests ---
console.log('--- Test Suite 1: Blackbody & Planck Hypothesis ---');
// Sun temperature ~5800 K -> peak wavelength around 500 nm (0.5 µm)
const sunBB = createBlackbody(5800);
assertCloseTo(sunBB.peakWavelengthNm, 499.65, 0.5, 'Sun at 5800K peak wavelength should be ~500 nm');
assert(sunBB.getPeakRegion() === 'visible', 'Sun peak emission is in visible light');

// Wien's Displacement Law
const wienLambda = calculateWienPeakWavelength(5000);
assertCloseTo(wienLambda, 5.796e-7, 1e-9, 'Wien law at T=5000K: λ_max ≈ 580 nm');

const wienTemp = calculateWienTemperature(5e-7);
assertCloseTo(wienTemp, 5796, 5, 'Wien law inverse: λ_max=500nm -> T ≈ 5796 K');

// Quantum Energy: E = hf
const photonE = calculateQuantumEnergy(5e14); // 500 THz Green Light
assertCloseTo(photonE.electronVolts, 2.067, 0.05, '500 THz photon energy ≈ 2.07 eV');

// 100 Photons
const multiE = calculateQuantumEnergy(5e14, 100);
assertCloseTo(multiE.joules, photonE.joules * 100, 1e-25, '100 photons have 100x energy of single photon');

// Wavelength to Energy: E = hc / λ (λ = 500 nm)
const energy500nm = calculateEnergyFromWavelength(500e-9);
assertCloseTo(energy500nm.electronVolts, 2.48, 0.05, 'λ = 500 nm photon energy ≈ 2.48 eV');

// Photon Count
const count = calculatePhotonCount(1.0, photonE.joules);
assert(count > 1e18, '1 Joule pulse of visible light contains > 10^18 photons');

// --- 2. Bohr Atomic Model & Orbit Mechanics Tests ---
console.log('\n--- Test Suite 2: Bohr Atomic Model & Orbits ---');
// Ground state n = 1
const orbit1 = createBohrOrbit(1);
assertCloseTo(orbit1.radiusMeters, 5.29e-11, 1e-13, 'Ground state radius r1 = 5.29e-11 m (0.529 Å)');
assertCloseTo(orbit1.velocityMps, 2.18e6, 1e4, 'Ground state velocity v1 = 2.18e6 m/s');
assertCloseTo(orbit1.totalEnergyEV, -13.6, 0.01, 'Ground state total energy E1 = -13.6 eV');
assertCloseTo(orbit1.kineticEnergyEV, 13.6, 0.01, 'Ground state kinetic energy Ek1 = +13.6 eV');
assertCloseTo(orbit1.potentialEnergyEV, -27.2, 0.01, 'Ground state potential energy Ep1 = -27.2 eV');
assert(orbit1.isGroundState === true, 'n=1 is correctly identified as ground state');

// Excited state n = 2
const r2 = calculateBohrRadius(2);
assertCloseTo(r2, 4 * 5.29e-11, 1e-13, 'Bohr radius scales with n²: r2 = 4*r1');

const v2 = calculateBohrVelocity(2);
assertCloseTo(v2, 2.18e6 / 2, 1e3, 'Bohr velocity scales with 1/n: v2 = v1/2');

const e2 = calculateEnergyLevel(2);
assertCloseTo(e2.electronVolts, -3.4, 0.01, 'Bohr energy at n=2: E2 = -3.40 eV');

const ionE1 = calculateIonizationEnergy(1);
assertCloseTo(ionE1.electronVolts, 13.6, 0.01, 'Ionization energy for n=1 is 13.6 eV');

const l3 = calculateAngularMomentum(3);
assertCloseTo(l3, 3 * (6.626e-34 / (2 * Math.PI)), 1e-36, 'Angular momentum L3 = 3*ħ');

// --- 3. Hydrogen Spectra & Transition Solvers ---
console.log('\n--- Test Suite 3: Hydrogen Spectra & Rydberg Transitions ---');
// Balmer H-alpha line: 3 -> 2
const balmerHAlpha = getTransitionDetails(3, 2);
assert(balmerHAlpha.isEmission === true, '3 -> 2 is an emission transition');
assertCloseTo(balmerHAlpha.deltaEEV, 1.889, 0.02, 'Balmer H-alpha ΔE ≈ 1.89 eV');
assertCloseTo(balmerHAlpha.wavelengthNm, 656.3, 1.5, 'Balmer H-alpha wavelength ≈ 656.3 nm (Red)');
assert(balmerHAlpha.isVisible === true, 'H-alpha is in the visible spectrum');
assert(balmerHAlpha.colorHex.toLowerCase() === '#ef4444', 'H-alpha is assigned red color');

// Balmer H-beta line: 4 -> 2
const balmerHBeta = getTransitionDetails(4, 2);
assertCloseTo(balmerHBeta.wavelengthNm, 486.1, 1.5, 'Balmer H-beta wavelength ≈ 486.1 nm (Cyan)');

// Lyman-alpha line: 2 -> 1
const lymanAlpha = getTransitionDetails(2, 1);
assertCloseTo(lymanAlpha.deltaEEV, 10.2, 0.05, 'Lyman-alpha ΔE = 10.2 eV');
assertCloseTo(lymanAlpha.wavelengthNm, 121.5, 1.0, 'Lyman-alpha wavelength ≈ 121.5 nm (UV)');
assert(lymanAlpha.series.id === 'lyman', '2 -> 1 correctly identified as Lyman series');

// Paschen line: 4 -> 3
const paschen1 = getTransitionDetails(4, 3);
assertCloseTo(paschen1.wavelengthNm, 1875, 10, 'Paschen transition wavelength ≈ 1875 nm (Infrared)');
assert(paschen1.series.id === 'paschen', '4 -> 3 correctly identified as Paschen series');

// Brackett line: 5 -> 4
const brackett1 = getTransitionDetails(5, 4);
assertCloseTo(brackett1.wavelengthNm, 4051, 15, 'Brackett transition wavelength ≈ 4051 nm (Infrared)');
assert(brackett1.series.id === 'brackett', '5 -> 4 correctly identified as Brackett series');
assert(brackett1.series.nameTh.includes('แบร์เก็ตต์'), 'Brackett series nameTh is อนุกรมแบร์เก็ตต์');

// Pfund line: 6 -> 5
const pfund1 = getTransitionDetails(6, 5);
assertCloseTo(pfund1.wavelengthNm, 7458, 20, 'Pfund transition wavelength ≈ 7458 nm (Infrared)');
assert(pfund1.series.id === 'pfund', '6 -> 5 correctly identified as Pfund series');
assert(pfund1.series.nameTh.includes('ฟุนด์'), 'Pfund series nameTh is อนุกรมฟุนด์');

// All series lookup
const allSeries = getAllSpectralSeries();
assert(allSeries.length === 5, '5 hydrogen spectral series defined (Lyman, Balmer, Paschen, Brackett, Pfund)');

// Wavelength to RGB tests
const redColor = wavelengthToRGB(656);
assert(redColor.isVisible === true && redColor.rgb.includes('rgb'), '656 nm produces valid visible RGB');

const uvColor = wavelengthToRGB(200);
assert(uvColor.isVisible === false, '200 nm correctly flagged as non-visible');

console.log(`\n=======================================================`);
console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`=======================================================`);

if (failed > 0) {
  process.exit(1);
}

