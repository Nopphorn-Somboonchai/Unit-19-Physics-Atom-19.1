/**
 * @file bohr-orbit-plotter.js
 * @description Canvas 2D Plotter for Bohr Hydrogen Atom Orbits & Electron Dynamics.
 * Conforms to Physics Learning Standard (v1.13.0) & Canvas-Guidelines.md.
 */

import { formatScientific, formatEnergyEV } from '../../utils/format.js';

export class BohrOrbitPlotter {
  /**
   * @param {CanvasRenderer} renderer
   */
  constructor(renderer) {
    this.r = renderer;
    this.ctx = renderer.ctx;
  }

  /**
   * Render Bohr Hydrogen Atom with concentric orbits and animated electron
   * @param {object} orbitModel - Orbit state from createBohrOrbit(n)
   * @param {number} angleRad - Current angular position of electron in radians
   * @param {object} [options]
   * @param {number} [options.maxOrbits=5] - Number of circular orbits to display
   * @param {boolean} [options.showVectors=true] - Display velocity and radius vectors
   */
  render(orbitModel, angleRad = 0, { maxOrbits = 5, showVectors = true } = {}) {
    const w = this.r.width;
    const h = this.r.height;
    const ctx = this.ctx;

    this.r.clear('#090D16');

    const centerX = w / 2;
    const centerY = h / 2 + 10;
    const isCompact = w < 640;

    // Radius scaling: Visual radius designed to scale gracefully across screens
    const maxScreenRadius = Math.min(centerX - (isCompact ? 35 : 60), centerY - (isCompact ? 45 : 55));
    // Scale function mapping n=1..maxOrbits to pixel radius
    const getPixelRadius = (lvl) => {
      // Visual power 1.3 provides clear separation between n=1 and n=5 without clipping
      const baseR = maxScreenRadius / Math.pow(maxOrbits, 1.35);
      return baseR * Math.pow(lvl, 1.35);
    };

    // 1. Draw Concentric Orbits (n = 1 to maxOrbits)
    for (let lvl = 1; lvl <= maxOrbits; lvl++) {
      const pR = getPixelRadius(lvl);
      const isCurrent = lvl === orbitModel.n;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, pR, 0, Math.PI * 2);

      if (isCurrent) {
        // Highlighted Active Orbit
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Secondary subtle glow
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 6;
        ctx.stroke();
      } else {
        // Inactive Orbit
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
      }
      ctx.restore();

      // Label Orbit Number (n = 1, 2, ...) on Right Axis
      const labelX = centerX + pR + 4;
      const labelY = centerY;
      this.r.drawLabel(`n=${lvl}`, labelX, labelY, {
        font: isCurrent ? 'bold 11px Fira Code, monospace' : '10px Fira Code, monospace',
        color: isCurrent ? '#22d3ee' : '#64748b',
        align: 'left',
        bgColor: isCurrent ? 'rgba(8, 47, 73, 0.85)' : null,
        padding: 2
      });
    }

    // 2. Draw Central Nucleus (Proton: +e)
    const nucleusRadius = isCompact ? 14 : 18;
    const nucGrad = ctx.createRadialGradient(centerX - 3, centerY - 3, 2, centerX, centerY, nucleusRadius);
    nucGrad.addColorStop(0, '#fef08a');
    nucGrad.addColorStop(0.5, '#f59e0b');
    nucGrad.addColorStop(1, '#b45309');

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, nucleusRadius, 0, Math.PI * 2);
    ctx.fillStyle = nucGrad;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.restore();

    this.r.drawLabel('+e (p)', centerX, centerY, {
      font: 'bold 10px Prompt, sans-serif',
      color: '#0f172a',
      align: 'center'
    });

    // 3. Electron Position & Orbital Motion
    const activeRadiusPx = getPixelRadius(orbitModel.n);
    const electronX = centerX + activeRadiusPx * Math.cos(angleRad);
    const electronY = centerY + activeRadiusPx * Math.sin(angleRad);

    // Radius Vector Line (Nucleus to Electron)
    if (showVectors) {
      this.r.drawLine(centerX, centerY, electronX, electronY, 'rgba(6, 182, 212, 0.45)', 1.5, [3, 3]);

      // Velocity Vector (Tangent: angle + PI/2)
      const tangentAngle = angleRad + Math.PI / 2;
      const vLen = isCompact ? 28 : 38;
      const vx = electronX + vLen * Math.cos(tangentAngle);
      const vy = electronY + vLen * Math.sin(tangentAngle);
      this.r.drawArrow(electronX, electronY, vx, vy, '#10b981', 2, 7);

      this.r.drawLabel('v_n', vx + 5, vy, {
        font: 'bold 11px Fira Code, monospace',
        color: '#4ade80',
        align: 'left'
      });
    }

    // Electron Trail Glow
    for (let t = 1; t <= 5; t++) {
      const trailAngle = angleRad - t * 0.08;
      const tx = centerX + activeRadiusPx * Math.cos(trailAngle);
      const ty = centerY + activeRadiusPx * Math.sin(trailAngle);
      ctx.save();
      ctx.beginPath();
      ctx.arc(tx, ty, Math.max(2, 6 - t), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(56, 189, 248, ${0.4 - t * 0.07})`;
      ctx.fill();
      ctx.restore();
    }

    // Electron Glowing Sphere
    const electronRadius = isCompact ? 6 : 8;
    ctx.save();
    ctx.beginPath();
    ctx.arc(electronX, electronY, electronRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.restore();

    this.r.drawLabel('e⁻', electronX, electronY - (isCompact ? 12 : 15), {
      font: 'bold 11px Prompt, sans-serif',
      color: '#e0f2fe',
      align: 'center'
    });

    // 4. Live HUD Overlay Panels (Bilingual Physics Values)
    const hudX = 16;
    const hudY = 18;

    this.r.drawStackedLabel([
      `ระดับวงโคจร: n = ${orbitModel.n} (${orbitModel.stateLabelTh.split(' ')[0]})`,
      `รัศมี: r_${orbitModel.n} = ${orbitModel.radiusAngstroms.toFixed(3)} Å (${formatScientific(orbitModel.radiusMeters)} m)`,
      `อัตราเร็ว: v_${orbitModel.n} = ${formatScientific(orbitModel.velocityMps)} m/s`,
      `พลังงานรวม: E_${orbitModel.n} = ${formatEnergyEV(orbitModel.totalEnergyEV)}`,
      `โมเมนตัมเชิงมุม: L = ${orbitModel.n}ħ = ${formatScientific(orbitModel.angularMomentum)} J·s`
    ], hudX, hudY + 35, {
      font: '11px Fira Code, monospace',
      color: '#f8fafc',
      align: 'left',
      lineHeight: 18,
      bgColor: 'rgba(15, 23, 42, 0.88)',
      padding: 8
    });
  }
}

