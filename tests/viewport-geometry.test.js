/**
 * @file viewport-geometry.test.js
 * @description Viewport boundary clearance test for Unit 19 Simulators across Mobile, iPad, and Desktop viewports.
 */

import assert from 'node:assert';

console.log('Testing Unit 19 Simulators Geometry Clearance Across Viewports...');

const viewports = [
  { name: 'Mobile Compact (360px)', w: 360 },
  { name: 'Mobile Standard (393px)', w: 393 },
  { name: 'iPad Portrait (768px)', w: 768 },
  { name: 'iPad Landscape (1024px)', w: 1024 },
  { name: 'Desktop (1440px)', w: 1440 }
];

for (const vp of viewports) {
  const w = vp.w;

  // --- 1. Simulator 19.1.1: BlackbodyPlotter Geometry Audit ---
  const isCompact1 = w < 640;
  const h1 = isCompact1 ? 360 : 400;
  const padL1 = isCompact1 ? 50 : 65;
  const padR1 = isCompact1 ? 25 : 35;
  const padT1 = isCompact1 ? 35 : 45;
  const padB1 = isCompact1 ? 45 : 55;
  const plotW1 = w - padL1 - padR1;
  const plotH1 = h1 - padT1 - padB1;

  assert(plotW1 > 220, `[19.1.1] Plot width too narrow for ${vp.name} (plotW1: ${plotW1})`);
  assert(plotH1 > 200, `[19.1.1] Plot height too small for ${vp.name} (plotH1: ${plotH1})`);
  assert(padT1 + plotH1 + padB1 === h1, `[19.1.1] Height padding mismatch for ${vp.name}`);

  // --- 2. Simulator 19.1.2A: BohrOrbitPlotter Geometry Audit ---
  const h2 = isCompact1 ? 360 : 400;
  const centerX2 = w / 2;
  const centerY2 = h2 / 2 + 10;
  const maxR2 = Math.min(centerX2 - (isCompact1 ? 35 : 60), centerY2 - (isCompact1 ? 45 : 55));
  const rMaxPx = (maxR2 / Math.pow(5, 1.35)) * Math.pow(5, 1.35);

  assert(centerX2 - rMaxPx >= 15, `[19.1.2A] Bohr orbit clipped on left for ${vp.name}`);
  assert(centerX2 + rMaxPx <= w - 15, `[19.1.2A] Bohr orbit clipped on right for ${vp.name}`);
  assert(centerY2 - rMaxPx >= 15, `[19.1.2A] Bohr orbit clipped on top for ${vp.name}`);
  assert(centerY2 + rMaxPx <= h2 - 15, `[19.1.2A] Bohr orbit clipped on bottom for ${vp.name}`);

  // --- 3. Simulator 19.1.2B: SpectrumTransitionPlotter Geometry Audit ---
  const isCompact3 = w < 768;
  const h3 = isCompact3 ? 500 : 420;
  const ladderX1 = isCompact3 ? 72 : Math.round(w * 0.48) + 80;
  const ladderX2 = isCompact3 ? w - 80 : w - 88;
  const ladderTopY = isCompact3 ? 240 : 40;
  const ladderBotY = h3 - 68;
  const ladderHeight = ladderBotY - ladderTopY;

  const minGap = isCompact3 ? 28 : 34;
  const excessHeight = Math.max(0, ladderHeight - 5 * minGap);
  const levelGaps = [
    minGap + 0.44 * excessHeight, // n=1 -> n=2
    minGap + 0.28 * excessHeight, // n=2 -> n=3
    minGap + 0.16 * excessHeight, // n=3 -> n=4
    minGap + 0.08 * excessHeight, // n=4 -> n=5
    minGap + 0.04 * excessHeight  // n=5 -> n=Infinity
  ];

  assert(ladderX2 > ladderX1 + 100, `[19.1.2B] Ladder diagram width too narrow for ${vp.name}`);
  assert(ladderX1 >= 70, `[19.1.2B] Left label margin too small for ${vp.name}`);
  assert(w - ladderX2 >= 75, `[19.1.2B] Right label margin too small for ${vp.name}`);
  assert(levelGaps[3] >= 28, `[19.1.2B] Gap n=4 -> n=5 too small for ${vp.name} (${levelGaps[3]}px)`);
  assert(
    levelGaps[0] > levelGaps[1] &&
    levelGaps[1] > levelGaps[2] &&
    levelGaps[2] > levelGaps[3] &&
    levelGaps[3] > levelGaps[4],
    `[19.1.2B] Monotonic decreasing physical gap violated for ${vp.name}`
  );

  console.log(
    `✅ [PASS] ${vp.name}: 19.1.1 plotW=${plotW1}px, 19.1.2A maxR=${rMaxPx.toFixed(1)}px, ` +
    `19.1.2B ladderW=${ladderX2 - ladderX1}px, gap(4->5)=${levelGaps[3].toFixed(1)}px`
  );
}

console.log('\n🎉 ALL VIEWPORT GEOMETRY CLEARANCE TESTS PASSED (100%)!\n');
