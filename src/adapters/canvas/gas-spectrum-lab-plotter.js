/**
 * @file gas-spectrum-lab-plotter.js
 * @description Canvas 2D Plotter for Activity 19.1: Hot Gas Spectrum Virtual Lab.
 * Renders:
 *   1. Realistic 3D Perspective Lab Bench Setup (Spectrum Power Supply, Gas Tube,
 *      Black Cardboard Screen, Meter Stick on Support Blocks, Grating, Observer Eye)
 *   2. Top-Down Optical Ray Geometry Diagram (D, x, theta, Left/Right spectral positions)
 *   3. Interactive First-Person Eye-Through-Grating View with 0-100 cm Meter Stick,
 *      Live Crosshair, Measurement Pins, and 3x Scale Magnifier Loupe.
 * Conforms to Physics Learning Standard (v1.13.0) & Canvas-Guidelines.md.
 */

export class GasSpectrumLabPlotter {
  /**
   * @param {import('./canvas-renderer.js').CanvasRenderer} renderer
   */
  constructor(renderer) {
    this.r = renderer;
    this.ctx = renderer.ctx;

    /**
     * Interactive meter-stick bounding box in CSS pixels (updated every render)
     * so the orchestrator can map pointer events accurately to 0..100 cm.
     */
    this.eyepieceMeterRect = null;
  }

  /**
   * Main render entry point
   * @param {object} labProjection - Output from computeLabSpectrumState()
   * @param {object} uiState - View & interaction state from GasSpectrumLabSimulator
   */
  render(labProjection, uiState) {
    const w = this.r.width;
    const h = this.r.height;
    const viewMode = uiState.viewMode || 'split';

    this.r.clear('#070b14');
    this.eyepieceMeterRect = null;

    const isCompact = w < 720;

    if (viewMode === 'setup') {
      this._renderSetupComposite(0, 0, w, h, labProjection, uiState, isCompact);
    } else if (viewMode === 'eyepiece') {
      this._renderEyepieceView(0, 0, w, h, labProjection, uiState, false);
    } else {
      // 'split' mode: Top = 3D Setup + Top-Down Diagram, Bottom = Interactive Eyepiece Measurement
      const setupH = Math.round(h * (isCompact ? 0.52 : 0.56));
      const eyeH = h - setupH;
      this._renderSetupComposite(0, 0, w, setupH, labProjection, uiState, isCompact);

      // Divider bar between Setup & Eyepiece
      this.r.drawLine(0, setupH, w, setupH, 'rgba(56, 189, 248, 0.35)', 1.5);

      this._renderEyepieceView(0, setupH, w, eyeH, labProjection, uiState, true);
    }
  }

  /**
   * Render Side-by-Side 3D Perspective Bench (Left) + Top-Down Ray Diagram (Right)
   */
  _renderSetupComposite(x, y, w, h, proj, ui, isCompact) {
    if (isCompact) {
      // On narrow mobile screens, give 58% left to 3D setup and 42% right to compact Top-Down
      const leftW = Math.round(w * 0.56);
      const rightW = w - leftW;
      this._drawPerspectiveSetup(x, y, leftW, h, proj, ui, true);
      this.r.drawLine(x + leftW, y + 10, x + leftW, y + h - 10, 'rgba(148, 163, 184, 0.2)', 1, [4, 4]);
      this._drawTopDownDiagram(x + leftW, y, rightW, h, proj, ui, true);
    } else {
      const leftW = Math.round(w * 0.55);
      const rightW = w - leftW;
      this._drawPerspectiveSetup(x, y, leftW, h, proj, ui, false);
      this.r.drawLine(x + leftW, y + 14, x + leftW, y + h - 14, 'rgba(148, 163, 184, 0.22)', 1, [4, 4]);
      this._drawTopDownDiagram(x + leftW, y, rightW, h, proj, ui, false);
    }
  }

  /**
   * 1. Realistic 3D Perspective Lab Bench Setup (Matches Left Side of Reference Image 6)
   */
  _drawPerspectiveSetup(ox, oy, w, h, proj, ui, isCompact) {
    const ctx = this.ctx;
    const amb = proj.ambientLight;
    const powerOn = proj.powerOn;
    const source = proj.source;

    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, w, h);
    ctx.clip();

    // Room ambient gradient background (shifts smoothly from dark lab to bright room)
    const topL = Math.round(11 + amb * 46);
    const topG = Math.round(17 + amb * 54);
    const topB = Math.round(32 + amb * 68);
    const botL = Math.round(16 + amb * 56);
    const botG = Math.round(24 + amb * 62);
    const botB = Math.round(42 + amb * 72);

    const bgGrad = ctx.createLinearGradient(ox, oy, ox, oy + h);
    bgGrad.addColorStop(0, `rgb(${topL}, ${topG}, ${topB})`);
    bgGrad.addColorStop(0.55, `rgb(${botL}, ${botG}, ${botB})`);
    bgGrad.addColorStop(1, `rgb(${Math.max(8, botL - 6)}, ${Math.max(12, botG - 8)}, ${Math.max(20, botB - 10)})`);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(ox, oy, w, h);

    // Subtle tabletop perspective plane
    const tableHorizonY = oy + h * 0.44;
    ctx.fillStyle = `rgba(${20 + Math.round(amb * 45)}, ${30 + Math.round(amb * 50)}, ${48 + Math.round(amb * 55)}, 0.55)`;
    ctx.fillRect(ox, tableHorizonY, w, h - (tableHorizonY - oy));
    this.r.drawLine(ox, tableHorizonY, ox + w, tableHorizonY, 'rgba(148, 163, 184, 0.16)', 1);

    // Panel title badge
    this.r.drawLabel('มุมมองการจัดวางอุปกรณ์จริง (3D Setup)', ox + 12, oy + 15, {
      font: isCompact ? 'bold 10px Prompt, sans-serif' : 'bold 11.5px Prompt, sans-serif',
      color: '#cbd5e1',
      align: 'left',
      bgColor: 'rgba(15, 23, 42, 0.72)',
      padding: 4
    });

    // Core reference coordinates for the 3D apparatus
    const unitCenterX = ox + w * 0.54;
    const unitBaseY = oy + h * 0.62;
    const unitW = isCompact ? 38 : 54;
    const unitH = isCompact ? 96 : Math.min(138, h * 0.48);
    const unitD = isCompact ? 12 : 18; // 3D side extrusion depth

    // --- A. Black Cardboard Screen Backdrop (when enabled) ---
    if (proj.useBlackBackdrop) {
      const scrW = unitW * 2.55;
      const scrH = unitH * 1.08;
      const scrX = unitCenterX - scrW * 0.52;
      const scrY = unitBaseY - scrH + 8;

      ctx.save();
      // Back matte black board
      ctx.fillStyle = '#09090b';
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1.2;
      ctx.fillRect(scrX, scrY, scrW, scrH);
      ctx.strokeRect(scrX, scrY, scrW, scrH);

      // Left folded side wing
      ctx.beginPath();
      ctx.moveTo(scrX, scrY);
      ctx.lineTo(scrX - 18, scrY + 14);
      ctx.lineTo(scrX - 18, scrY + scrH + 10);
      ctx.lineTo(scrX, scrY + scrH);
      ctx.closePath();
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.stroke();

      // Right folded side wing
      ctx.beginPath();
      ctx.moveTo(scrX + scrW, scrY);
      ctx.lineTo(scrX + scrW + 18, scrY + 14);
      ctx.lineTo(scrX + scrW + 18, scrY + scrH + 10);
      ctx.lineTo(scrX + scrW, scrY + scrH);
      ctx.closePath();
      ctx.fillStyle = '#141418';
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // --- B. Spectrum Power Supply Box (ชุดสเปกตรัม — 3D Blue Housing like Image 6) ---
    const boxLeft = unitCenterX - unitW / 2;
    const boxTop = unitBaseY - unitH;

    // Subtle ambient glow aura cast onto table when power is ON
    if (powerOn) {
      const aura = ctx.createRadialGradient(
        unitCenterX, boxTop + unitH * 0.5, 4,
        unitCenterX, boxTop + unitH * 0.5, unitH * 1.15
      );
      aura.addColorStop(0, this._hexToRgba(source.tubeGlowOuter, 0.42));
      aura.addColorStop(0.55, this._hexToRgba(source.tubeGlowOuter, 0.12));
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(unitCenterX, boxTop + unitH * 0.5, unitH * 1.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top 3D face of Spectrum Box
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(boxLeft, boxTop);
    ctx.lineTo(boxLeft + unitD, boxTop - unitD * 0.55);
    ctx.lineTo(boxLeft + unitW + unitD, boxTop - unitD * 0.55);
    ctx.lineTo(boxLeft + unitW, boxTop);
    ctx.closePath();
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right 3D face of Spectrum Box
    ctx.beginPath();
    ctx.moveTo(boxLeft + unitW, boxTop);
    ctx.lineTo(boxLeft + unitW + unitD, boxTop - unitD * 0.55);
    ctx.lineTo(boxLeft + unitW + unitD, unitBaseY - unitD * 0.55);
    ctx.lineTo(boxLeft + unitW, unitBaseY);
    ctx.closePath();
    const rightGrad = ctx.createLinearGradient(boxLeft + unitW, boxTop, boxLeft + unitW + unitD, unitBaseY);
    rightGrad.addColorStop(0, '#1d4ed8');
    rightGrad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = rightGrad;
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.stroke();

    // Front face of Spectrum Box
    const frontGrad = ctx.createLinearGradient(boxLeft, boxTop, boxLeft + unitW, unitBaseY);
    frontGrad.addColorStop(0, '#2563eb');
    frontGrad.addColorStop(0.5, '#1e40af');
    frontGrad.addColorStop(1, '#172554');
    ctx.fillStyle = frontGrad;
    ctx.fillRect(boxLeft, boxTop, unitW, unitH);
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(boxLeft, boxTop, unitW, unitH);

    // Recessed inner bay for the gas discharge tube
    const bayPadX = unitW * 0.2;
    const bayPadY = unitH * 0.1;
    ctx.fillStyle = '#090d16';
    ctx.fillRect(boxLeft + bayPadX, boxTop + bayPadY, unitW - bayPadX * 2, unitH - bayPadY * 2);
    ctx.strokeStyle = '#1e293b';
    ctx.strokeRect(boxLeft + bayPadX, boxTop + bayPadY, unitW - bayPadX * 2, unitH - bayPadY * 2);

    // Upper & lower metallic electrode sockets
    const socketW = unitW * 0.34;
    const socketH = 7;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(unitCenterX - socketW / 2, boxTop + bayPadY, socketW, socketH);
    ctx.fillRect(unitCenterX - socketW / 2, unitBaseY - bayPadY - socketH, socketW, socketH);

    // Power LED indicator on side of housing
    ctx.beginPath();
    ctx.arc(boxLeft + unitW + unitD * 0.5, unitBaseY - 18, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = powerOn ? '#ef4444' : '#334155';
    if (powerOn) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
    }
    ctx.fill();
    ctx.restore();

    // --- C. Gas Discharge Tube (หลอดบรรจุแก๊ส) ---
    const tubeTopY = boxTop + bayPadY + socketH;
    const tubeBotY = unitBaseY - bayPadY - socketH;
    const tubeH = tubeBotY - tubeTopY;
    const bulbH = tubeH * 0.18;
    const capillaryW = isCompact ? 4.5 : 6;
    const bulbW = isCompact ? 11 : 14;

    ctx.save();
    if (powerOn) {
      const pulse = 0.92 + 0.08 * Math.sin((ui.animTimeMs || 0) * 0.008);
      ctx.shadowColor = source.tubeGlowOuter;
      ctx.shadowBlur = 22 * pulse;

      // Outer luminous envelope
      ctx.fillStyle = source.tubeGlowOuter;
      ctx.fillRect(unitCenterX - capillaryW * 0.9, tubeTopY, capillaryW * 1.8, tubeH);

      // Top & bottom glowing glass bulbs
      ctx.beginPath();
      ctx.ellipse(unitCenterX, tubeTopY + bulbH * 0.55, bulbW * 0.45, bulbH * 0.55, 0, 0, Math.PI * 2);
      ctx.ellipse(unitCenterX, tubeBotY - bulbH * 0.55, bulbW * 0.45, bulbH * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hot bright plasma core
      ctx.fillStyle = source.tubeGlowCore;
      ctx.fillRect(unitCenterX - capillaryW * 0.45, tubeTopY + 3, capillaryW * 0.9, tubeH - 6);
    } else {
      // Unlit translucent glass tube
      ctx.fillStyle = 'rgba(203, 213, 225, 0.25)';
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
      ctx.lineWidth = 1;
      ctx.fillRect(unitCenterX - capillaryW / 2, tubeTopY, capillaryW, tubeH);
      ctx.strokeRect(unitCenterX - capillaryW / 2, tubeTopY, capillaryW, tubeH);
      ctx.beginPath();
      ctx.ellipse(unitCenterX, tubeTopY + bulbH * 0.55, bulbW * 0.42, bulbH * 0.5, 0, 0, Math.PI * 2);
      ctx.ellipse(unitCenterX, tubeBotY - bulbH * 0.55, bulbW * 0.42, bulbH * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // --- D. Meter Stick (ไม้เมตร 0-100 cm) resting on 2 Support Blocks (like Image 6) ---
    // Perspective tilt: left end (0 cm) slightly higher-left, right end (100 cm) slightly lower-right
    const stickCenterX = unitCenterX;
    const stickCenterY = unitBaseY - unitH * 0.14;
    const halfStickDX = w * (isCompact ? 0.36 : 0.38);
    const halfStickDY = h * 0.11;

    const stickLeftX = stickCenterX - halfStickDX;
    const stickLeftY = stickCenterY - halfStickDY;
    const stickRightX = stickCenterX + halfStickDX;
    const stickRightY = stickCenterY + halfStickDY;

    // Support Blocks (Left and Right wooden/metal blocks under the meter stick)
    this._draw3DSupportBlock(stickLeftX + 12, stickLeftY + 12, isCompact ? 22 : 30, isCompact ? 14 : 18);
    this._draw3DSupportBlock(stickRightX - 12, stickRightY + 12, isCompact ? 22 : 30, isCompact ? 14 : 18);

    // Draw Virtual Spectral Lines floating along the meter stick plane when Power is ON!
    if (powerOn) {
      this._drawPerspectiveVirtualLines(
        stickLeftX, stickLeftY, stickRightX, stickRightY,
        proj, isCompact ? 24 : 34
      );
    }

    // Meter Stick Body (wooden ruler bar in perspective)
    ctx.save();
    const angle = Math.atan2(stickRightY - stickLeftY, stickRightX - stickLeftX);
    const stickLenPx = Math.hypot(stickRightX - stickLeftX, stickRightY - stickLeftY);
    const stickThick = isCompact ? 10 : 13;

    ctx.translate(stickLeftX, stickLeftY);
    ctx.rotate(angle);

    // Stick shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(0, 3, stickLenPx, stickThick);

    // Wooden meter stick surface
    const woodGrad = ctx.createLinearGradient(0, -stickThick / 2, 0, stickThick / 2);
    woodGrad.addColorStop(0, '#fef3c7');
    woodGrad.addColorStop(0.5, '#fde68a');
    woodGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(0, -stickThick / 2, stickLenPx, stickThick);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, -stickThick / 2, stickLenPx, stickThick);

    // Meter stick cm tick marks (0..100 cm)
    ctx.strokeStyle = '#451a03';
    for (let cm = 0; cm <= 100; cm += 2) {
      const tx = (cm / 100) * stickLenPx;
      const isMajor = cm % 10 === 0;
      const isCenter = cm === 50;
      const tickH = isCenter ? stickThick * 0.85 : isMajor ? stickThick * 0.62 : stickThick * 0.32;
      ctx.beginPath();
      ctx.lineWidth = isCenter ? 1.8 : isMajor ? 1.1 : 0.6;
      ctx.strokeStyle = isCenter ? '#dc2626' : '#451a03';
      ctx.moveTo(tx, -stickThick / 2);
      ctx.lineTo(tx, -stickThick / 2 + tickH);
      ctx.stroke();
    }
    ctx.restore();

    // --- E. Optical Axis Line from 50 cm to Diffraction Grating & Observer Eye ---
    // Grating position shifts visibly with distance D (50..120 cm)
    const dNorm = (proj.distanceCm - 50) / 70; // 0..1
    const gratingX = stickCenterX - w * (0.19 + dNorm * 0.14);
    const gratingY = stickCenterY + h * (0.14 + dNorm * 0.11);

    // Optical sight line (from eye -> grating -> 50 cm)
    this.r.drawLine(
      gratingX, gratingY,
      stickCenterX, stickCenterY,
      'rgba(148, 163, 184, 0.72)', 1.3, [5, 4]
    );

    // Diffraction Grating Frame (เกรตติง)
    const grW = isCompact ? 18 : 26;
    const grH = isCompact ? 24 : 32;
    ctx.save();
    // Grating slide frame (white/slate slide mount with translucent optical window)
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(gratingX - grW * 0.5, gratingY - grH * 0.55);
    ctx.lineTo(gratingX + grW * 0.5, gratingY - grH * 0.4);
    ctx.lineTo(gratingX + grW * 0.5, gratingY + grH * 0.55);
    ctx.lineTo(gratingX - grW * 0.5, gratingY + grH * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner diffraction film window with fine vertical slits
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fillRect(gratingX - grW * 0.3, gratingY - grH * 0.28, grW * 0.6, grH * 0.58);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 0.7;
    for (let sx = -grW * 0.24; sx <= grW * 0.24; sx += 3.5) {
      ctx.beginPath();
      ctx.moveTo(gratingX + sx, gratingY - grH * 0.26);
      ctx.lineTo(gratingX + sx, gratingY + grH * 0.28);
      ctx.stroke();
    }
    ctx.restore();

    // Observer Eye Icon (ดวงตาผู้สังเกตมองผ่านเกรตติง)
    const eyeX = gratingX - (isCompact ? 24 : 34);
    const eyeY = gratingY + (isCompact ? 10 : 14);
    this._drawObserverEye(eyeX, eyeY, isCompact ? 0.85 : 1.0);

    // --- F. Clean Callout Labels (Matching Reference Image 6!) ---
    const labelFont = isCompact ? '10px Sarabun, sans-serif' : '11.5px Sarabun, sans-serif';
    const calloutX = boxLeft + unitW + unitD + 14;

    // ชุดสเปกตรัม
    this.r.drawArrow(calloutX - 2, boxTop + 12, boxLeft + unitW + unitD - 2, boxTop + 12, '#94a3b8', 1, 5);
    this.r.drawLabel('ชุดสเปกตรัม', calloutX + 2, boxTop + 12, {
      font: labelFont,
      color: '#e2e8f0',
      align: 'left'
    });

    // หลอดบรรจุแก๊ส
    this.r.drawArrow(calloutX - 2, boxTop + unitH * 0.44, unitCenterX + 6, boxTop + unitH * 0.44, '#38bdf8', 1, 5);
    this.r.drawLabel(`หลอด${source.shortNameTh}`, calloutX + 2, boxTop + unitH * 0.44, {
      font: labelFont,
      color: '#7dd3fc',
      align: 'left'
    });

    // ไม้เมตร
    this.r.drawLabel('ไม้เมตร (50 cm กึ่งกลาง)', stickRightX - 10, stickRightY - 16, {
      font: isCompact ? '9.5px Sarabun, sans-serif' : '11px Sarabun, sans-serif',
      color: '#fde68a',
      align: 'right',
      bgColor: 'rgba(15, 23, 42, 0.72)',
      padding: 3
    });

    // เกรตติง
    this.r.drawLabel(`เกรตติง (${proj.spacing.linesPerCm.toLocaleString()} เส้น/cm)`, gratingX + grW * 0.65, gratingY + 12, {
      font: isCompact ? '9.5px Sarabun, sans-serif' : '11px Sarabun, sans-serif',
      color: '#38bdf8',
      align: 'left',
      bgColor: 'rgba(15, 23, 42, 0.78)',
      padding: 3
    });

    // Power OFF badge reminder
    if (!powerOn) {
      this.r.drawLabel('⚡ ปิดสวิตช์อยู่ — กด "เปิดสวิตช์ไฟแรงสูง" เพื่อเริ่มทดลอง', ox + w / 2, oy + h - 14, {
        font: isCompact ? 'bold 10px Prompt, sans-serif' : 'bold 11.5px Prompt, sans-serif',
        color: '#fbbf24',
        align: 'center',
        bgColor: 'rgba(15, 23, 42, 0.88)',
        padding: 5
      });
    }

    ctx.restore();
  }

  /**
   * Draw virtual spectral lines floating above the perspective meter stick
   */
  _drawPerspectiveVirtualLines(x0, y0, x1, y1, proj, lineHeight) {
    const ctx = this.ctx;

    const getStickPoint = (cm) => {
      const t = cm / 100;
      return {
        x: x0 + (x1 - x0) * t,
        y: y0 + (y1 - y0) * t
      };
    };

    ctx.save();
    if (proj.spectrumType === 'continuous' && proj.continuousBand) {
      const band = proj.continuousBand;
      const drawSideBand = (innerCm, outerCm) => {
        const pIn = getStickPoint(Math.max(0, Math.min(100, innerCm)));
        const pOut = getStickPoint(Math.max(0, Math.min(100, outerCm)));
        const grad = ctx.createLinearGradient(pIn.x, pIn.y, pOut.x, pOut.y);
        grad.addColorStop(0.0, `rgba(139, 92, 246, ${0.65 * band.visibility})`);
        grad.addColorStop(0.22, `rgba(59, 130, 246, ${0.78 * band.visibility})`);
        grad.addColorStop(0.45, `rgba(16, 185, 129, ${0.85 * band.visibility})`);
        grad.addColorStop(0.68, `rgba(234, 179, 8, ${0.88 * band.visibility})`);
        grad.addColorStop(0.84, `rgba(249, 115, 22, ${0.85 * band.visibility})`);
        grad.addColorStop(1.0, `rgba(239, 68, 68, ${0.82 * band.visibility})`);

        ctx.beginPath();
        ctx.moveTo(pIn.x, pIn.y - lineHeight);
        ctx.lineTo(pOut.x, pOut.y - lineHeight);
        ctx.lineTo(pOut.x, pOut.y - 4);
        ctx.lineTo(pIn.x, pIn.y - 4);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      };
      drawSideBand(band.rightInnerCm, band.rightOuterCm);
      drawSideBand(band.leftInnerCm, band.leftOuterCm);
    } else {
      for (const line of proj.projectedLines) {
        if (!line.isPhysical || !line.isOnMeterStick) continue;
        const alpha = Math.max(0.08, line.visibility);
        [line.displayedRightCm, line.displayedLeftCm].forEach((posCm) => {
          const p = getStickPoint(posCm);
          ctx.save();
          ctx.strokeStyle = this._hexToRgba(line.colorHex, alpha);
          ctx.shadowColor = line.colorHex;
          ctx.shadowBlur = 10 * alpha;
          ctx.lineWidth = line.primary ? 2.6 : 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - lineHeight);
          ctx.lineTo(p.x, p.y - 4);
          ctx.stroke();
          ctx.restore();
        });
      }
    }
    ctx.restore();
  }

  /**
   * 2. Top-Down Geometric Optical Ray Diagram (Matches Right Side of Reference Image 6!)
   */
  _drawTopDownDiagram(ox, oy, w, h, proj, ui, isCompact) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, w, h);
    ctx.clip();

    // Clean Blueprint Dark Slate Canvas
    ctx.fillStyle = '#0a101f';
    ctx.fillRect(ox, oy, w, h);

    // Panel title badge
    this.r.drawLabel('แผนภาพเรขาคณิตมุมมองด้านบน (Top-View)', ox + w / 2, oy + 15, {
      font: isCompact ? 'bold 10px Prompt, sans-serif' : 'bold 11.5px Prompt, sans-serif',
      color: '#cbd5e1',
      align: 'center',
      bgColor: 'rgba(15, 23, 42, 0.78)',
      padding: 4
    });

    const padX = isCompact ? 18 : 30;
    const axisY = oy + (isCompact ? 56 : 64);
    const axisLeft = ox + padX;
    const axisRight = ox + w - padX - (isCompact ? 22 : 34);
    const axisW = Math.max(80, axisRight - axisLeft);
    const centerX = axisLeft + axisW / 2;

    // Map distance D (50..120 cm) visually to vertical separation on diagram
    const maxDiagD = Math.max(70, h - (axisY - oy) - 38);
    const dRatio = proj.distanceCm / 120; // 0.42 .. 1.0
    const gratingY = axisY + Math.max(58, maxDiagD * (0.45 + 0.55 * dRatio));

    // Spectrum housing top-down rectangle behind 50 cm mark
    const housingW = isCompact ? 26 : 36;
    const housingH = isCompact ? 16 : 22;
    const housingGrad = ctx.createLinearGradient(centerX - housingW / 2, axisY - housingH - 6, centerX + housingW / 2, axisY - 6);
    housingGrad.addColorStop(0, '#4f46e5');
    housingGrad.addColorStop(1, '#312e81');
    ctx.fillStyle = housingGrad;
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 1.2;
    ctx.fillRect(centerX - housingW / 2, axisY - housingH - 5, housingW, housingH);
    ctx.strokeRect(centerX - housingW / 2, axisY - housingH - 5, housingW, housingH);

    // Glowing gas tube dot directly at 50 cm
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, axisY - 3, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = proj.powerOn ? proj.source.tubeGlowOuter : '#64748b';
    if (proj.powerOn) {
      ctx.shadowColor = proj.source.tubeGlowOuter;
      ctx.shadowBlur = 12;
    }
    ctx.fill();
    ctx.restore();

    // Horizontal meter stick line (0 - 100 cm)
    this.r.drawLine(axisLeft, axisY, axisRight, axisY, '#cbd5e1', 1.6);

    // Tick marks at 0, 50, 100 cm
    [0, 50, 100].forEach((cm) => {
      const tx = axisLeft + (cm / 100) * axisW;
      this.r.drawLine(tx, axisY - 4, tx, axisY + 4, '#94a3b8', 1.2);
      if (!isCompact || cm === 50) {
        this.r.drawLabel(`${cm}`, tx, axisY - 12, {
          font: '10px Fira Code, monospace',
          color: '#94a3b8'
        });
      }
    });

    // Vertical optical axis (center dashed line)
    this.r.drawLine(centerX, axisY, centerX, gratingY, 'rgba(148, 163, 184, 0.55)', 1.2, [4, 4]);

    // Determine active highlight ray (either pinned measurement, active selected line, or first primary line)
    let highlightRightCm = null;
    let highlightLeftCm = null;
    let highlightColor = '#ef4444';
    let highlightLabel = '';

    if (proj.powerOn) {
      if (proj.spectrumType === 'continuous' && proj.continuousBand) {
        const b = proj.continuousBand;
        highlightRightCm = (b.rightInnerCm + b.rightOuterCm) / 2;
        highlightLeftCm = (b.leftInnerCm + b.leftOuterCm) / 2;
        highlightColor = '#22c55e';
        highlightLabel = 'แถบต่อเนื่อง';
      } else {
        const activeLine =
          proj.projectedLines.find((l) => l.id === ui.selectedLineId && l.isOnMeterStick) ||
          proj.projectedLines.find((l) => l.primary && l.isOnMeterStick) ||
          proj.projectedLines[0];

        if (activeLine && activeLine.isOnMeterStick) {
          highlightRightCm = activeLine.displayedRightCm;
          highlightLeftCm = activeLine.displayedLeftCm;
          highlightColor = activeLine.colorHex;
          highlightLabel = `${activeLine.colorNameTh} (${activeLine.wavelengthNm.toFixed(0)} nm)`;
        }
      }

      // Override with user's custom pinned markers if they measured manually
      if (ui.measuredRightCm !== null && ui.measuredLeftCm !== null) {
        highlightRightCm = ui.measuredRightCm;
        highlightLeftCm = ui.measuredLeftCm;
        highlightColor = '#fbbf24';
      }
    }

    // Draw subtle faint rays for all primary lines, then prominent dashed rays for active line
    if (proj.powerOn && proj.spectrumType === 'line') {
      for (const line of proj.projectedLines) {
        if (!line.isOnMeterStick || !line.primary) continue;
        const rx = axisLeft + (line.displayedRightCm / 100) * axisW;
        const lx = axisLeft + (line.displayedLeftCm / 100) * axisW;
        const col = this._hexToRgba(line.colorHex, 0.25 * line.visibility + 0.08);
        this.r.drawLine(centerX, gratingY, rx, axisY, col, 1, [3, 3]);
        this.r.drawLine(centerX, gratingY, lx, axisY, col, 1, [3, 3]);

        // Small dot at spectral line position on meter stick
        ctx.fillStyle = this._hexToRgba(line.colorHex, Math.max(0.2, line.visibility));
        ctx.fillRect(rx - 1.5, axisY - 5, 3, 10);
        ctx.fillRect(lx - 1.5, axisY - 5, 3, 10);
      }
    } else if (proj.powerOn && proj.spectrumType === 'continuous' && proj.continuousBand) {
      const b = proj.continuousBand;
      const drawTopRainbow = (c1, c2) => {
        const x1 = axisLeft + (Math.max(0, Math.min(100, c1)) / 100) * axisW;
        const x2 = axisLeft + (Math.max(0, Math.min(100, c2)) / 100) * axisW;
        const g = ctx.createLinearGradient(x1, axisY, x2, axisY);
        g.addColorStop(0, '#8b5cf6');
        g.addColorStop(0.3, '#3b82f6');
        g.addColorStop(0.55, '#10b981');
        g.addColorStop(0.8, '#eab308');
        g.addColorStop(1, '#ef4444');
        ctx.fillStyle = g;
        ctx.fillRect(Math.min(x1, x2), axisY - 4, Math.abs(x2 - x1), 8);
      };
      drawTopRainbow(b.rightInnerCm, b.rightOuterCm);
      drawTopRainbow(b.leftInnerCm, b.leftOuterCm);
    }

    // Active dashed diffraction rays + angle theta + x dimension arrows (like Image 6 right!)
    if (highlightRightCm !== null && highlightLeftCm !== null) {
      const rx = axisLeft + (highlightRightCm / 100) * axisW;
      const lx = axisLeft + (highlightLeftCm / 100) * axisW;

      this.r.drawLine(centerX, gratingY, rx, axisY, highlightColor, 1.8, [5, 3]);
      this.r.drawLine(centerX, gratingY, lx, axisY, highlightColor, 1.8, [5, 3]);

      // Downward pointer arrows to "ตำแหน่งเส้นสเปกตรัม"
      this.r.drawArrow(lx, axisY - 22, lx, axisY - 5, highlightColor, 1.5, 5);
      this.r.drawArrow(rx, axisY - 22, rx, axisY - 5, highlightColor, 1.5, 5);

      if (!isCompact) {
        this.r.drawLabel('ตำแหน่งเส้นสเปกตรัม', lx, axisY - 30, {
          font: '10px Sarabun, sans-serif',
          color: '#e2e8f0'
        });
        this.r.drawLabel('ตำแหน่งเส้นสเปกตรัม', rx, axisY - 30, {
          font: '10px Sarabun, sans-serif',
          color: '#e2e8f0'
        });
      }

      // Horizontal displacement x bracket on left side
      const xDimY = axisY + 13;
      this.r.drawArrow(centerX - 3, xDimY, lx + 2, xDimY, '#fbbf24', 1.2, 5);
      this.r.drawArrow(lx + 2, xDimY, centerX - 3, xDimY, '#fbbf24', 1.2, 5);
      const xVal = Math.abs(50 - highlightLeftCm).toFixed(1);
      this.r.drawLabel(`x = ${xVal} cm`, (centerX + lx) / 2, xDimY + 11, {
        font: 'bold 10px Fira Code, monospace',
        color: '#fbbf24'
      });

      // Angle arc theta between center axis and left diffraction ray
      const rayAngle = Math.atan2(axisY - gratingY, lx - centerX);
      const arcR = Math.min(34, (gratingY - axisY) * 0.36);
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.arc(centerX, gratingY, arcR, rayAngle, -Math.PI / 2);
      ctx.stroke();
      ctx.restore();

      const thetaDeg = (Math.atan(Math.abs(50 - highlightLeftCm) / proj.distanceCm) * 180) / Math.PI;
      this.r.drawLabel(`θ=${thetaDeg.toFixed(1)}°`, centerX - arcR * 0.72, gratingY - arcR * 1.12, {
        font: 'bold 10px Fira Code, monospace',
        color: '#38bdf8'
      });
    }

    // Grating plate horizontal bar at bottom
    const grBarW = isCompact ? 34 : 50;
    this.r.drawLine(centerX - grBarW / 2, gratingY, centerX + grBarW / 2, gratingY, '#38bdf8', 3.5);
    this.r.drawLabel('เกรตติง', centerX, gratingY + 14, {
      font: 'bold 11px Sarabun, sans-serif',
      color: '#38bdf8'
    });

    // Vertical dimension arrow for Distance D on right margin
    const dArrowX = axisRight + (isCompact ? 10 : 16);
    this.r.drawArrow(dArrowX, (axisY + gratingY) / 2, dArrowX, axisY + 2, '#94a3b8', 1.2, 5);
    this.r.drawArrow(dArrowX, (axisY + gratingY) / 2, dArrowX, gratingY - 2, '#94a3b8', 1.2, 5);
    this.r.drawLine(axisRight + 2, gratingY, dArrowX + 5, gratingY, 'rgba(148, 163, 184, 0.4)', 1);
    this.r.drawLabel(`D=${proj.distanceCm}cm`, dArrowX, (axisY + gratingY) / 2, {
      font: 'bold 9.5px Fira Code, monospace',
      color: '#e2e8f0',
      align: 'center',
      bgColor: 'rgba(10, 16, 31, 0.92)',
      padding: 2
    });

    if (highlightLabel && !isCompact) {
      this.r.drawLabel(highlightLabel, ox + w - 12, oy + h - 13, {
        font: 'bold 10px Prompt, sans-serif',
        color: highlightColor,
        align: 'right'
      });
    }

    ctx.restore();
  }

  /**
   * 3. Interactive Eye-Through-Grating View (First-Person Measurement on 0-100 cm Meter Stick)
   */
  _renderEyepieceView(ox, oy, w, h, proj, ui, isSplit) {
    const ctx = this.ctx;
    const amb = proj.ambientLight;
    const powerOn = proj.powerOn;

    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, w, h);
    ctx.clip();

    // Background darkroom illumination (affected by ambient light & black cardboard screen)
    const effectiveBgLight = proj.useBlackBackdrop ? amb * 0.45 : amb * 0.9;
    const bgR = Math.round(4 + effectiveBgLight * 58);
    const bgG = Math.round(7 + effectiveBgLight * 66);
    const bgB = Math.round(14 + effectiveBgLight * 80);
    ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
    ctx.fillRect(ox, oy, w, h);

    // Header instruction bar inside eyepiece
    this.r.drawLabel(
      'มุมมองผ่านเกรตติง — เลื่อนเมาส์/แตะบนไม้เมตรเพื่อวัดตำแหน่งเส้นสเปกตรัมซ้าย-ขวา',
      ox + 12,
      oy + 15,
      {
        font: w < 640 ? 'bold 10px Prompt, sans-serif' : 'bold 11.5px Prompt, sans-serif',
        color: '#e2e8f0',
        align: 'left',
        bgColor: 'rgba(15, 23, 42, 0.78)',
        padding: 4
      }
    );

    // Meter stick horizontal layout
    const padX = w < 640 ? 20 : 38;
    const meterX = ox + padX;
    const meterW = Math.max(200, w - padX * 2);
    const rulerH = isSplit ? 28 : 34;
    const rulerY = oy + Math.round(h * 0.64);
    const specTopY = oy + 32;
    const specBotY = rulerY - 4;
    const specH = Math.max(40, specBotY - specTopY);

    // Save interactive hit box for mouse/touch coordinate mapping
    this.eyepieceMeterRect = {
      x: meterX,
      y: specTopY,
      width: meterW,
      height: (rulerY + rulerH) - specTopY,
      rulerY,
      rulerH
    };

    const cmToX = (cm) => meterX + (cm / 100) * meterW;

    // --- A. Black cardboard frame behind tube area (visual cue) ---
    if (proj.useBlackBackdrop) {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.68)';
      ctx.fillRect(meterX - 8, specTopY, meterW + 16, specH + 4);
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
      ctx.strokeRect(meterX - 8, specTopY, meterW + 16, specH + 4);
    }

    // --- B. Central Glowing Gas Tube (0th Order Bright Fringe at 50.0 cm) ---
    const centerX = cmToX(50);
    ctx.save();
    if (powerOn) {
      const centerGrad = ctx.createRadialGradient(
        centerX, specTopY + specH * 0.5, 2,
        centerX, specTopY + specH * 0.5, 36
      );
      centerGrad.addColorStop(0, this._hexToRgba(proj.source.tubeGlowOuter, 0.58));
      centerGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(centerX - 36, specTopY, 72, specH);

      // Luminous central tube slit
      ctx.fillStyle = proj.source.tubeGlowOuter;
      ctx.shadowColor = proj.source.tubeGlowOuter;
      ctx.shadowBlur = 18;
      ctx.fillRect(centerX - 5, specTopY + 4, 10, specH - 8);
      ctx.fillStyle = proj.source.tubeGlowCore;
      ctx.fillRect(centerX - 2.2, specTopY + 6, 4.4, specH - 12);
    } else {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.fillRect(centerX - 4, specTopY + 6, 8, specH - 12);
    }
    ctx.restore();

    // --- C. Left & Right First-Order Spectral Lines (or Continuous Band) ---
    if (powerOn) {
      if (proj.spectrumType === 'continuous' && proj.continuousBand) {
        const b = proj.continuousBand;
        const drawContinuous = (innerCm, outerCm) => {
          const xIn = cmToX(Math.max(0, Math.min(100, innerCm)));
          const xOut = cmToX(Math.max(0, Math.min(100, outerCm)));
          const grad = ctx.createLinearGradient(xIn, specTopY, xOut, specTopY);
          const v = b.visibility;
          grad.addColorStop(0.0, `rgba(124, 58, 237, ${0.72 * v})`);
          grad.addColorStop(0.18, `rgba(59, 130, 246, ${0.88 * v})`);
          grad.addColorStop(0.38, `rgba(6, 182, 212, ${0.92 * v})`);
          grad.addColorStop(0.55, `rgba(34, 197, 94, ${0.95 * v})`);
          grad.addColorStop(0.72, `rgba(234, 179, 8, ${0.96 * v})`);
          grad.addColorStop(0.86, `rgba(249, 115, 22, ${0.92 * v})`);
          grad.addColorStop(1.0, `rgba(239, 68, 68, ${0.88 * v})`);

          ctx.save();
          ctx.fillStyle = grad;
          ctx.fillRect(Math.min(xIn, xOut), specTopY + 6, Math.abs(xOut - xIn), specH - 12);
          ctx.restore();
        };

        drawContinuous(b.rightInnerCm, b.rightOuterCm);
        drawContinuous(b.leftInnerCm, b.leftOuterCm);
      } else {
        for (const line of proj.projectedLines) {
          if (!line.isPhysical || !line.isOnMeterStick) continue;
          const v = line.visibility;
          const isSelected = line.id === ui.selectedLineId;

          [line.displayedLeftCm, line.displayedRightCm].forEach((posCm) => {
            const lx = cmToX(posCm);
            ctx.save();
            // Outer bloom
            ctx.strokeStyle = this._hexToRgba(line.colorHex, v * 0.55);
            ctx.lineWidth = line.primary ? 7 : 4;
            ctx.shadowColor = line.colorHex;
            ctx.shadowBlur = 16 * v;
            ctx.beginPath();
            ctx.moveTo(lx, specTopY + 6);
            ctx.lineTo(lx, specBotY - 4);
            ctx.stroke();

            // Crisp bright core line
            ctx.strokeStyle = this._hexToRgba(line.colorHex, Math.min(1, v + 0.12));
            ctx.lineWidth = line.primary ? 2.6 : 1.5;
            ctx.beginPath();
            ctx.moveTo(lx, specTopY + 6);
            ctx.lineTo(lx, specBotY - 4);
            ctx.stroke();

            // White hot filament core for bright lines
            if (v > 0.5 && line.primary) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${(v - 0.35) * 0.7})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(lx, specTopY + 8);
              ctx.lineTo(lx, specBotY - 6);
              ctx.stroke();
            }

            // Subtle selection bracket if highlighted
            if (isSelected) {
              ctx.strokeStyle = '#fbbf24';
              ctx.lineWidth = 1.2;
              ctx.setLineDash([2, 2]);
              ctx.strokeRect(lx - 6, specTopY + 2, 12, specH - 4);
            }
            ctx.restore();
          });
        }
      }
    }

    // --- D. Precision Meter Stick (ไม้เมตร 0 - 100 cm) ---
    ctx.save();
    const rulerGrad = ctx.createLinearGradient(meterX, rulerY, meterX, rulerY + rulerH);
    rulerGrad.addColorStop(0, '#fef3c7');
    rulerGrad.addColorStop(0.65, '#fde68a');
    rulerGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = rulerGrad;
    ctx.fillRect(meterX, rulerY, meterW, rulerH);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(meterX, rulerY, meterW, rulerH);

    // Millimeter/Centimeter ticks
    for (let cm = 0; cm <= 100; cm++) {
      const tx = cmToX(cm);
      const isTen = cm % 10 === 0;
      const isFive = cm % 5 === 0;
      const isCenter = cm === 50;
      const tickH = isTen ? 13 : isFive ? 9 : 5;

      ctx.beginPath();
      ctx.strokeStyle = isCenter ? '#dc2626' : '#451a03';
      ctx.lineWidth = isCenter ? 2 : isTen ? 1.3 : 0.75;
      ctx.moveTo(tx, rulerY);
      ctx.lineTo(tx, rulerY + tickH);
      ctx.stroke();

      if (isTen && (w >= 540 || cm % 20 === 0 || cm === 50)) {
        this.r.drawLabel(`${cm}`, tx, rulerY + rulerH - 8, {
          font: isCenter ? 'bold 11px Fira Code, monospace' : '10px Fira Code, monospace',
          color: isCenter ? '#b91c1c' : '#451a03'
        });
      }
    }
    ctx.restore();

    // Left / Center / Right footer scale labels
    this.r.drawLabel('◀ ฝั่งซ้าย (0 – 50 cm)', meterX + meterW * 0.22, rulerY + rulerH + 12, {
      font: '10.5px Sarabun, sans-serif',
      color: '#94a3b8'
    });
    this.r.drawLabel('แถบสว่างกึ่งกลาง (50.0 cm)', centerX, rulerY + rulerH + 12, {
      font: 'bold 10.5px Sarabun, sans-serif',
      color: '#f87171'
    });
    this.r.drawLabel('ฝั่งขวา (50 – 100 cm) ▶', meterX + meterW * 0.78, rulerY + rulerH + 12, {
      font: '10.5px Sarabun, sans-serif',
      color: '#94a3b8'
    });

    // --- E. Pinned Left & Right Measurement Markers ---
    if (ui.measuredLeftCm !== null) {
      this._drawMeasurementPin(cmToX(ui.measuredLeftCm), specTopY, rulerY, ui.measuredLeftCm, 'ซ้าย', '#38bdf8');
    }
    if (ui.measuredRightCm !== null) {
      this._drawMeasurementPin(cmToX(ui.measuredRightCm), specTopY, rulerY, ui.measuredRightCm, 'ขวา', '#fbbf24');
    }

    // --- F. Live Hover Crosshair + 3x Magnifier Loupe ---
    if (typeof ui.hoverCm === 'number' && ui.hoverCm >= 0 && ui.hoverCm <= 100) {
      const hx = cmToX(ui.hoverCm);
      this.r.drawLine(hx, specTopY, hx, rulerY + rulerH, 'rgba(250, 204, 21, 0.85)', 1.2, [3, 3]);

      const sideText = ui.hoverCm >= 50 ? 'ขวา' : 'ซ้าย';
      const xDist = Math.abs(ui.hoverCm - 50).toFixed(1);
      const badgeX = Math.max(meterX + 75, Math.min(meterX + meterW - 75, hx));
      this.r.drawLabel(
        `${sideText}: ${ui.hoverCm.toFixed(1)} cm (x=${xDist})`,
        badgeX,
        specTopY + 12,
        {
          font: 'bold 10.5px Fira Code, monospace',
          color: '#fef08a',
          bgColor: 'rgba(15, 23, 42, 0.92)',
          padding: 4
        }
      );

      // Draw circular 3x Magnifier Loupe when desktop/tablet has space
      if (w >= 560) {
        this._drawMagnifierLoupe(hx, rulerY - 12, ui.hoverCm, proj, ox + 12, ox + w - 12, oy + 28);
      }
    }

    ctx.restore();
  }

  /**
   * Draw a pinned measurement marker on the meter stick
   */
  _drawMeasurementPin(px, specTopY, rulerY, cmVal, sideLabel, color) {
    const ctx = this.ctx;
    ctx.save();
    this.r.drawLine(px, specTopY + 14, px, rulerY + 8, color, 1.8);

    // Downward triangle pointer onto ruler
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(px, rulerY + 2);
    ctx.lineTo(px - 5, rulerY - 7);
    ctx.lineTo(px + 5, rulerY - 7);
    ctx.closePath();
    ctx.fill();

    this.r.drawLabel(`${sideLabel} ${cmVal.toFixed(1)}`, px, specTopY + 10, {
      font: 'bold 10px Fira Code, monospace',
      color: '#0f172a',
      bgColor: color,
      padding: 3
    });
    ctx.restore();
  }

  /**
   * Draw a 3x precision scale magnifier loupe centered on hoverCm
   */
  _drawMagnifierLoupe(anchorX, anchorY, centerCm, proj, minX, maxX, minY) {
    const ctx = this.ctx;
    const radius = 34;
    const cx = Math.max(minX + radius + 4, Math.min(maxX - radius - 4, anchorX + (anchorX > (minX + maxX) / 2 ? -54 : 54)));
    const cy = Math.max(minY + radius + 4, anchorY - 26);
    const pxPerCm = 14; // Zoomed scale: 14 px per cm (0.5 cm easily readable!)

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#090d16';
    ctx.fill();
    ctx.clip();

    // Draw zoomed spectral lines inside loupe
    if (proj.powerOn && proj.spectrumType === 'line') {
      for (const line of proj.projectedLines) {
        if (!line.isOnMeterStick) continue;
        [line.displayedLeftCm, line.displayedRightCm].forEach((posCm) => {
          const dx = (posCm - centerCm) * pxPerCm;
          if (Math.abs(dx) <= radius + 4) {
            ctx.strokeStyle = this._hexToRgba(line.colorHex, Math.max(0.25, line.visibility));
            ctx.lineWidth = line.primary ? 4 : 2;
            ctx.beginPath();
            ctx.moveTo(cx + dx, cy - radius);
            ctx.lineTo(cx + dx, cy + 4);
            ctx.stroke();
          }
        });
      }
    }

    // Zoomed wooden meter stick strip at bottom of loupe
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(cx - radius, cy + 4, radius * 2, radius);
    ctx.strokeStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy + 4);
    ctx.lineTo(cx + radius, cy + 4);
    ctx.stroke();

    // Zoomed 0.5 cm & 1 cm ticks
    const startHalf = Math.floor((centerCm - 3) * 2);
    const endHalf = Math.ceil((centerCm + 3) * 2);
    for (let h = startHalf; h <= endHalf; h++) {
      const cm = h / 2;
      if (cm < 0 || cm > 100) continue;
      const tx = cx + (cm - centerCm) * pxPerCm;
      const isWhole = h % 2 === 0;
      const isFive = isWhole && cm % 5 === 0;
      ctx.beginPath();
      ctx.strokeStyle = cm === 50 ? '#dc2626' : '#451a03';
      ctx.lineWidth = isFive ? 1.5 : isWhole ? 1.1 : 0.7;
      ctx.moveTo(tx, cy + 4);
      ctx.lineTo(tx, cy + (isFive ? 17 : isWhole ? 13 : 9));
      ctx.stroke();

      if (isWhole && Math.abs(tx - cx) < radius - 6) {
        ctx.font = 'bold 8.5px Fira Code, monospace';
        ctx.fillStyle = '#451a03';
        ctx.textAlign = 'center';
        ctx.fillText(String(cm), tx, cy + 25);
      }
    }

    // Center golden reticle
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();
    ctx.restore();

    // Loupe metallic rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draw a small 3D perspective support block under the meter stick
   */
  _draw3DSupportBlock(cx, cy, bw, bh) {
    const ctx = this.ctx;
    const d = 9;
    ctx.save();
    // Top face
    ctx.beginPath();
    ctx.moveTo(cx - bw / 2, cy - bh / 2);
    ctx.lineTo(cx - bw / 2 + d, cy - bh / 2 - d * 0.5);
    ctx.lineTo(cx + bw / 2 + d, cy - bh / 2 - d * 0.5);
    ctx.lineTo(cx + bw / 2, cy - bh / 2);
    ctx.closePath();
    ctx.fillStyle = '#94a3b8';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Front face
    ctx.fillStyle = '#64748b';
    ctx.fillRect(cx - bw / 2, cy - bh / 2, bw, bh);
    ctx.strokeRect(cx - bw / 2, cy - bh / 2, bw, bh);

    // Side face
    ctx.beginPath();
    ctx.moveTo(cx + bw / 2, cy - bh / 2);
    ctx.lineTo(cx + bw / 2 + d, cy - bh / 2 - d * 0.5);
    ctx.lineTo(cx + bw / 2 + d, cy + bh / 2 - d * 0.5);
    ctx.lineTo(cx + bw / 2, cy + bh / 2);
    ctx.closePath();
    ctx.fillStyle = '#475569';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draw Observer Eye symbol looking toward the grating
   */
  _drawObserverEye(x, y, scale = 1) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Eye outline (almond profile looking up-right)
    ctx.rotate(-0.32);
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.quadraticCurveTo(0, -10, 12, 0);
    ctx.quadraticCurveTo(0, 10, -12, 0);
    ctx.closePath();
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Iris & pupil facing toward grating (+x)
    ctx.beginPath();
    ctx.arc(4, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#0ea5e9';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, 0, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    ctx.restore();
  }

  /**
   * Convert hex color string to rgba()
   */
  _hexToRgba(hex, alpha) {
    const clean = String(hex || '#ffffff').replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) || 255;
    const g = parseInt(clean.substring(2, 4), 16) || 255;
    const b = parseInt(clean.substring(4, 6), 16) || 255;
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
  }
}
