/**
 * @file random.js
 * @description Roll-Number (RNG) & Dynamic Randomization Utilities for Unit 19 Physics Quiz System.
 * Implements Dynamic Parameter Generation combining student Roll Number (R ∈ [1, 40])
 * with non-deterministic random variation and strict safety constraints.
 */

/**
 * Simple Mulberry32 Seeded Random Number Generator
 * @param {number} seed - Integer seed
 * @returns {function(): number} Function returning pseudo-random float in [0, 1)
 */
export function createSeededRNG(seed) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a seeded random integer in range [min, max] inclusive
 * @param {number} rollNumber - Student roll number R (1..40)
 * @param {number} questionIndex - Index/ID of the question
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} [attemptSeed=0] - Session/Attempt seed B
 * @returns {number} Random integer
 */
export function getSeededInt(rollNumber, questionIndex, min, max, attemptSeed = 0) {
  const seed = (rollNumber * 10007 + questionIndex * 9973 + attemptSeed * 1013 + 12345) >>> 0;
  const rng = createSeededRNG(seed);
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Generate a seeded random float in range [min, max] rounded to specified decimal places
 * @param {number} rollNumber - Student roll number R (1..40)
 * @param {number} questionIndex - Index/ID of the question
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} [decimals=2] - Number of decimal places
 * @param {number} [attemptSeed=0] - Session/Attempt seed B
 * @returns {number} Random float
 */
export function getSeededFloat(rollNumber, questionIndex, min, max, decimals = 2, attemptSeed = 0) {
  const seed = (rollNumber * 10007 + questionIndex * 9973 + attemptSeed * 1013 + 54321) >>> 0;
  const rng = createSeededRNG(seed);
  const factor = Math.pow(10, decimals);
  const val = min + rng() * (max - min);
  return Math.round(val * factor) / factor;
}

/**
 * Deterministically pick an element from an array based on seed
 * @template T
 * @param {number} rollNumber
 * @param {number} questionIndex
 * @param {T[]} array
 * @param {number} [attemptSeed=0]
 * @returns {T|null}
 */
export function getSeededChoice(rollNumber, questionIndex, array, attemptSeed = 0) {
  if (!array || array.length === 0) return null;
  const idx = getSeededInt(rollNumber, questionIndex, 0, array.length - 1, attemptSeed);
  return array[idx];
}

/**
 * Deterministically shuffle an array for an exam attempt without mutating the input.
 * @template T
 * @param {number} rollNumber - Student roll number R (1..40)
 * @param {number} questionIndex - Stable question identifier used for the shuffle seed
 * @param {T[]} array - Values to shuffle
 * @param {number} [attemptSeed=0] - Session/Attempt seed B
 * @returns {T[]} Shuffled copy
 */
export function getSeededShuffle(rollNumber, questionIndex, array, attemptSeed = 0) {
  if (!Array.isArray(array)) return [];

  const shuffled = [...array];
  const seed = (rollNumber * 10007 + questionIndex * 9973 + attemptSeed * 1013 + 24680) >>> 0;
  const rng = createSeededRNG(seed);

  for (let idx = shuffled.length - 1; idx > 0; idx--) {
    const swapIdx = Math.floor(rng() * (idx + 1));
    [shuffled[idx], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[idx]];
  }

  return shuffled;
}

/**
 * Dynamic Parameter Generator:
 * Combines Roll Number R (1..40) with non-deterministic random variation (attemptSeed)
 * and applies strict safety constraints to guarantee physically sound parameters.
 * 
 * @param {number} rollNumber - Student roll number R (1..40)
 * @param {number} baseMin - Base minimum value before R scaling
 * @param {number} baseStep - Multiplier for roll number R
 * @param {number} [randomRange=0] - Dynamic non-deterministic variation range
 * @param {{ min?: number, max?: number, decimals?: number }} [safetyBounds] - Strict safety constraints
 * @param {number} [attemptSeed] - Session/Attempt seed B (if omitted, Math.random() is used)
 * @returns {number} Dynamically generated physics parameter
 */
export function getDynamicParam(rollNumber, baseMin, baseStep, randomRange = 0, safetyBounds = {}, attemptSeed = undefined) {
  const R = Math.max(1, Math.min(40, Number(rollNumber) || 1));
  let randFloat = 0;

  if (attemptSeed !== undefined) {
    const seed = (rollNumber * 10007 + attemptSeed * 9973 + 88888) >>> 0;
    const rng = createSeededRNG(seed);
    randFloat = rng();
  } else {
    randFloat = Math.random();
  }

  const randOffset = randomRange > 0 ? (randFloat - 0.5) * 2 * randomRange : 0;
  let val = baseMin + (R * baseStep) + randOffset;

  // Apply Safety Constraints
  if (safetyBounds.min !== undefined && val < safetyBounds.min) {
    val = safetyBounds.min;
  }
  if (safetyBounds.max !== undefined && val > safetyBounds.max) {
    val = safetyBounds.max;
  }

  const decimals = safetyBounds.decimals !== undefined ? safetyBounds.decimals : 2;
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}
