/**
 * @file blackbody-model.js
 * @description Pure Physics Model for Blackbody Radiation & Planck Distribution.
 * Conforms to Physics Learning Standard (v1.13.0) — zero DOM/Canvas dependencies.
 */

import {
  SPEED_OF_LIGHT,
  PLANCK_CONSTANT,
  BOLTZMANN_CONSTANT,
  WIEN_CONSTANT
} from '../shared/constants.js';

/**
 * Creates a Blackbody Radiation Model for a specified absolute temperature.
 * @param {number} temperatureKelvin - Temperature in Kelvin (e.g. 3000 to 10000 K)
 * @returns {object} Blackbody radiation object with spectral calculation methods
 */
export function createBlackbody(temperatureKelvin) {
  const T = Math.max(500, Math.min(20000, Number(temperatureKelvin) || 5800));

  // Peak wavelength by Wien's Displacement Law: λ_max = b / T
  const peakWavelengthMeters = WIEN_CONSTANT / T;
  const peakWavelengthNm = peakWavelengthMeters * 1e9;

  return {
    temperature: T,
    peakWavelengthMeters,
    peakWavelengthNm,

    /**
     * Spectral radiance using Planck's Radiation Law:
     * I(λ, T) = (2 * π * h * c²) / (λ⁵ * (exp(h*c / (λ*k_B*T)) - 1))
     * @param {number} wavelengthMeters - Wavelength in meters
     * @returns {number} Spectral radiance (W·m⁻³·sr⁻¹)
     */
    evaluatePlanckRadiance(wavelengthMeters) {
      if (wavelengthMeters <= 0) return 0;
      const c = SPEED_OF_LIGHT;
      const h = PLANCK_CONSTANT;
      const kB = BOLTZMANN_CONSTANT;

      const exponent = (h * c) / (wavelengthMeters * kB * T);
      if (exponent > 100) return 0; // Prevent overflow

      const numerator = 2 * Math.PI * h * c * c;
      const denominator = Math.pow(wavelengthMeters, 5) * (Math.exp(exponent) - 1);
      return numerator / denominator;
    },

    /**
     * Classical Rayleigh-Jeans Radiation Law:
     * I_RJ(λ, T) = (2 * π * c * k_B * T) / λ⁴
     * Demonstrates the "Ultraviolet Catastrophe" as λ -> 0
     * @param {number} wavelengthMeters - Wavelength in meters
     * @returns {number} Classical spectral radiance
     */
    evaluateRayleighJeansRadiance(wavelengthMeters) {
      if (wavelengthMeters <= 0) return 0;
      const c = SPEED_OF_LIGHT;
      const kB = BOLTZMANN_CONSTANT;

      const numerator = 2 * Math.PI * c * kB * T;
      const denominator = Math.pow(wavelengthMeters, 4);
      return numerator / denominator;
    },

    /**
     * Determine spectral region of peak emission
     * @returns {'ultraviolet'|'visible'|'infrared'}
     */
    getPeakRegion() {
      if (peakWavelengthNm < 380) return 'ultraviolet';
      if (peakWavelengthNm <= 750) return 'visible';
      return 'infrared';
    }
  };
}

