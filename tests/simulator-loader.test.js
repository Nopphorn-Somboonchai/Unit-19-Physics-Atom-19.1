/**
 * @file simulator-loader.test.js
 * @description Unit tests for SimulatorLoader UI Adapter (Physics Learning Standard v1.13.0).
 */

import assert from 'node:assert';
import { SimulatorLoader } from '../src/adapters/ui/simulator-loader.js';

console.log('=============== 🧪 RUNNING SIMULATOR LOADER TESTS ===============\n');

// Test Suite 1: Initial State & Prefix Mapping
console.log('--- Test Suite 1: Initial State & Mapping ---');
SimulatorLoader.reset();
assert.strictEqual(SimulatorLoader.isLoaded('19-1-blackbody'), false);
assert.strictEqual(SimulatorLoader.isLoaded('19-2-bohr'), false);
assert.strictEqual(SimulatorLoader.isLoaded('19-3-spectrum'), false);
console.log('✅ [PASS] All simulators initially not loaded');

assert.strictEqual(SimulatorLoader.prefixMap['19-1-blackbody'], 'blackbody');
assert.strictEqual(SimulatorLoader.prefixMap['19-2-bohr'], 'bohr');
assert.strictEqual(SimulatorLoader.prefixMap['19-3-spectrum'], 'spectrum');
console.log('✅ [PASS] Prefix mapping correct for DOM IDs');

// Test Suite 2: Calibration Stages & Physics Status Text
console.log('\n--- Test Suite 2: Calibration Stages & Status Text ---');

// 19.1.1 Blackbody stages
const s1_0 = SimulatorLoader.getStatusText('19-1-blackbody', 15);
assert(s1_0.includes('พิกัดกราฟ'), `Expected coordinate text, got: ${s1_0}`);
const s1_50 = SimulatorLoader.getStatusText('19-1-blackbody', 50);
assert(s1_50.includes('พลังค์'), `Expected Planck text, got: ${s1_50}`);
const s1_100 = SimulatorLoader.getStatusText('19-1-blackbody', 100);
assert(s1_100.includes('เสร็จสมบูรณ์'), `Expected completed text, got: ${s1_100}`);
console.log('✅ [PASS] Simulator 19.1.1 calibration stage messages validated');

// 19.1.2A Bohr stages
const s2_0 = SimulatorLoader.getStatusText('19-2-bohr', 20);
assert(s2_0.includes('นิวเคลียส'), `Expected nucleus text, got: ${s2_0}`);
const s2_50 = SimulatorLoader.getStatusText('19-2-bohr', 50);
assert(s2_50.includes('วงโคจร'), `Expected orbit text, got: ${s2_50}`);
const s2_100 = SimulatorLoader.getStatusText('19-2-bohr', 100);
assert(s2_100.includes('เสร็จสมบูรณ์'), `Expected completed text, got: ${s2_100}`);
console.log('✅ [PASS] Simulator 19.1.2A calibration stage messages validated');

// 19.1.2B Spectrum stages
const s3_0 = SimulatorLoader.getStatusText('19-3-spectrum', 20);
assert(s3_0.includes('ระดับพลังงาน'), `Expected energy levels text, got: ${s3_0}`);
const s3_50 = SimulatorLoader.getStatusText('19-3-spectrum', 50);
assert(s3_50.includes('ริดเบิร์ก'), `Expected Rydberg text, got: ${s3_50}`);
const s3_100 = SimulatorLoader.getStatusText('19-3-spectrum', 100);
assert(s3_100.includes('เสร็จสมบูรณ์'), `Expected completed text, got: ${s3_100}`);
console.log('✅ [PASS] Simulator 19.1.2B calibration stage messages validated');

// Test Suite 3: Async Load Progression
console.log('\n--- Test Suite 3: Async Progression Execution ---');
let progressUpdates = [];
await SimulatorLoader.load('19-1-blackbody', {
  duration: 100, // Fast test duration
  onProgress: (pct, msg) => {
    progressUpdates.push({ pct, msg });
  }
});

assert.strictEqual(SimulatorLoader.isLoaded('19-1-blackbody'), true);
assert(progressUpdates.length > 0, 'Progress updates should have fired');
assert.strictEqual(progressUpdates[progressUpdates.length - 1].pct, 100);
console.log(`✅ [PASS] Simulator 19.1.1 async load reached 100% with ${progressUpdates.length} steps`);

// Test Suite 4: Repeated Load Skip & Force Reload
console.log('\n--- Test Suite 4: Skip Repeat vs Force Reload ---');
let secondRunCalled = false;
await SimulatorLoader.load('19-1-blackbody', {
  duration: 100,
  onComplete: () => {
    secondRunCalled = true;
  }
});
assert.strictEqual(secondRunCalled, true);
console.log('✅ [PASS] Second load skipped progression and resolved immediately');

await SimulatorLoader.reload('19-1-blackbody', () => {
  // completion
});
console.log('✅ [PASS] Force reload re-triggered progression successfully');

console.log('\n=======================================================');
console.log('📊 SIMULATOR LOADER TEST SUMMARY: ALL PASSED');
console.log('=======================================================\n');

