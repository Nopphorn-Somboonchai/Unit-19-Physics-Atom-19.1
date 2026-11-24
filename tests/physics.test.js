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

import {
  getAllGasLightSources,
  IPST_SAMPLE_OBSERVATIONS
} from '../src/physics/gas-spectrum-lab-model.js';
import {
  calculateGratingSpacing,
  calculateSpectralLinePosition,
  calculateLineVisibility,
  computeLabSpectrumState,
  calculateWavelengthFromMeasurement,
  validateManualRowCalculation
} from '../src/physics/gas-spectrum-lab-solver.js';

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

// --- 4. Activity 19.1 Hot Gas Spectrum Diffraction Grating Lab Tests ---
console.log('\n--- Test Suite 4: Activity 19.1 Hot Gas Spectrum Virtual Lab ---');
const allSources = getAllGasLightSources();
assert(allSources.length === 5, '5 lab light sources defined (H2, Ne, Incandescent, He, Hg)');

// Grating spacing d = 1 / 5300 cm ≈ 1.8868e-4 cm (IPST reference: 1.886e-4 cm)
const sp5300 = calculateGratingSpacing(5300);
assertCloseTo(sp5300.dCm, 1.8868e-4, 1e-7, 'Grating 5300 lines/cm -> d ≈ 1.8868e-4 cm');
assertCloseTo(sp5300.dMeters, 1.8868e-6, 1e-9, 'Grating 5300 lines/cm -> d ≈ 1.8868e-6 m (SI)');

// Hydrogen H-alpha (656.3 nm) at D = 100 cm, N = 5300 lines/cm -> x ≈ 37.1 cm (IPST table: 37.0 cm)
const hRedPos = calculateSpectralLinePosition(656.3, 5300, 100, 1, 50.0);
assert(hRedPos.isPhysical && hRedPos.isOnMeterStick, 'H-alpha 656.3 nm lies physically on 0-100 cm meter stick');
assertCloseTo(hRedPos.displacementCm, 37.09, 0.2, 'H-alpha displacement x ≈ 37.1 cm at D=100 cm');
assertCloseTo(hRedPos.rightPosCm - 50, 50 - hRedPos.leftPosCm, 1e-6, 'Left and right spectral positions are symmetric around 50 cm');

// Hydrogen H-beta (486.1 nm) -> x ≈ 26.7 cm (IPST table: 27.0 cm)
const hCyanPos = calculateSpectralLinePosition(486.1, 5300, 100, 1, 50.0);
assertCloseTo(hCyanPos.displacementCm, 26.66, 0.2, 'H-beta displacement x ≈ 26.7 cm at D=100 cm');

// Boundary case: unphysical sin(theta) >= 1 (e.g., 2500 nm with 5300 lines/cm)
const invalidOrder = calculateSpectralLinePosition(2500, 5300, 100, 1, 50.0);
assert(invalidOrder.isPhysical === false, 'Unphysical wavelength (sin θ >= 1) safely flagged non-physical');

// Inverse IPST Table calculation check (Textbook Row 1: H2 Red, right=88.0, left=14.0 -> x_bar=37.0, L=106.6, sin=0.347, lambda≈6.55e-5 cm)
const ipstRow1 = calculateWavelengthFromMeasurement({
  rightPosCm: IPST_SAMPLE_OBSERVATIONS[0].rightPosCm,
  leftPosCm: IPST_SAMPLE_OBSERVATIONS[0].leftPosCm,
  distanceCm: 100,
  linesPerCm: 5300,
  expectedNm: 656.3
});
assertCloseTo(ipstRow1.xAvgCm, 37.0, 0.01, 'IPST sample H2 Red average displacement x_bar = 37.0 cm');
assertCloseTo(ipstRow1.hypotenuseCm, 106.625, 0.1, 'IPST sample H2 Red hypotenuse sqrt(D²+x̄²) ≈ 106.6 cm');
assertCloseTo(ipstRow1.sinTheta, 0.347, 0.005, 'IPST sample H2 Red sin(θ) ≈ 0.35');
assertCloseTo(ipstRow1.wavelengthNm, 654.7, 5.0, 'IPST sample H2 Red calculated λ ≈ 655 nm (~6.6e-5 cm)');

// Darkroom visibility check: faint H-delta line brighter in darkroom + black backdrop than bright room without screen
const visDark = calculateLineVisibility(0.34, 0.05, true);
const visBright = calculateLineVisibility(0.34, 0.95, false);
assert(visDark > visBright * 2, 'Darkroom + black screen significantly increases visibility of faint H-delta violet line');

// Continuous spectrum state for incandescent lamp
const incState = computeLabSpectrumState({ sourceId: 'incandescent', powerOn: true, distanceCm: 100, gratingLinesPerCm: 5300 });
assert(incState.spectrumType === 'continuous' && incState.continuousBand !== null, 'Incandescent bulb produces continuous spectrum band');

// Manual calculation tolerance validation
const manualPass = validateManualRowCalculation(
  { xAvgCm: '37.0', hypotenuseCm: '106.6', sinTheta: '0.35', wavelengthNm: '655' },
  ipstRow1
);
assert(manualPass.allCorrect === true, 'Manual calculation within documented tolerances accepted');

const manualFail = validateManualRowCalculation(
  { xAvgCm: '37.0', hypotenuseCm: '106.6', sinTheta: '0.35', wavelengthNm: '500' },
  ipstRow1
);
assert(manualFail.allCorrect === false && manualFail.checks.wavelengthNm.status === 'incorrect', 'Incorrect manual wavelength rejected');

console.log(`\n=======================================================`);
console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`=======================================================`);

if (failed > 0) {
  process.exit(1);
}

