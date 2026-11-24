/**
 * @file gas-spectrum-lab-solver.js
 * @description Pure Physics Domain Solver for Activity 19.1: Hot Gas Spectrum Diffraction Grating Lab.
 * All optical physics equations operate internally in SI units (meters) and provide explicit
 * unit conversions to cm and nm matching IPST Activity 19.1.
 * Conforms to Physics Learning Standard (v1.13.0) — zero DOM/Canvas dependencies.
 */

import {
  GAS_SPECTRUM_LAB_BOUNDS,
  GAS_SPECTRUM_LAB_DEFAULTS,
  getGasLightSource
} from './gas-spectrum-lab-model.js';

/**
 * Clamp helper for input bounds enforcement
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate diffraction grating slit spacing d = 1 / N
 * @param {number} linesPerCm - Number of slits/lines per centimeter (e.g., 5300)
 * @returns {{ linesPerCm: number, dCm: number, dMeters: number, dNm: number }}
 */
export function calculateGratingSpacing(linesPerCm) {
  const safeN = clamp(
    Number(linesPerCm) || GAS_SPECTRUM_LAB_DEFAULTS.gratingLinesPerCm,
    GAS_SPECTRUM_LAB_BOUNDS.minGratingLinesPerCm,
    GAS_SPECTRUM_LAB_BOUNDS.maxGratingLinesPerCm
  );

  const dCm = 1 / safeN;
  const dMeters = dCm * 1e-2;
  const dNm = dMeters * 1e9;

  return {
    linesPerCm: safeN,
    dCm,
    dMeters,
    dNm
  };
}

/**
 * Calculate diffraction angle and linear displacement on the meter stick for a given wavelength.
 * Physics: n * lambda = d * sin(theta), tan(theta) = x / D => x = D * tan(arcsin(n * lambda / d))
 *
 * @param {number} wavelengthNm - Light wavelength in nanometers (nm)
 * @param {number} linesPerCm - Diffraction grating density (lines/cm)
 * @param {number} distanceCm - Perpendicular distance D from meter stick to grating (cm)
 * @param {number} [order=1] - Diffraction order (m = 1 default)
 * @param {number} [centerPosCm=50.0] - Central bright fringe position on meter stick (cm)
 * @returns {object} Complete geometric diffraction projection state
 */
export function calculateSpectralLinePosition(
  wavelengthNm,
  linesPerCm = GAS_SPECTRUM_LAB_DEFAULTS.gratingLinesPerCm,
  distanceCm = GAS_SPECTRUM_LAB_DEFAULTS.distanceCm,
  order = 1,
  centerPosCm = GAS_SPECTRUM_LAB_DEFAULTS.centerPositionCm
) {
  const spacing = calculateGratingSpacing(linesPerCm);
  const safeD = clamp(
    Number(distanceCm) || GAS_SPECTRUM_LAB_DEFAULTS.distanceCm,
    GAS_SPECTRUM_LAB_BOUNDS.minDistanceCm,
    GAS_SPECTRUM_LAB_BOUNDS.maxDistanceCm
  );
  const lambdaMeters = Math.max(1e-12, Number(wavelengthNm) * 1e-9);
  const m = Math.max(1, Math.floor(Number(order) || 1));

  // SI calculation: sin(theta) = m * lambda / d
  const sinTheta = (m * lambdaMeters) / spacing.dMeters;

  // Boundary check: if sin(theta) >= 1, this diffraction order does not exist physically
  if (!Number.isFinite(sinTheta) || sinTheta >= 0.9999 || sinTheta <= 0) {
    return {
      isPhysical: false,
      isOnMeterStick: false,
      order: m,
      wavelengthNm,
      sinTheta: NaN,
      thetaRad: NaN,
      thetaDeg: NaN,
      displacementCm: NaN,
      rightPosCm: NaN,
      leftPosCm: NaN,
      hypotenuseCm: NaN
    };
  }

  const thetaRad = Math.asin(sinTheta);
  const thetaDeg = (thetaRad * 180) / Math.PI;
  const tanTheta = sinTheta / Math.sqrt(1 - sinTheta * sinTheta);

  // Convert D to SI meters, compute x in meters, then convert back to cm
  const dAxisMeters = safeD * 1e-2;
  const xMeters = dAxisMeters * tanTheta;
  const displacementCm = xMeters * 1e2;
  const hypotenuseCm = Math.sqrt(safeD * safeD + displacementCm * displacementCm);

  const rightPosCm = centerPosCm + displacementCm;
  const leftPosCm = centerPosCm - displacementCm;
  const isOnMeterStick =
    rightPosCm <= GAS_SPECTRUM_LAB_BOUNDS.maxMeterCm &&
    leftPosCm >= GAS_SPECTRUM_LAB_BOUNDS.minMeterCm;

  return {
    isPhysical: true,
    isOnMeterStick,
    order: m,
    wavelengthNm,
    sinTheta,
    thetaRad,
    thetaDeg,
    displacementCm,
    rightPosCm,
    leftPosCm,
    hypotenuseCm
  };
}

/**
 * Deterministic small parallax offset for realistic human-eye reading simulation.
 * Produces slight asymmetry between left and right readings (within +/-0.5 cm)
 * similar to the IPST sample table (e.g., right 38.0 cm vs left 36.0 cm).
 *
 * @param {string} lineId
 * @param {number} sideSign - +1 for right, -1 for left
 * @returns {number} Offset in cm (-0.5 to +0.5 in 0.5 cm steps)
 */
export function getDeterministicReadingOffsetCm(lineId, sideSign) {
  let hash = 0;
  const key = `${lineId}:${sideSign}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 10007;
  }
  const buckets = [-0.5, 0.0, 0.5, -0.5, 0.5];
  return buckets[Math.abs(hash) % buckets.length];
}

/**
 * Compute perceived visibility/alpha (0..1) of a spectral line given room ambient light
 * and whether the black cardboard screen is placed behind the tube.
 * Demonstrates IPST Activity 19.1 Safety & Setup Tip #3 (darkroom & black paper screen).
 *
 * @param {number} baseIntensity - Inherent line brightness (0..1)
 * @param {number} ambientLight - Room illumination (0 = dark, 1 = bright)
 * @param {boolean} useBlackBackdrop - Whether black cardboard screen is installed
 * @returns {number} Visual opacity factor in [0.04, 1.0]
 */
export function calculateLineVisibility(baseIntensity, ambientLight, useBlackBackdrop) {
  const safeAmbient = clamp(Number(ambientLight) || 0, 0, 1);
  // Black cardboard shields ~45% of ambient stray light around the gas tube
  const effectiveGlare = useBlackBackdrop ? safeAmbient * 0.55 : safeAmbient * 1.0;

  // Faint lines (like H-delta 410.2 nm, intensity ~0.34) wash out quickly in bright rooms
  const washedOut = baseIntensity - effectiveGlare * 0.58;
  return clamp(washedOut, 0.04, 1.0);
}

/**
 * Compute full spectrum projection for the active light source and optical bench setup.
 *
 * @param {object} state
 * @returns {object} Computed spectral projection ready for rendering adapters
 */
export function computeLabSpectrumState(state) {
  const source = getGasLightSource(state.sourceId);
  const spacing = calculateGratingSpacing(state.gratingLinesPerCm);
  const distanceCm = clamp(
    Number(state.distanceCm) || GAS_SPECTRUM_LAB_DEFAULTS.distanceCm,
    GAS_SPECTRUM_LAB_BOUNDS.minDistanceCm,
    GAS_SPECTRUM_LAB_BOUNDS.maxDistanceCm
  );
  const centerPosCm = GAS_SPECTRUM_LAB_DEFAULTS.centerPositionCm;
  const ambientLight = clamp(Number(state.ambientLight) ?? 0.15, 0, 1);
  const useBlackBackdrop = Boolean(state.useBlackBackdrop);
  const powerOn = Boolean(state.powerOn);
  const realisticNoise = Boolean(state.realisticNoiseEnabled);

  if (source.spectrumType === 'continuous') {
    const minBand = calculateSpectralLinePosition(
      source.continuousRangeNm.min,
      spacing.linesPerCm,
      distanceCm,
      1,
      centerPosCm
    );
    const maxBand = calculateSpectralLinePosition(
      source.continuousRangeNm.max,
      spacing.linesPerCm,
      distanceCm,
      1,
      centerPosCm
    );
    const visibility = powerOn ? calculateLineVisibility(0.95, ambientLight, useBlackBackdrop) : 0;

    return {
      source,
      spacing,
      distanceCm,
      centerPosCm,
      powerOn,
      ambientLight,
      useBlackBackdrop,
      spectrumType: 'continuous',
      continuousBand: {
        minLambdaNm: source.continuousRangeNm.min,
        maxLambdaNm: source.continuousRangeNm.max,
        rightInnerCm: minBand.rightPosCm,
        rightOuterCm: maxBand.rightPosCm,
        leftInnerCm: minBand.leftPosCm,
        leftOuterCm: maxBand.leftPosCm,
        visibility
      },
      projectedLines: []
    };
  }

  const projectedLines = source.lines.map((line) => {
    const geom = calculateSpectralLinePosition(
      line.wavelengthNm,
      spacing.linesPerCm,
      distanceCm,
      1,
      centerPosCm
    );
    const rightNoise = realisticNoise ? getDeterministicReadingOffsetCm(line.id, 1) : 0;
    const leftNoise = realisticNoise ? getDeterministicReadingOffsetCm(line.id, -1) : 0;

    const displayedRightCm = geom.isPhysical
      ? clamp(geom.rightPosCm + rightNoise, centerPosCm + 1, GAS_SPECTRUM_LAB_BOUNDS.maxMeterCm)
      : NaN;
    const displayedLeftCm = geom.isPhysical
      ? clamp(geom.leftPosCm + leftNoise, GAS_SPECTRUM_LAB_BOUNDS.minMeterCm, centerPosCm - 1)
      : NaN;

    const visibility = powerOn
      ? calculateLineVisibility(line.intensity, ambientLight, useBlackBackdrop)
      : 0;

    return {
      ...line,
      ...geom,
      displayedRightCm,
      displayedLeftCm,
      visibility
    };
  });

  return {
    source,
    spacing,
    distanceCm,
    centerPosCm,
    powerOn,
    ambientLight,
    useBlackBackdrop,
    spectrumType: 'line',
    continuousBand: null,
    projectedLines
  };
}

/**
 * Inverse calculation from student's measured left & right meter-stick positions.
 * Matches every column of the IPST Activity 19.1 data table.
 *
 * @param {object} measurement
 * @param {number} measurement.rightPosCm - Measured spectral position on right side (> 50 cm)
 * @param {number} measurement.leftPosCm - Measured spectral position on left side (< 50 cm)
 * @param {number} measurement.distanceCm - Distance D (cm)
 * @param {number} measurement.linesPerCm - Grating N (lines/cm)
 * @param {number} [measurement.centerPosCm=50.0] - Central fringe position (cm)
 * @param {number|null} [measurement.expectedNm=null] - Known theoretical wavelength for % error
 * @returns {object} Full calculated row matching IPST table columns
 */
export function calculateWavelengthFromMeasurement({
  rightPosCm,
  leftPosCm,
  distanceCm = GAS_SPECTRUM_LAB_DEFAULTS.distanceCm,
  linesPerCm = GAS_SPECTRUM_LAB_DEFAULTS.gratingLinesPerCm,
  centerPosCm = GAS_SPECTRUM_LAB_DEFAULTS.centerPositionCm,
  expectedNm = null
}) {
  const spacing = calculateGratingSpacing(linesPerCm);
  const safeD = Math.max(1, Number(distanceCm) || GAS_SPECTRUM_LAB_DEFAULTS.distanceCm);
  const pR = clamp(Number(rightPosCm), GAS_SPECTRUM_LAB_BOUNDS.minMeterCm, GAS_SPECTRUM_LAB_BOUNDS.maxMeterCm);
  const pL = clamp(Number(leftPosCm), GAS_SPECTRUM_LAB_BOUNDS.minMeterCm, GAS_SPECTRUM_LAB_BOUNDS.maxMeterCm);

  const xRightCm = Math.abs(pR - centerPosCm);
  const xLeftCm = Math.abs(centerPosCm - pL);
  const xAvgCm = (xRightCm + xLeftCm) / 2;
  const hypotenuseCm = Math.sqrt(safeD * safeD + xAvgCm * xAvgCm);
  const sinTheta = hypotenuseCm > 0 ? xAvgCm / hypotenuseCm : 0;

  // SI computation: lambda_m = d_m * sin(theta)
  const wavelengthMeters = spacing.dMeters * sinTheta;
  const wavelengthCm = wavelengthMeters * 1e2;
  const wavelengthNm = wavelengthMeters * 1e9;

  let percentError = null;
  if (typeof expectedNm === 'number' && expectedNm > 0) {
    percentError = (Math.abs(wavelengthNm - expectedNm) / expectedNm) * 100;
  }

  return {
    rightPosCm: pR,
    xRightCm,
    leftPosCm: pL,
    xLeftCm,
    xAvgCm,
    distanceCm: safeD,
    hypotenuseCm,
    sinTheta,
    dCm: spacing.dCm,
    wavelengthCm,
    wavelengthMeters,
    wavelengthNm,
    expectedNm,
    percentError
  };
}

/**
 * Validate student's manual calculations against exact physics values using documented tolerances.
 * Tolerances follow Simulation-Standards.md (absolute tolerance for rounded displayed values,
 * relative tolerance of 3% for calculated wavelength).
 *
 * @param {object} studentInputs - { xAvgCm, hypotenuseCm, sinTheta, wavelengthNm }
 * @param {object} expectedCalc - Output from calculateWavelengthFromMeasurement()
 * @returns {{ allCorrect: boolean, checks: object }}
 */
export function validateManualRowCalculation(studentInputs, expectedCalc) {
  const checkField = (inputVal, expectedVal, absTol, relTol = 0) => {
    const parsed = parseFloat(inputVal);
    if (!Number.isFinite(parsed)) {
      return { valid: false, status: 'empty', expected: expectedVal };
    }
    const diff = Math.abs(parsed - expectedVal);
    const maxTol = Math.max(absTol, Math.abs(expectedVal) * relTol);
    const isCorrect = diff <= maxTol;
    return {
      valid: isCorrect,
      status: isCorrect ? 'correct' : 'incorrect',
      input: parsed,
      expected: expectedVal,
      diff
    };
  };

  const checks = {
    xAvgCm: checkField(studentInputs.xAvgCm, expectedCalc.xAvgCm, 0.25, 0.02),
    hypotenuseCm: checkField(studentInputs.hypotenuseCm, expectedCalc.hypotenuseCm, 0.3, 0.01),
    sinTheta: checkField(studentInputs.sinTheta, expectedCalc.sinTheta, 0.015, 0.03),
    wavelengthNm: checkField(studentInputs.wavelengthNm, expectedCalc.wavelengthNm, 15, 0.03)
  };

  const allCorrect =
    checks.xAvgCm.valid &&
    checks.hypotenuseCm.valid &&
    checks.sinTheta.valid &&
    checks.wavelengthNm.valid;

  return { allCorrect, checks };
}
