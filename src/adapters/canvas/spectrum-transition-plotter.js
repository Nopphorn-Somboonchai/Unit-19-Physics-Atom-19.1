/**
 * @file spectrum-transition-plotter.js
 * @description Canvas 2D Plotter for Hydrogen Spectral Transitions & Energy Ladder Diagram.
 * Conforms to Physics Learning Standard (v1.13.0) & Canvas-Guidelines.md.
 */

import { formatScientific, formatEnergyEV } from '../../utils/format.js';
import { BALMER_LINES } from '../../physics/hydrogen-spectrum-model.js';

export class SpectrumTransitionPlotter {
  /**
   * @param {CanvasRenderer} renderer
   */
  constructor(renderer) {
    this.r = renderer;
    this.ctx = renderer.ctx;
  }

  /**
   * Render Hydrogen Transition and Dual Energy Diagram
   * @param {object} transition - Details from getTransitionDetails(ni, nf)
   * @param {number} animProgress - Animation progress from 0.0 to 1.0
   */
  render(transition, animProgress = 1.0) {
    const w = this.r.width;
    const h = this.r.height;
    const ctx = this.ctx;

    this.r.clear('#090D16');

    const isCompact = w < 768;
    const leftWidth = isCompact ? w : Math.round(w * 0.48);
    const rightLeft = isCompact ? 0 : leftWidth;
    const rightWidth = isCompact ? w : w - leftWidth;

    // Split View Layout
    if (!isCompact) {
      // Dividing vertical dashed line
      this.r.drawLine(leftWidth, 20, leftWidth, h - 20, 'rgba(148, 163, 184, 0.15)', 1, [4, 4]);
    } else {
      // Horizontal subtle dividing line between Bohr Atom & Energy Ladder on compact screens
      this.r.drawLine(20, 215, w - 20, 215, 'rgba(148, 163, 184, 0.15)', 1, [4, 4]);
    }

    // =========================================================================
    // SECTION A: BOHR JUMP & EMITTED PHOTON ANIMATION (LEFT / TOP PANEL)
    // =========================================================================
    const atomCenterX = isCompact ? w * 0.5 : leftWidth * 0.5;
    const atomCenterY = isCompact ? 116 : Math.round(h * 0.48);
    const maxAtomR = isCompact
      ? Math.min(atomCenterX - 35, 78)
      : Math.min(atomCenterX - 35, atomCenterY - 45);

    const maxOrbitLevel = Math.max(5, transition.ni);
    const getR = (lvl) => (maxAtomR / Math.pow(maxOrbitLevel, 1.25)) * Math.pow(lvl, 1.25);

    // Draw orbits 1..maxOrbitLevel
    for (let lvl = 1; lvl <= maxOrbitLevel; lvl++) {
      const orR = getR(lvl);
      const isTarget = lvl === transition.nf;
      const isSource = lvl === transition.ni;

      ctx.save();
      ctx.beginPath();
      ctx.arc(atomCenterX, atomCenterY, orR, 0, Math.PI * 2);
      ctx.strokeStyle = isTarget
        ? '#10b981'
        : isSource
        ? '#f43f5e'
        : 'rgba(148, 163, 184, 0.22)';
      ctx.lineWidth = isTarget || isSource ? 2.5 : 1;
      if (!isTarget && !isSource) ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();

      // Orbit label n=1..maxOrbitLevel with enhanced readability
      this.r.drawLabel(`n=${lvl}`, atomCenterX + orR + 5, atomCenterY, {
        font: isTarget || isSource ? 'bold 12px Fira Code, monospace' : '11px Fira Code, monospace',
        color: isTarget ? '#34d399' : isSource ? '#f87171' : '#64748b',
        align: 'left'
      });
    }

    // Draw Nucleus (Proton: +e)
    ctx.save();
    ctx.beginPath();
    ctx.arc(atomCenterX, atomCenterY, isCompact ? 7 : 9, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();

    // Calculate Interpolated Electron Position during transition
    const rStart = getR(transition.ni);
    const rEnd = getR(transition.nf);
    const curR = rStart + (rEnd - rStart) * animProgress;
    const jumpAngle = -Math.PI / 4; // 45 deg upper-right
    const elX = atomCenterX + curR * Math.cos(jumpAngle);
    const elY = atomCenterY + curR * Math.sin(jumpAngle);

    // Draw Transition Path Arrow
    this.r.drawArrow(
      atomCenterX + rStart * Math.cos(jumpAngle),
      atomCenterY + rStart * Math.sin(jumpAngle),
      atomCenterX + rEnd * Math.cos(jumpAngle),
      atomCenterY + rEnd * Math.sin(jumpAngle),
      transition.colorHex,
      2.5,
      7
    );

    // Draw Moving Electron
    ctx.save();
    ctx.beginPath();
    ctx.arc(elX, elY, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.restore();

    // Emitted Photon Wave Pulse (moves outward towards bottom-right)
    if (transition.isEmission && animProgress > 0.35) {
      const photonDist = (animProgress - 0.35) * 1.54 * (maxAtomR + 35);
      const photonAngle = Math.PI / 3;
      const phX = atomCenterX + (rEnd + photonDist) * Math.cos(photonAngle);
      const phY = atomCenterY + (rEnd + photonDist) * Math.sin(photonAngle);

      // Glowing photon packet
      ctx.save();
      ctx.beginPath();
      ctx.arc(phX, phY, 7.5, 0, Math.PI * 2);
      ctx.fillStyle = transition.colorHex;
      ctx.shadowColor = transition.colorHex;
      ctx.shadowBlur = 18;
      ctx.fill();
      ctx.restore();

      const labelMaxX = (isCompact ? w : leftWidth) - 130;
      const phLabelX = Math.min(phX + 12, labelMaxX);

      this.r.drawLabel(`โฟตอน: ${transition.wavelengthNm.toFixed(1)} nm`, phLabelX, phY, {
        font: 'bold 12px Prompt, sans-serif',
        color: transition.colorHex,
        align: 'left',
        bgColor: 'rgba(15, 23, 42, 0.92)',
        padding: 4
      });
    }

    // Left Title
    this.r.drawLabel(
      `การเปลี่ยนวงโคจร: n = ${transition.ni} → n = ${transition.nf}`,
      atomCenterX,
      isCompact ? 20 : 25,
      {
        font: 'bold 14px Prompt, sans-serif',
        color: '#f8fafc',
        align: 'center'
      }
    );

    // =========================================================================
    // SECTION B: ENERGY LEVEL LADDER DIAGRAM (RIGHT / BOTTOM PANEL)
    // =========================================================================
    // Margins calibrated to completely avoid any text clipping and dividing line collisions
    const ladderX1 = isCompact ? 72 : rightLeft + 80;
    const ladderX2 = isCompact ? w - 80 : w - 88;
    const ladderTopY = isCompact ? 240 : 40;
    const ladderBotY = h - 68;
    const ladderHeight = ladderBotY - ladderTopY;

    // Perceptually-calibrated strictly-decreasing energy spacing (Physics Standard)
    // Guarantees dY(1->2) > dY(2->3) > dY(3->4) > ... with strictly decreasing gaps
    const maxLadderLevel = Math.max(5, transition.ni);
    let levelGaps;

    if (maxLadderLevel === 5) {
      const minGap = isCompact ? 28 : 34;
      const excessHeight = Math.max(0, ladderHeight - 5 * minGap);
      levelGaps = [
        minGap + 0.44 * excessHeight, // n=1 -> n=2
        minGap + 0.28 * excessHeight, // n=2 -> n=3
        minGap + 0.16 * excessHeight, // n=3 -> n=4
        minGap + 0.08 * excessHeight, // n=4 -> n=5
        minGap + 0.04 * excessHeight  // n=5 -> n=Infinity
      ];
    } else if (maxLadderLevel === 6) {
      const minGap = isCompact ? 22 : 28;
      const excessHeight = Math.max(0, ladderHeight - 6 * minGap);
      levelGaps = [
        minGap + 0.36 * excessHeight, // n=1 -> n=2
        minGap + 0.24 * excessHeight, // n=2 -> n=3
        minGap + 0.16 * excessHeight, // n=3 -> n=4
        minGap + 0.11 * excessHeight, // n=4 -> n=5
        minGap + 0.08 * excessHeight, // n=5 -> n=6
        minGap + 0.05 * excessHeight  // n=6 -> n=Infinity
      ];
    } else {
      const minGap = isCompact ? 19 : 24;
      const excessHeight = Math.max(0, ladderHeight - 7 * minGap);
      levelGaps = [
        minGap + 0.32 * excessHeight, // n=1 -> n=2
        minGap + 0.22 * excessHeight, // n=2 -> n=3
        minGap + 0.16 * excessHeight, // n=3 -> n=4
        minGap + 0.11 * excessHeight, // n=4 -> n=5
        minGap + 0.08 * excessHeight, // n=5 -> n=6
        minGap + 0.06 * excessHeight, // n=6 -> n=7
        minGap + 0.05 * excessHeight  // n=7 -> n=Infinity
      ];
    }

    const levelYMap = { 1: ladderBotY };
    let accumY = ladderBotY;
    for (let i = 0; i < levelGaps.length; i++) {
      accumY -= levelGaps[i];
      const lvlKey = i === levelGaps.length - 1 ? Infinity : (i + 2);
      levelYMap[lvlKey] = accumY;
    }

    const getEnergyY = (lvl) => levelYMap[lvl] ?? ladderTopY;

    // Draw Energy Level Bars (n = 1..maxLadderLevel)
    const levelsToDraw = [];
    for (let l = 1; l <= maxLadderLevel; l++) {
      levelsToDraw.push(l);
    }

    const labelFont = (maxLadderLevel >= 6 && isCompact)
      ? 'bold 11px Fira Code, monospace'
      : 'bold 13px Fira Code, monospace';

    for (const lvl of levelsToDraw) {
      const ly = getEnergyY(lvl);
      const isTarget = lvl === transition.nf;
      const isSource = lvl === transition.ni;

      this.r.drawLine(
        ladderX1,
        ly,
        ladderX2,
        ly,
        isTarget ? '#10b981' : isSource ? '#f43f5e' : 'rgba(148, 163, 184, 0.4)',
        isTarget || isSource ? 2.5 : 1
      );

      // Energy Label on Left (En = -13.6 / n^2 eV)
      const evVal = (-13.6 / (lvl * lvl)).toFixed(2);
      this.r.drawLabel(`${evVal} eV`, ladderX1 - 8, ly, {
        font: labelFont,
        color: isTarget ? '#34d399' : isSource ? '#f87171' : '#cbd5e1',
        align: 'right'
      });

      // Quantum Number on Right (n = 1..maxLadderLevel)
      this.r.drawLabel(`n = ${lvl}`, ladderX2 + 8, ly, {
        font: labelFont,
        color: isTarget ? '#34d399' : isSource ? '#f87171' : '#cbd5e1',
        align: 'left'
      });
    }

    // Top Ionization line n = infinity (0.00 eV)
    const infY = getEnergyY(Infinity);
    this.r.drawLine(ladderX1, infY, ladderX2, infY, '#64748b', 1.2, [4, 4]);
    this.r.drawLabel('0.00 eV', ladderX1 - 8, infY, {
      font: 'bold 13px Fira Code, monospace',
      color: '#94a3b8',
      align: 'right'
    });
    this.r.drawLabel('n = ∞', ladderX2 + 8, infY, {
      font: 'bold 13px Fira Code, monospace',
      color: '#94a3b8',
      align: 'left'
    });

    // Draw Transition Arrow on Ladder
    const arrowX = Math.round((ladderX1 + ladderX2) * 0.42);
    const yStart = getEnergyY(transition.ni);
    const yEnd = getEnergyY(transition.nf);
    this.r.drawArrow(arrowX, yStart, arrowX, yEnd, transition.colorHex, 3.5, 9);

    // Stacked Delta E & Lambda Callout Card (offset to right of arrow, non-colliding)
    const midY = (yStart + yEnd) / 2;
    const badgeX = arrowX + 16;
    const badgePad = 5;
    const badgeW = 148;
    const badgeH = 42;
    const badgeY = Math.max(ladderTopY + 4, Math.min(ladderBotY - badgeH - 4, midY - badgeH / 2));

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = transition.colorHex;
    ctx.lineWidth = 1.2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
    ctx.restore();

    this.r.drawLabel(`ΔE = ${transition.deltaEEV.toFixed(2)} eV`, badgeX + 8, badgeY + 12, {
      font: 'bold 12px Fira Code, monospace',
      color: transition.colorHex,
      align: 'left'
    });

    this.r.drawLabel(`λ = ${transition.wavelengthNm.toFixed(1)} nm`, badgeX + 8, badgeY + 28, {
      font: 'bold 12px Fira Code, monospace',
      color: '#f8fafc',
      align: 'left'
    });

    // =========================================================================
    // SECTION C: SPECTRAL LINE STRIP (BOTTOM FOOTER)
    // =========================================================================
    const barY = h - 28;
    const barH = 14;
    const barX = 25;
    const barW = w - 50;

    // Background spectrum line container
    ctx.fillStyle = '#020617';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Series name & region badge
    const seriesBadge = `${transition.series ? transition.series.nameTh : 'สเปกตรัม'}: ${transition.series ? transition.series.emRegionTh : ''}`;
    this.r.drawLabel(seriesBadge, w / 2, barY - 10, {
      font: 'bold 13px Prompt, sans-serif',
      color: transition.colorHex,
      align: 'center'
    });

    // Draw active spectral line indicator on bar
    const indicatorX = barX + barW * (animProgress * 0.5 + 0.25);
    ctx.save();
    ctx.fillStyle = transition.colorHex;
    ctx.shadowColor = transition.colorHex;
    ctx.shadowBlur = 12;
    ctx.fillRect(indicatorX - 3, barY, 6, barH);
    ctx.restore();
  }
}
