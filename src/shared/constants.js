/**
 * @file constants.js
 * @description Standard physical constants for Unit 19: Planck's Hypothesis and Bohr's Atomic Theory.
 * Uses officially adopted IPST (สสวท.) high school physics values.
 * Pure constants module - zero DOM/Canvas dependencies.
 */

/** Speed of light in vacuum (m/s) */
export const SPEED_OF_LIGHT = 3.00e8;

/** Planck's constant (J·s) */
export const PLANCK_CONSTANT = 6.626e-34;

/** Reduced Planck constant (hbar = h / (2*pi)) (J·s) */
export const HBAR = PLANCK_CONSTANT / (2 * Math.PI); // ~1.05457e-34 J·s

/** Elementary electric charge (Coulombs) */
export const ELEMENTARY_CHARGE = 1.602e-19;

/** Electron rest mass (kg) */
export const ELECTRON_MASS = 9.109e-31;

/** Coulomb constant (N·m²/C²) */
export const COULOMB_CONSTANT = 8.988e9; // or 9.00e9

/** Rydberg constant for hydrogen (m⁻¹) */
export const RYDBERG_CONSTANT = 1.097e7;

/** First Bohr orbit radius for hydrogen ground state (m) (r1 ≈ 0.529 Å) */
export const BOHR_RADIUS_1 = 5.29e-11;

/** First Bohr orbit electron velocity for hydrogen ground state (m/s) */
export const BOHR_VELOCITY_1 = 2.18e6;

/** Ground state energy of hydrogen in electron-volts (eV) */
export const GROUND_STATE_ENERGY_EV = -13.6;

/** Ground state energy of hydrogen in Joules (J) (-2.176e-18 J) */
export const GROUND_STATE_ENERGY_JOULES = -2.176e-18;

/** Wien's displacement constant (m·K) */
export const WIEN_CONSTANT = 2.898e-3;

/** Boltzmann constant (J/K) */
export const BOLTZMANN_CONSTANT = 1.381e-23;

/** 1 electron-volt in Joules */
export const EV_TO_JOULES = ELEMENTARY_CHARGE; // 1.602e-19 J

/** 1 Joule in electron-volts */
export const JOULES_TO_EV = 1 / ELEMENTARY_CHARGE; // ~6.242e18 eV

