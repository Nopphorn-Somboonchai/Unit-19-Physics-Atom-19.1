/**
 * @file blackbody-plotter.js
 * @description Canvas 2D Plotter for Blackbody Radiation Spectrum & Rayleigh-Jeans Contrast.
 * Conforms to Physics Learning Standard (v1.13.0) & Canvas-Guidelines.md.
 */

export class BlackbodyPlotter {
  /**
   * @param {CanvasRenderer} renderer
   */
  constructor(renderer) {
    this.r = renderer;
    this.ctx = renderer.ctx;
  }

  /**
   * Render Blackbody Spectrum Curve & Comparison
   * @param {object} bb - Blackbody model instance
   * @param {object} options
   * @param {boolean} [options.showRayleighJeans=true] - Display classical UV catastrophe curve
   * @param {boolean} [options.showVisibleBand=true] - Display visible rainbow spectrum highlight
   */
  render(bb, { showRayleighJeans = true, showVisibleBand = true } = {}) {
    const w = this.r.width;
    const h = this.r.height;
    const ctx = this.ctx;

    // Viewport Geometry Bounds
    const isCompact = w < 640;
    const padL = isCompact ? 50 : 65;
    const padR = isCompact ? 25 : 35;
    const padT = isCompact ? 35 : 45;
    const padB = isCompact ? 45 : 55;

    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const originX = padL;
    const originY = padT + plotH;

    // Wavelength Domain: 100 nm to 2400 nm
    const minLambdaNm = 100;
    const maxLambdaNm = 2400;

    // Coordinate mapping functions
    const xForLambda = (nm) => originX + ((nm - minLambdaNm) / (maxLambdaNm - minLambdaNm)) * plotW;

    // Max radiance for normalization
    const peakLambdaM = bb.peakWavelengthMeters;
    const peakRad = bb.evaluatePlanckRadiance(peakLambdaM);
    const maxPlotRad = peakRad * 1.25;

    const yForRad = (rad) => originY - Math.min(plotH, (rad / maxPlotRad) * plotH);

    // 1. Clear background
    this.r.clear('#090D16');

    // 2. Draw Subtle Coordinate Grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    // Wavelength grid lines (every 400 nm)
    for (let nm = 400; nm <= 2000; nm += 400) {
      const gx = xForLambda(nm);
      ctx.beginPath();
      ctx.moveTo(gx, padT);
      ctx.lineTo(gx, originY);
      ctx.stroke();
    }

    // Radiance horizontal grid lines
    for (let frac = 0.25; frac <= 1.0; frac += 0.25) {
      const gy = originY - frac * plotH;
      ctx.beginPath();
      ctx.moveTo(originX, gy);
      ctx.lineTo(originX + plotW, gy);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 3. Visible Spectrum Band Background Highlight (380 - 750 nm)
    if (showVisibleBand) {
      const visX1 = Math.max(originX, xForLambda(380));
      const visX2 = Math.min(originX + plotW, xForLambda(750));
      const visW = visX2 - visX1;

      const rainbowGrad = ctx.createLinearGradient(visX1, 0, visX2, 0);
      rainbowGrad.addColorStop(0.0, 'rgba(139, 92, 246, 0.15)'); // Violet
      rainbowGrad.addColorStop(0.2, 'rgba(59, 130, 246, 0.15)');  // Blue
      rainbowGrad.addColorStop(0.4, 'rgba(16, 185, 129, 0.15)');  // Green
      rainbowGrad.addColorStop(0.7, 'rgba(234, 179, 8, 0.15)');   // Yellow
      rainbowGrad.addColorStop(1.0, 'rgba(239, 68, 68, 0.15)');   // Red

      ctx.fillStyle = rainbowGrad;
      ctx.fillRect(visX1, padT, visW, plotH);

      // Label Visible Band
      this.r.drawLabel('Visible Light (380 - 750 nm)', (visX1 + visX2) / 2, padT + 12, {
        font: '10px Prompt, sans-serif',
        color: '#38bdf8',
        align: 'center',
        bgColor: 'rgba(15, 23, 42, 0.85)',
        padding: 4
      });
    }

    // 4. Classical Rayleigh-Jeans Curve (Ultraviolet Catastrophe)
    if (showRayleighJeans) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();

      let started = false;
      const step = 8;
      for (let px = 0; px <= plotW; px += step) {
        const nm = minLambdaNm + (px / plotW) * (maxLambdaNm - minLambdaNm);
        const rjRad = bb.evaluateRayleighJeansRadiance(nm * 1e-9);
        const cy = yForRad(rjRad);

        if (cy >= padT && cy <= originY) {
          if (!started) {
            ctx.moveTo(originX + px, cy);
            started = true;
          } else {
            ctx.lineTo(originX + px, cy);
          }
        }
      }
      ctx.stroke();
      ctx.restore();

      // Legend note for Rayleigh-Jeans
      this.r.drawLabel('ทฤษฎีดั้งเดิม (Rayleigh-Jeans) ⚠️ หายนะ UV', originX + plotW - 10, padT + 14, {
        font: '11px Prompt, sans-serif',
        color: '#f87171',
        align: 'right',
        bgColor: 'rgba(30, 10, 10, 0.75)'
      });
    }

    // 5. Planck Quantum Radiation Curve (Solid with Gradient Fill)
    const curveGrad = ctx.createLinearGradient(0, padT, 0, originY);
    curveGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    curveGrad.addColorStop(1, 'rgba(6, 182, 212, 0.02)');

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(originX, originY);

    const stepNm = 6;
    for (let nm = minLambdaNm; nm <= maxLambdaNm; nm += stepNm) {
      const rad = bb.evaluatePlanckRadiance(nm * 1e-9);
      const cx = xForLambda(nm);
      const cy = yForRad(rad);
      ctx.lineTo(cx, cy);
    }
    ctx.lineTo(originX + plotW, originY);
    ctx.closePath();
    ctx.fillStyle = curveGrad;
    ctx.fill();

    // Outline Curve
    ctx.beginPath();
    for (let nm = minLambdaNm; nm <= maxLambdaNm; nm += stepNm) {
      const rad = bb.evaluatePlanckRadiance(nm * 1e-9);
      const cx = xForLambda(nm);
      const cy = yForRad(rad);
      if (nm === minLambdaNm) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // 6. Wien's Peak Wavelength Marker Line
    const peakX = xForLambda(bb.peakWavelengthNm);
    const peakY = yForRad(peakRad);

    if (peakX >= originX && peakX <= originX + plotW) {
      // Dotted Vertical Line
      this.r.drawLine(peakX, peakY, peakX, originY, '#fbbf24', 1.5, [3, 3]);

      // Peak Indicator Point with Glow
      ctx.save();
      ctx.beginPath();
      ctx.arc(peakX, peakY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

      // Peak Label Badge
      const peakText = `λ_max = ${bb.peakWavelengthNm.toFixed(0)} nm`;
      const badgeY = Math.max(padT + 25, peakY - 14);
      this.r.drawLabel(peakText, peakX, badgeY, {
        font: 'bold 11px Fira Code, monospace',
        color: '#fef08a',
        align: 'center',
        bgColor: '#78350f',
        padding: 5
      });
    }

    // 7. Coordinate Axes (X: Wavelength, Y: Spectral Radiance)
    this.r.drawArrow(originX, originY, originX + plotW + 15, originY, '#94a3b8', 1.5, 6);
    this.r.drawArrow(originX, originY, originX, padT - 10, '#94a3b8', 1.5, 6);

    // X-Axis Labels (Wavelength in nm)
    for (let nm = 400; nm <= 2000; nm += 400) {
      const tx = xForLambda(nm);
      this.r.drawLine(tx, originY, tx, originY + 5, '#94a3b8', 1);
      this.r.drawLabel(`${nm}`, tx, originY + 16, {
        font: '10px Fira Code, monospace',
        color: '#94a3b8',
        align: 'center'
      });
    }

    // Axis Titles
    this.r.drawLabel('ความยาวคลื่น λ (nm)', originX + plotW / 2, originY + 34, {
      font: 'bold 12px Prompt, sans-serif',
      color: '#cbd5e1'
    });

    this.r.drawLabel('ความเข้มการแผ่รังสี I(λ)', originX - 5, padT - 18, {
      font: 'bold 11px Prompt, sans-serif',
      color: '#cbd5e1',
      align: 'left'
    });

    // 8. Info Overlay Pill (Top Left)
    const tempPill = `T = ${bb.temperature.toLocaleString()} K  |  ${bb.getPeakRegion().toUpperCase()}`;
    this.r.drawLabel(tempPill, originX + 15, padT + 12, {
      font: 'bold 12px Prompt, sans-serif',
      color: '#38bdf8',
      align: 'left',
      bgColor: 'rgba(15, 23, 42, 0.9)',
      padding: 6
    });
  }
}

