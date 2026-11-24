/**
 * @file gas-spectrum-lab-simulator.js
 * @description Application Orchestrator for Activity 19.1: Hot Gas Spectrum Virtual Lab.
 * Coordinates state, safety interlocks, pointer-based meter-stick measurement,
 * IPST 8-column recording table (Auto & Manual Practice modes), and Canvas rendering.
 * Conforms to Physics Learning Standard (v1.13.0).
 */

import { APP_CONFIG } from '../shared/config.js';
import { CanvasRenderer } from '../adapters/canvas/canvas-renderer.js';
import { GasSpectrumLabPlotter } from '../adapters/canvas/gas-spectrum-lab-plotter.js';
import {
  GAS_SPECTRUM_LAB_DEFAULTS,
  IPST_SAMPLE_OBSERVATIONS,
  LAB_PROCEDURE_STEPS,
  LAB_UNLOCK_RULES,
  getGasLightSource
} from '../physics/gas-spectrum-lab-model.js';
import {
  computeLabSpectrumState,
  calculateWavelengthFromMeasurement,
  validateManualRowCalculation,
  areAllManualFieldsFilled,
  getCalculationFieldHints,
  evaluateRowRevealState,
  evaluateLabProgress
} from '../physics/gas-spectrum-lab-solver.js';

export class GasSpectrumLabSimulator {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new CanvasRenderer(canvas);
    this.plotter = new GasSpectrumLabPlotter(this.renderer);

    // Core Lab State
    this.state = {
      ...GAS_SPECTRUM_LAB_DEFAULTS,
      selectedLineId: 'h-red',
      measuredRightCm: null,
      measuredLeftCm: null,
      hoverCm: null,
      animTimeMs: 0
    };

    // Pending tube swap when blocked by high-voltage safety interlock
    this.pendingSwapSourceId = null;

    // Recorded IPST Lab Table rows
    this.recordedRows = [];
    this.nextRowId = 1;

    // Pedagogical tracking & inquiry-gated unlocks
    this.observedSources = new Set();
    this.reflections = { q1: '', q2: '', q3: '' };
    this.revealedQuestions = { q1: false, q2: false, q3: false };
    this.teacherDemoMode = false;

    // Animation loop state (subtle plasma glow shimmer when power is ON)
    this.animFrameId = null;
    this.isActive = false;

    this.renderer.onResize = () => {
      this.render();
    };

    this._bindCanvasPointerEvents();
    this.render();
    this.updateReadouts();
    this.renderTable();
  }

  /**
   * Bind pointer events on the canvas so students can hover/click on the meter stick
   * in the Eye-Through-Grating view to read and pin left/right spectral positions.
   */
  _bindCanvasPointerEvents() {
    if (!this.canvas) return;

    const getCanvasCoords = (evt) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    };

    const mapToMeterCm = (x, y) => {
      const box = this.plotter.eyepieceMeterRect;
      if (!box) return null;
      if (y < box.y - 8 || y > box.y + box.height + 16) return null;
      if (x < box.x - 10 || x > box.x + box.width + 10) return null;

      const rawCm = ((x - box.x) / box.width) * 100;
      const clamped = Math.max(0, Math.min(100, rawCm));
      // Snap to 0.1 cm precision
      return Math.round(clamped * 10) / 10;
    };

    this._onPointerMove = (evt) => {
      const { x, y } = getCanvasCoords(evt);
      const cm = mapToMeterCm(x, y);
      if (cm !== this.state.hoverCm) {
        this.state.hoverCm = cm;
        this.canvas.style.cursor = cm !== null ? 'crosshair' : 'default';
        this.render();
      }
    };

    this._onPointerLeave = () => {
      if (this.state.hoverCm !== null) {
        this.state.hoverCm = null;
        this.canvas.style.cursor = 'default';
        this.render();
      }
    };

    this._onPointerDown = (evt) => {
      const { x, y } = getCanvasCoords(evt);
      const cm = mapToMeterCm(x, y);
      if (cm === null) return;

      if (!this.state.powerOn) {
        this.showSafetyMessage('⚡ กรุณาเปิดสวิตช์ไฟแรงสูงก่อนจึงจะมองเห็นเส้นสเปกตรัมบนไม้เมตร', 'warning');
        return;
      }

      if (cm > 50.5) {
        this.state.measuredRightCm = cm;
      } else if (cm < 49.5) {
        this.state.measuredLeftCm = cm;
      }

      this._autoMatchNearestLine();
      this.render();
      this.updateReadouts();
    };

    this.canvas.addEventListener('pointermove', this._onPointerMove);
    this.canvas.addEventListener('pointerleave', this._onPointerLeave);
    this.canvas.addEventListener('pointerdown', this._onPointerDown);
  }

  /**
   * Automatically highlight the spectral line nearest to the student's measurement
   */
  _autoMatchNearestLine() {
    const proj = computeLabSpectrumState(this.state);
    if (proj.spectrumType !== 'line' || proj.projectedLines.length === 0) return;

    const targetX =
      this.state.measuredRightCm !== null
        ? Math.abs(this.state.measuredRightCm - 50)
        : this.state.measuredLeftCm !== null
        ? Math.abs(50 - this.state.measuredLeftCm)
        : null;

    if (targetX === null) return;

    let best = null;
    let bestDist = Infinity;
    for (const line of proj.projectedLines) {
      if (!line.isOnMeterStick) continue;
      const dist = Math.abs(line.displacementCm - targetX);
      if (dist < bestDist) {
        bestDist = dist;
        best = line;
      }
    }
    if (best && bestDist <= 4.0) {
      this.state.selectedLineId = best.id;
    }
  }

  /**
   * Toggle high-voltage power switch (Safety Interlock Rule #2)
   * @param {boolean} [forceState]
   * @returns {boolean} New power state
   */
  togglePower(forceState) {
    const next = typeof forceState === 'boolean' ? forceState : !this.state.powerOn;
    this.state.powerOn = next;
    this.pendingSwapSourceId = null;

    if (next) {
      this.observedSources.add(this.state.sourceId);
      this.showSafetyMessage(
        '⚡ เปิดแหล่งจ่ายไฟความต่างศักย์สูงแล้ว — ห้ามแตะขั้วหลอด และกรุณาปิดสวิตช์ก่อนเปลี่ยนหลอดบรรจุแก๊ส',
        'danger'
      );
      this.startAnimationLoop();
    } else {
      this.showSafetyMessage('✅ ปิดสวิตช์ไฟแรงสูงแล้ว สามารถเปลี่ยนหลอดบรรจุแก๊สได้อย่างปลอดภัย', 'safe');
      this.stopAnimationLoop();
    }

    this.render();
    this.updateReadouts();
    return this.state.powerOn;
  }

  /**
   * Attempt to switch gas tube (enforces safety warning when power is ON)
   * @param {string} sourceId
   * @param {boolean} [forcePowerOff=false]
   * @returns {boolean} True if swapped successfully
   */
  selectLightSource(sourceId, forcePowerOff = false) {
    if (sourceId === this.state.sourceId) return true;

    if (this.state.powerOn && !forcePowerOff) {
      this.pendingSwapSourceId = sourceId;
      const target = getGasLightSource(sourceId);
      this.showSafetyMessage(
        `⚠️ อันตรายไฟฟ้าแรงสูง! กรุณาปิดสวิตช์ก่อนเปลี่ยนเป็น "${target.nameTh}" (ตามคำแนะนำข้อ 2)`,
        'interlock',
        sourceId
      );
      return false;
    }

    if (forcePowerOff && this.state.powerOn) {
      this.state.powerOn = false;
      this.stopAnimationLoop();
    }

    this.pendingSwapSourceId = null;
    this.state.sourceId = sourceId;
    this.state.measuredRightCm = null;
    this.state.measuredLeftCm = null;

    const src = getGasLightSource(sourceId);
    this.state.selectedLineId = src.lines && src.lines.length > 0 ? src.lines[0].id : null;

    this.showSafetyMessage(
      `✅ ติดตั้ง "${src.nameTh}" เรียบร้อยแล้ว — กดเปิดสวิตช์ไฟแรงสูงเพื่อสังเกตสเปกตรัม`,
      'safe'
    );

    this.render();
    this.updateReadouts();
    return true;
  }

  setGratingLinesPerCm(linesPerCm) {
    this.state.gratingLinesPerCm = Math.max(3000, Math.min(10000, parseInt(linesPerCm, 10) || 5300));
    this.state.measuredRightCm = null;
    this.state.measuredLeftCm = null;
    this.render();
    this.updateReadouts();
  }

  setDistanceCm(distanceCm) {
    this.state.distanceCm = Math.max(50, Math.min(120, parseFloat(distanceCm) || 100));
    this.state.measuredRightCm = null;
    this.state.measuredLeftCm = null;
    this.render();
    this.updateReadouts();
  }

  setAmbientLight(ambientLight) {
    this.state.ambientLight = Math.max(0, Math.min(1, parseFloat(ambientLight)));
    this.render();
    this.updateReadouts();
  }

  setUseBlackBackdrop(enabled) {
    this.state.useBlackBackdrop = Boolean(enabled);
    this.render();
    this.updateReadouts();
  }

  setRealisticNoise(enabled) {
    this.state.realisticNoiseEnabled = Boolean(enabled);
    this.render();
    this.updateReadouts();
  }

  setViewMode(viewMode) {
    if (['split', 'setup', 'eyepiece'].includes(viewMode)) {
      this.state.viewMode = viewMode;
      this.render();
      this.updateReadouts();
    }
  }

  getLabProgress() {
    return evaluateLabProgress({
      ambientLight: this.state.ambientLight,
      useBlackBackdrop: this.state.useBlackBackdrop,
      powerOn: this.state.powerOn,
      sourceId: this.state.sourceId,
      measuredRightCm: this.state.measuredRightCm,
      measuredLeftCm: this.state.measuredLeftCm,
      observedSources: Array.from(this.observedSources),
      recordedRows: this.recordedRows,
      reflections: this.reflections,
      teacherDemoMode: this.teacherDemoMode
    });
  }

  setTableMode(tableMode) {
    if (!['auto', 'manual'].includes(tableMode)) return false;

    if (tableMode === 'auto') {
      const progress = this.getLabProgress();
      if (!progress.unlocks.autoMode) {
        this.showSafetyMessage(
          `🔒 โหมดคำนวณอัตโนมัติยังล็อกอยู่ — กรุณาฝึกคำนวณและกด "ตรวจ" ให้ถูกต้องด้วยตนเองอย่างน้อย ${LAB_UNLOCK_RULES.minManualSolvedForAutoMode} แถวก่อน (สำเร็จแล้ว ${progress.manualSolvedCount}/${LAB_UNLOCK_RULES.minManualSolvedForAutoMode} แถว)`,
          'warning'
        );
        return false;
      }
    }

    this.state.tableMode = tableMode;
    this.renderTable();
    this.updateReadouts();
    return true;
  }

  /**
   * Snap measurement pins directly to a chosen spectral line (helper for precision/accessibility)
   * @param {string} lineId
   */
  aimAtSpectralLine(lineId) {
    if (!this.state.powerOn) {
      this.togglePower(true);
    }

    const proj = computeLabSpectrumState(this.state);
    const line = proj.projectedLines.find((l) => l.id === lineId);
    if (!line || !line.isOnMeterStick) return;

    this.state.selectedLineId = line.id;
    this.state.measuredRightCm = Math.round(line.displayedRightCm * 10) / 10;
    this.state.measuredLeftCm = Math.round(line.displayedLeftCm * 10) / 10;
    this.render();
    this.updateReadouts();
  }

  clearMeasurementPins() {
    this.state.measuredRightCm = null;
    this.state.measuredLeftCm = null;
    this.render();
    this.updateReadouts();
  }

  /**
   * Record current left & right meter-stick measurements into the IPST 8-column table
   */
  recordCurrentMeasurement() {
    const proj = computeLabSpectrumState(this.state);
    if (!this.state.powerOn) {
      this.showSafetyMessage('⚡ กรุณาเปิดสวิตช์ไฟแรงสูงและวัดตำแหน่งเส้นสเปกตรัมก่อนบันทึกค่า', 'warning');
      return false;
    }

    if (this.state.measuredRightCm === null || this.state.measuredLeftCm === null) {
      this.showSafetyMessage(
        '📏 กรุณาคลิกวัดตำแหน่งเส้นสเปกตรัมทั้งฝั่งขวา (>50 cm) และฝั่งซ้าย (<50 cm) บนไม้เมตรให้ครบก่อนบันทึก',
        'warning'
      );
      return false;
    }

    const matchedLine =
      proj.spectrumType === 'line'
        ? proj.projectedLines.find((l) => l.id === this.state.selectedLineId) || null
        : null;

    const calc = calculateWavelengthFromMeasurement({
      rightPosCm: this.state.measuredRightCm,
      leftPosCm: this.state.measuredLeftCm,
      distanceCm: this.state.distanceCm,
      linesPerCm: this.state.gratingLinesPerCm,
      expectedNm: matchedLine ? matchedLine.wavelengthNm : null
    });

    this.recordedRows.push({
      id: this.nextRowId++,
      sourceId: proj.source.id,
      sourceNameTh: proj.source.shortNameTh,
      colorNameTh: matchedLine
        ? `${matchedLine.colorNameTh} (${matchedLine.label})`
        : proj.spectrumType === 'continuous'
        ? 'แถบต่อเนื่อง'
        : 'เส้นที่วัด',
      colorHex: matchedLine ? matchedLine.colorHex : '#22c55e',
      linesPerCm: this.state.gratingLinesPerCm,
      calc,
      manualInputs: { xAvgCm: '', hypotenuseCm: '', sinTheta: '', wavelengthNm: '' },
      manualValidation: null,
      attempts: 0,
      revealedByUser: false,
      lastCheckMessage: '',
      lastCheckHints: []
    });

    this.renderTable();
    this.updateReadouts();
    return true;
  }

  /**
   * Load IPST Activity 19.1 Textbook Reference Sample Data (6 rows: H2 & Ne).
   * Gated until learner observes both H2 + Ne and solves >= 2 rows manually (or Teacher Demo Mode).
   */
  loadIPSTSampleData() {
    const progress = this.getLabProgress();
    if (!progress.unlocks.ipstSample) {
      const missing = [];
      if (!this.observedSources.has('hydrogen')) missing.push('เปิดไฟสังเกตหลอด H₂');
      if (!this.observedSources.has('neon')) missing.push('เปิดไฟสังเกตหลอด Ne');
      if (progress.manualSolvedCount < LAB_UNLOCK_RULES.minManualSolvedForIpstSample) {
        missing.push(
          `คำนวณเองถูกต้อง (${progress.manualSolvedCount}/${LAB_UNLOCK_RULES.minManualSolvedForIpstSample} แถว)`
        );
      }
      this.showSafetyMessage(
        `🔒 ปุ่ม "โหลดตัวอย่างผล สสวท." ยังล็อกอยู่ — เพื่อเทียบผลของตนเอง กรุณา: ${missing.join(' และ ')}`,
        'warning'
      );
      return false;
    }

    this.recordedRows = IPST_SAMPLE_OBSERVATIONS.map((sample) => {
      const src = getGasLightSource(sample.sourceId);
      const calc = calculateWavelengthFromMeasurement({
        rightPosCm: sample.rightPosCm,
        leftPosCm: sample.leftPosCm,
        distanceCm: 100.0,
        linesPerCm: 5300,
        expectedNm: sample.expectedNm
      });

      return {
        id: this.nextRowId++,
        sourceId: sample.sourceId,
        sourceNameTh: src.shortNameTh,
        colorNameTh: sample.colorNameTh,
        colorHex: sample.colorHex,
        linesPerCm: 5300,
        calc,
        manualInputs: {
          xAvgCm: calc.xAvgCm.toFixed(2),
          hypotenuseCm: calc.hypotenuseCm.toFixed(1),
          sinTheta: calc.sinTheta.toFixed(2),
          wavelengthNm: calc.wavelengthNm.toFixed(0)
        },
        manualValidation: null,
        attempts: 0,
        revealedByUser: true,
        lastCheckMessage: '',
        lastCheckHints: []
      };
    });

    this.renderTable();
    this.updateReadouts();
    return true;
  }

  deleteRecordedRow(rowId) {
    this.recordedRows = this.recordedRows.filter((r) => r.id !== rowId);
    this.renderTable();
    this.updateReadouts();
  }

  clearRecordedTable() {
    this.recordedRows = [];
    this.renderTable();
    this.updateReadouts();
  }

  /**
   * Update a student's manual input value for a row in Manual Practice Mode
   */
  updateManualRowInput(rowId, field, value) {
    const row = this.recordedRows.find((r) => r.id === rowId);
    if (!row) return;
    row.manualInputs[field] = value;
  }

  /**
   * Check a row's manual calculations against exact physics values.
   * Requires all 4 fields to be filled before counting an attempt (anti-skip gate).
   */
  checkManualRow(rowId) {
    const row = this.recordedRows.find((r) => r.id === rowId);
    if (!row) return null;

    if (!areAllManualFieldsFilled(row.manualInputs)) {
      row.manualValidation = validateManualRowCalculation(row.manualInputs, row.calc);
      row.lastCheckMessage = '⚠️ กรุณากรอกตัวเลขให้ครบทั้ง 4 ช่องก่อนกด "ตรวจ" (ยังไม่นับเป็นครั้งที่ลอง)';
      row.lastCheckHints = [];
      this.renderTable();
      this.updateReadouts();
      return row.manualValidation;
    }

    row.attempts = (row.attempts || 0) + 1;
    row.manualValidation = validateManualRowCalculation(row.manualInputs, row.calc);

    if (row.manualValidation.allCorrect) {
      row.lastCheckMessage = '✅ ยอดเยี่ยม! คำนวณถูกต้องครบทั้ง 4 ช่อง';
      row.lastCheckHints = [];
    } else {
      row.lastCheckHints = getCalculationFieldHints(row.manualValidation.checks, row.calc);
      const revealState = evaluateRowRevealState(row, this.teacherDemoMode);
      row.lastCheckMessage = revealState.canReveal
        ? '❌ ยังมีช่องไม่ถูกต้อง — ดูคำใบ้สูตรด้านล่าง หรือกด "ดูวิธีทำ" ได้แล้ว'
        : `❌ ยังมีช่องไม่ถูกต้อง (ลองตรวจแล้ว ${revealState.attemptsUsed}/${revealState.requiredAttempts} ครั้ง) — ดูคำใบ้สูตรด้านล่างแล้วลองใหม่`;
    }

    this.renderTable();
    this.updateReadouts();
    return row.manualValidation;
  }

  /**
   * Reveal step-by-step answers for a manual practice row (only after >= 2 full attempts or Teacher Demo Mode)
   */
  revealManualRow(rowId) {
    const row = this.recordedRows.find((r) => r.id === rowId);
    if (!row) return false;

    const revealState = evaluateRowRevealState(row, this.teacherDemoMode);
    if (!revealState.canReveal) {
      this.showSafetyMessage(
        `🔒 ปุ่มเฉลยยังล็อกอยู่ — กรุณากรอกครบทั้ง 4 ช่องและลองกด "ตรวจ" อย่างน้อย ${revealState.requiredAttempts} ครั้งก่อน (ตอนนี้ ${revealState.attemptsUsed}/${revealState.requiredAttempts})`,
        'warning'
      );
      return false;
    }

    row.revealedByUser = true;
    row.manualInputs = {
      xAvgCm: row.calc.xAvgCm.toFixed(2),
      hypotenuseCm: row.calc.hypotenuseCm.toFixed(1),
      sinTheta: row.calc.sinTheta.toFixed(2),
      wavelengthNm: row.calc.wavelengthNm.toFixed(0)
    };
    row.manualValidation = validateManualRowCalculation(row.manualInputs, row.calc);
    row.lastCheckMessage = '📖 แสดงวิธีทำทีละขั้น (แถวนี้ไม่นับรวมในโควตาปลดล็อกโหมดอัตโนมัติ)';
    row.lastCheckHints = [
      `1) x̄ = (${row.calc.xRightCm.toFixed(1)} + ${row.calc.xLeftCm.toFixed(1)}) / 2 = ${row.calc.xAvgCm.toFixed(2)} cm`,
      `2) √(D²+x̄²) = √(${row.calc.distanceCm.toFixed(0)}² + ${row.calc.xAvgCm.toFixed(2)}²) = ${row.calc.hypotenuseCm.toFixed(1)} cm`,
      `3) sin θ = ${row.calc.xAvgCm.toFixed(2)} / ${row.calc.hypotenuseCm.toFixed(1)} = ${row.calc.sinTheta.toFixed(3)}`,
      `4) λ = d·sin θ = (${(row.calc.dCm * 1e4).toFixed(3)}×10⁻⁴ cm) × ${row.calc.sinTheta.toFixed(3)} = ${row.calc.wavelengthNm.toFixed(0)} nm`
    ];
    this.renderTable();
    this.updateReadouts();
    return true;
  }

  /**
   * Update student's reflection text for post-lab questions 1..3
   */
  updateReflection(qKey, text) {
    if (!['q1', 'q2', 'q3'].includes(qKey)) return;
    this.reflections[qKey] = String(text || '');
    this.updateReadouts();
  }

  /**
   * Toggle/reveal IPST post-lab answer for q1..q3 only when reflection & experiment gates pass
   */
  revealPostLabAnswer(qKey) {
    const map = { q1: 'question1', q2: 'question2', q3: 'question3' };
    const unlockKey = map[qKey];
    if (!unlockKey) return false;

    const progress = this.getLabProgress();
    if (!progress.unlocks[unlockKey]) {
      this.showSafetyMessage(
        '🔒 กรุณาทดลองสังเกตหลอดที่กำหนดและพิมพ์คำตอบของตนเองอย่างน้อย 15 ตัวอักษรก่อนเปิดเทียบแนวคำตอบ สสวท.',
        'warning'
      );
      return false;
    }

    this.revealedQuestions[qKey] = !this.revealedQuestions[qKey];
    this.updateReadouts();
    return true;
  }

  /**
   * Activate Teacher Presentation Demo Mode using configured passcode
   */
  activateTeacherDemoMode(passcode) {
    const expected = APP_CONFIG?.gasSpectrumLab?.teacherDemoPasscode || 'admin1234';
    if (String(passcode || '').trim() !== expected) {
      return false;
    }
    this.teacherDemoMode = true;
    this.showSafetyMessage(
      '🔑 เปิดโหมดสาธิตครูแล้ว — ปลดล็อกโหมดคำนวณอัตโนมัติ ตัวอย่างผล สสวท. เฉลยรายแถว และแนวคำตอบท้ายกิจกรรมชั่วคราว',
      'safe'
    );
    this.renderTable();
    this.updateReadouts();
    return true;
  }

  deactivateTeacherDemoMode() {
    this.teacherDemoMode = false;
    const progress = this.getLabProgress();
    if (this.state.tableMode === 'auto' && !progress.unlocks.autoMode) {
      this.state.tableMode = 'manual';
    }
    this.revealedQuestions = { q1: false, q2: false, q3: false };
    this.showSafetyMessage('🔒 ปิดโหมดสาธิตครูแล้ว — กลับสู่ระบบปลดล็อกตามลำดับการทดลองปกติ', 'info');
    this.renderTable();
    this.updateReadouts();
  }

  /**
   * Export recorded IPST table as UTF-8 BOM CSV file (Excel Thai-safe)
   */
  exportCSV() {
    if (this.recordedRows.length === 0) {
      this.showSafetyMessage('📋 ยังไม่มีข้อมูลในตาราง กรุณาบันทึกผลการทดลองก่อนส่งออก CSV', 'warning');
      return;
    }

    const headers = [
      'แหล่งกำเนิด',
      'สีของเส้นสเปกตรัม',
      'ตำแหน่งขวา (cm)',
      'ระยะ x ขวา (cm)',
      'ตำแหน่งซ้าย (cm)',
      'ระยะ x ซ้าย (cm)',
      'ระยะเฉลี่ย x_bar (cm)',
      'sqrt(D^2 + x_bar^2) (cm)',
      'sin(theta)',
      'lambda (cm)',
      'lambda (nm)'
    ];

    const lines = [headers.join(',')];
    for (const row of this.recordedRows) {
      const c = row.calc;
      lines.push(
        [
          `"${row.sourceNameTh}"`,
          `"${row.colorNameTh}"`,
          c.rightPosCm.toFixed(1),
          c.xRightCm.toFixed(1),
          c.leftPosCm.toFixed(1),
          c.xLeftCm.toFixed(1),
          c.xAvgCm.toFixed(2),
          c.hypotenuseCm.toFixed(1),
          c.sinTheta.toFixed(3),
          c.wavelengthCm.toExponential(2),
          c.wavelengthNm.toFixed(1)
        ].join(',')
      );
    }

    if (typeof Blob !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'activity-19-1-gas-spectrum-results.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Display safety / operational feedback banner in UI
   */
  showSafetyMessage(message, level = 'info', pendingSwapId = null) {
    if (typeof document === 'undefined') return;
    const banner = document.getElementById('lab19-safety-banner');
    if (!banner) return;

    const styles = {
      danger: 'bg-red-950/90 border-red-500/60 text-red-100',
      interlock: 'bg-amber-950/95 border-amber-400 text-amber-100',
      warning: 'bg-amber-50 border-amber-300 text-amber-900',
      safe: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      info: 'bg-slate-100 border-slate-300 text-slate-800'
    };

    banner.className = `rounded-xl px-4 py-2.5 text-xs font-semibold border flex flex-wrap items-center justify-between gap-2 transition-all ${styles[level] || styles.info}`;
    banner.innerHTML = `
      <span>${message}</span>
      ${
        pendingSwapId
          ? `<button type="button" onclick="forceSwapLabTube('${pendingSwapId}')" class="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer transition">
               <i class="fa-solid fa-power-off mr-1"></i> ปิดสวิตช์และเปลี่ยนหลอด
             </button>`
          : ''
      }
    `;
  }

  /**
   * Animation loop for subtle gas discharge tube glow when power is ON
   */
  startAnimationLoop() {
    if (this.animFrameId || typeof requestAnimationFrame === 'undefined') return;
    this.isActive = true;
    const tick = (now) => {
      if (!this.isActive || !this.state.powerOn) {
        this.animFrameId = null;
        return;
      }
      this.state.animTimeMs = now;
      this.render();
      this.animFrameId = requestAnimationFrame(tick);
    };
    this.animFrameId = requestAnimationFrame(tick);
  }

  stopAnimationLoop() {
    this.isActive = false;
    if (this.animFrameId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animFrameId);
    }
    this.animFrameId = null;
  }

  render() {
    const proj = computeLabSpectrumState(this.state);
    this.plotter.render(proj, this.state);
  }

  /**
   * Synchronize all UI controls, badges, quick-aim line buttons, and live readouts
   */
  updateReadouts() {
    if (typeof document === 'undefined') return;
    const proj = computeLabSpectrumState(this.state);
    const progress = this.getLabProgress();

    // Power Switch Button styling
    const btnPower = document.getElementById('btn-lab19-power');
    if (btnPower) {
      if (this.state.powerOn) {
        btnPower.className =
          'px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/30 cursor-pointer transition flex items-center gap-2';
        btnPower.innerHTML = '<i class="fa-solid fa-bolt"></i> สวิตช์ไฟแรงสูง: เปิด (ON)';
      } else {
        btnPower.className =
          'px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer transition flex items-center gap-2';
        btnPower.innerHTML = '<i class="fa-solid fa-power-off"></i> เปิดสวิตช์ไฟแรงสูง (OFF)';
      }
    }

    // Active Light Source buttons
    ['hydrogen', 'neon', 'incandescent', 'helium', 'mercury'].forEach((id) => {
      const btn = document.getElementById(`btn-lab19-src-${id}`);
      if (!btn) return;
      if (id === this.state.sourceId) {
        btn.className =
          'px-3 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-sm border border-indigo-500 cursor-pointer transition';
      } else {
        btn.className =
          'px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer transition';
      }
    });

    // View mode buttons
    ['split', 'setup', 'eyepiece'].forEach((mode) => {
      const btn = document.getElementById(`btn-lab19-view-${mode}`);
      if (!btn) return;
      if (mode === this.state.viewMode) {
        btn.className =
          'px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 text-white shadow-sm cursor-pointer transition';
      } else {
        btn.className =
          'px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer transition';
      }
    });

    // Table mode buttons (Manual is 1st & default; Auto is gated)
    const btnManual = document.getElementById('btn-lab19-tmode-manual');
    if (btnManual) {
      btnManual.className =
        this.state.tableMode === 'manual'
          ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-sm cursor-pointer transition'
          : 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition';
    }

    const btnAuto = document.getElementById('btn-lab19-tmode-auto');
    if (btnAuto) {
      if (!progress.unlocks.autoMode) {
        btnAuto.className =
          'px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 cursor-pointer transition flex items-center gap-1';
        btnAuto.innerHTML = `<i class="fa-solid fa-lock text-[10px]"></i> โหมดคำนวณอัตโนมัติ (${progress.manualSolvedCount}/2)`;
      } else {
        btnAuto.className =
          this.state.tableMode === 'auto'
            ? 'px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-sm cursor-pointer transition flex items-center gap-1'
            : 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer transition flex items-center gap-1';
        btnAuto.innerHTML = '<i class="fa-solid fa-unlock text-[10px] text-emerald-500"></i> โหมดคำนวณอัตโนมัติ';
      }
    }

    const btnSample = document.getElementById('btn-lab19-load-sample');
    if (btnSample) {
      if (!progress.unlocks.ipstSample) {
        btnSample.className =
          'px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-400 border border-slate-200 cursor-pointer transition flex items-center gap-1';
        btnSample.innerHTML = '<i class="fa-solid fa-lock text-[10px]"></i> ตัวอย่างผล สสวท.';
      } else {
        btnSample.className =
          'px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 cursor-pointer transition flex items-center gap-1';
        btnSample.innerHTML = '<i class="fa-solid fa-book-bookmark"></i> โหลดตัวอย่างผล สสวท.';
      }
    }

    const gateHint = document.getElementById('lab19-table-gate-hint');
    if (gateHint) {
      if (this.teacherDemoMode) {
        gateHint.textContent = '🔑 โหมดสาธิตครูเปิดใช้งานอยู่ — ปลดล็อกทุกโหมดและเฉลยชั่วคราว';
        gateHint.className = 'text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg';
      } else if (!progress.unlocks.autoMode || !progress.unlocks.ipstSample) {
        const h2Check = this.observedSources.has('hydrogen') ? '✓ H₂' : '○ H₂';
        const neCheck = this.observedSources.has('neon') ? '✓ Ne' : '○ Ne';
        gateHint.textContent = `🔒 เกณฑ์ปลดล็อก: คำนวณเองถูก ${progress.manualSolvedCount}/2 แถว (ปลดล็อกโหมดอัตโนมัติ) | สังเกตหลอด ${h2Check}, ${neCheck} + ถูก 2 แถว (ปลดล็อกตัวอย่างผล สสวท.)`;
        gateHint.className = 'text-[11px] text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg';
      } else {
        gateHint.textContent = '🔓 ปลดล็อกครบทุกโหมดแล้ว — สามารถเทียบผลการทดลองกับตัวอย่าง สสวท. หรือใช้โหมดอัตโนมัติกับหลอดเสริมได้';
        gateHint.className = 'text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg';
      }
    }

    // Teacher demo button state
    const btnTeacher = document.getElementById('btn-lab19-teacher-mode');
    if (btnTeacher) {
      if (this.teacherDemoMode) {
        btnTeacher.className =
          'px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer transition flex items-center gap-1';
        btnTeacher.innerHTML = '<i class="fa-solid fa-key"></i> ปิดโหมดสาธิตครู';
      } else {
        btnTeacher.className =
          'px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200 cursor-pointer transition flex items-center gap-1';
        btnTeacher.innerHTML = '<i class="fa-solid fa-key"></i> โหมดสาธิตครู';
      }
    }

    // Parameter value readouts
    const elDistVal = document.getElementById('lab19-val-distance');
    if (elDistVal) elDistVal.textContent = `${this.state.distanceCm.toFixed(0)} cm`;

    const elGratingD = document.getElementById('lab19-val-d');
    if (elGratingD) {
      elGratingD.textContent = `${(proj.spacing.dCm * 1e4).toFixed(3)} × 10⁻⁴ cm`;
    }

    const elAmbient = document.getElementById('lab19-val-ambient');
    if (elAmbient) {
      const pct = Math.round(this.state.ambientLight * 100);
      const desc = pct <= 20 ? 'ห้องมืด (เห็นชัดที่สุด)' : pct <= 55 ? 'แสงสลัว' : 'ห้องสว่าง (เส้นจางลง)';
      elAmbient.textContent = `${pct}% — ${desc}`;
    }

    const elSrcDesc = document.getElementById('lab19-source-desc');
    if (elSrcDesc) {
      elSrcDesc.textContent = proj.source.descriptionTh;
    }

    // Live measurement readout bar (hide computed x̄ & λ in manual mode unless Teacher Demo Mode)
    const elRight = document.getElementById('lab19-meas-right');
    const elLeft = document.getElementById('lab19-meas-left');
    const elXAvg = document.getElementById('lab19-meas-xavg');
    const elLambda = document.getElementById('lab19-meas-lambda');

    if (elRight) {
      elRight.textContent =
        this.state.measuredRightCm !== null
          ? `${this.state.measuredRightCm.toFixed(1)} cm (x=${Math.abs(this.state.measuredRightCm - 50).toFixed(1)})`
          : 'ยังไม่วัด (คลิกฝั่งขวา)';
    }
    if (elLeft) {
      elLeft.textContent =
        this.state.measuredLeftCm !== null
          ? `${this.state.measuredLeftCm.toFixed(1)} cm (x=${Math.abs(50 - this.state.measuredLeftCm).toFixed(1)})`
          : 'ยังไม่วัด (คลิกฝั่งซ้าย)';
    }

    const hideLiveAnswers = this.state.tableMode === 'manual' && !this.teacherDemoMode;
    if (this.state.measuredRightCm !== null && this.state.measuredLeftCm !== null) {
      const liveCalc = calculateWavelengthFromMeasurement({
        rightPosCm: this.state.measuredRightCm,
        leftPosCm: this.state.measuredLeftCm,
        distanceCm: this.state.distanceCm,
        linesPerCm: this.state.gratingLinesPerCm
      });
      if (elXAvg) {
        elXAvg.textContent = hideLiveAnswers
          ? 'ซ่อนในโหมดฝึกคำนวณ (ลองหาค่าเฉลี่ยเอง)'
          : `${liveCalc.xAvgCm.toFixed(2)} cm`;
      }
      if (elLambda) {
        elLambda.textContent = hideLiveAnswers
          ? 'ซ่อนในโหมดฝึกคำนวณ (บันทึกลงตารางแล้วคำนวณ λ)'
          : `${liveCalc.wavelengthNm.toFixed(0)} nm (${(liveCalc.wavelengthCm * 1e5).toFixed(1)} × 10⁻⁵ cm)`;
      }
    } else {
      if (elXAvg) elXAvg.textContent = '-';
      if (elLambda) elLambda.textContent = '-';
    }

    // Quick-Aim Line Selector buttons for current gas tube
    const quickAimWrap = document.getElementById('lab19-quick-aim-wrap');
    if (quickAimWrap) {
      if (proj.spectrumType === 'continuous') {
        quickAimWrap.innerHTML =
          '<span class="text-xs text-slate-500 italic">หลอดไส้ให้แถบสีรุ้งต่อเนื่อง (400–700 nm) — คลิกเล็งสีใดก็ได้บนไม้เมตรเพื่อวัดความยาวคลื่น</span>';
      } else {
        const primaryLines = proj.projectedLines.filter((l) => l.primary);
        quickAimWrap.innerHTML = primaryLines
          .map((line) => {
            const disabled = !line.isOnMeterStick;
            const activeRing = line.id === this.state.selectedLineId ? 'ring-2 ring-amber-400' : '';
            return `
              <button type="button"
                onclick="aimLabSpectralLine('${line.id}')"
                ${disabled ? 'disabled' : ''}
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-700 bg-slate-900 text-white hover:bg-slate-800 cursor-pointer transition flex items-center gap-1.5 ${activeRing} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}">
                <span class="w-2.5 h-2.5 rounded-full inline-block" style="background:${line.colorHex}; box-shadow:0 0 6px ${line.colorHex};"></span>
                <span>${line.colorNameTh} (${line.label})</span>
                ${line.isFaint ? '<span class="text-[10px] text-purple-300">*จาง</span>' : ''}
              </button>
            `;
          })
          .join('');
      }
    }

    this.renderProcedureGuide(progress);
    this.renderPostLabQuestions(progress);
  }

  /**
   * Render Step-by-Step Procedure Guide Card (6 Steps with live auto-checks)
   */
  renderProcedureGuide(progress = this.getLabProgress()) {
    if (typeof document === 'undefined') return;
    const elLabel = document.getElementById('lab19-progress-label');
    const elBar = document.getElementById('lab19-progress-bar');
    const elSteps = document.getElementById('lab19-procedure-steps');

    const pct = Math.round((progress.completedCount / progress.totalSteps) * 100);
    if (elLabel) {
      elLabel.textContent = `ความคืบหน้า: ${progress.completedCount} / ${progress.totalSteps} ขั้นตอน (${pct}%)`;
    }
    if (elBar) {
      elBar.style.width = `${pct}%`;
    }

    if (elSteps) {
      const firstIncompleteIdx = progress.stepStatus.findIndex((done) => !done);
      elSteps.innerHTML = LAB_PROCEDURE_STEPS.map((item, idx) => {
        const done = progress.stepStatus[idx];
        const isCurrent = idx === firstIncompleteIdx;
        const cardStyle = done
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
          : isCurrent
          ? 'bg-indigo-50/80 border-indigo-400 ring-1 ring-indigo-300 text-slate-800'
          : 'bg-white border-slate-200 text-slate-700';
        const badgeStyle = done
          ? 'bg-emerald-600 text-white'
          : isCurrent
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-200 text-slate-600';

        return `
          <div class="p-3 rounded-xl border ${cardStyle} flex items-start gap-2.5 transition">
            <div class="w-6 h-6 rounded-full ${badgeStyle} text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              ${done ? '<i class="fa-solid fa-check"></i>' : item.step}
            </div>
            <div class="min-w-0">
              <div class="text-xs font-bold flex items-center gap-1.5 flex-wrap">
                <span>${item.titleTh}</span>
                ${isCurrent && !done ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600 text-white">ขั้นปัจจุบัน</span>' : ''}
              </div>
              <p class="text-[11px] text-slate-600 leading-relaxed mt-0.5">${item.instructionTh}</p>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  /**
   * Render Post-Lab Discussion Questions (3 Questions gated by reflection & observation)
   */
  renderPostLabQuestions(progress = this.getLabProgress()) {
    if (typeof document === 'undefined') return;
    const minLen = LAB_UNLOCK_RULES.minReflectionLength;

    const specs = [
      {
        key: 'q1',
        unlockKey: 'question1',
        hintText: 'เงื่อนไข: เปิดไฟสังเกตทั้งหลอดแก๊ส + หลอดไฟฟ้าทั่วไป และพิมพ์คำตอบของตนเอง ≥ 15 ตัวอักษร'
      },
      {
        key: 'q2',
        unlockKey: 'question2',
        hintText: 'เงื่อนไข: เปิดไฟสังเกตทั้งหลอดไฮโดรเจน (H₂) + นีออน (Ne) และพิมพ์คำตอบของตนเอง ≥ 15 ตัวอักษร'
      },
      {
        key: 'q3',
        unlockKey: 'question3',
        hintText: 'เงื่อนไข: คำนวณไฮโดรเจนถูกต้องด้วยตนเอง ≥ 2 แถว และพิมพ์คำตอบของตนเอง ≥ 15 ตัวอักษร'
      }
    ];

    specs.forEach(({ key, unlockKey, hintText }) => {
      const unlocked = progress.unlocks[unlockKey];
      const len = String(this.reflections[key] || '').trim().length;
      const elStatus = document.getElementById(`lab19-${key}-status`);
      const btnReveal = document.getElementById(`btn-lab19-reveal-${key}`);
      const boxAnswer = document.getElementById(`lab19-answer-${key}`);

      if (elStatus) {
        if (this.teacherDemoMode) {
          elStatus.textContent = '🔑 ปลดล็อกโดยโหมดสาธิตครู';
          elStatus.className = 'text-[10px] font-bold text-amber-700';
        } else if (unlocked) {
          elStatus.textContent = '🔓 พร้อมเทียบแนวคำตอบ สสวท. แล้ว';
          elStatus.className = 'text-[10px] font-bold text-emerald-700';
        } else {
          elStatus.textContent = `${hintText} (พิมพ์แล้ว ${len}/${minLen})`;
          elStatus.className = 'text-[10px] text-slate-500';
        }
      }

      if (btnReveal) {
        if (unlocked) {
          btnReveal.className =
            'px-3 py-1 rounded-lg text-[11px] font-bold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer transition flex items-center gap-1';
          btnReveal.innerHTML = this.revealedQuestions[key]
            ? '<i class="fa-solid fa-eye-slash"></i> ซ่อนแนวคำตอบ'
            : '<i class="fa-solid fa-unlock"></i> เทียบแนวคำตอบ สสวท.';
        } else {
          btnReveal.className =
            'px-3 py-1 rounded-lg text-[11px] font-semibold bg-slate-200 text-slate-500 cursor-pointer transition flex items-center gap-1';
          btnReveal.innerHTML = '<i class="fa-solid fa-lock"></i> เทียบแนวคำตอบ สสวท.';
        }
      }

      if (boxAnswer) {
        if (unlocked && this.revealedQuestions[key]) {
          boxAnswer.classList.remove('hidden');
        } else {
          boxAnswer.classList.add('hidden');
        }
      }
    });
  }

  /**
   * Render IPST 8-Column Data Table (supports both Auto-Calculate and Manual Practice modes)
   */
  renderTable() {
    if (typeof document === 'undefined') return;
    const tbody = document.getElementById('lab19-table-body');
    if (!tbody) return;

    if (this.recordedRows.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" class="py-6 text-center text-slate-400 text-xs">
            ยังไม่มีข้อมูลบันทึก — ทำตามขั้นตอนที่ 1–4 แล้วกด <strong>"บันทึกค่าลงตาราง"</strong> เพื่อฝึกคำนวณค่าในตารางด้วยตนเอง
          </td>
        </tr>
      `;
      return;
    }

    const isManual = this.state.tableMode === 'manual';

    tbody.innerHTML = this.recordedRows
      .map((row) => {
        const c = row.calc;
        const v = row.manualValidation;
        const revealState = evaluateRowRevealState(row, this.teacherDemoMode);

        const inputClass = (field) => {
          const base =
            'w-16 px-1.5 py-1 text-center font-mono text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ';
          if (!v) return base + 'bg-white border-slate-300 text-slate-800';
          const status = v.checks[field]?.status;
          if (status === 'correct') return base + 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
          return base + 'bg-red-50 border-red-400 text-red-800';
        };

        const sciCm = `${(c.wavelengthCm * 1e5).toFixed(1)}×10⁻⁵`;

        const mainRowHtml = `
          <tr class="border-b border-slate-200 hover:bg-slate-50/80 text-xs">
            <td class="px-2 py-2 font-bold text-slate-800 whitespace-nowrap">${row.sourceNameTh}</td>
            <td class="px-2 py-2 whitespace-nowrap">
              <span class="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${row.colorHex};"></span>
                ${row.colorNameTh}
              </span>
            </td>
            <td class="px-2 py-2 text-center font-mono text-slate-700">${c.rightPosCm.toFixed(1)}</td>
            <td class="px-2 py-2 text-center font-mono font-semibold text-amber-700">${c.xRightCm.toFixed(1)}</td>
            <td class="px-2 py-2 text-center font-mono text-slate-700">${c.leftPosCm.toFixed(1)}</td>
            <td class="px-2 py-2 text-center font-mono font-semibold text-sky-700">${c.xLeftCm.toFixed(1)}</td>
            ${
              isManual
                ? `
              <td class="px-1.5 py-2 text-center">
                <input type="number" step="0.05" placeholder="x̄" value="${row.manualInputs.xAvgCm}"
                  oninput="updateLabManualInput(${row.id}, 'xAvgCm', this.value)"
                  class="${inputClass('xAvgCm')}" />
              </td>
              <td class="px-1.5 py-2 text-center">
                <input type="number" step="0.1" placeholder="√(D²+x̄²)" value="${row.manualInputs.hypotenuseCm}"
                  oninput="updateLabManualInput(${row.id}, 'hypotenuseCm', this.value)"
                  class="${inputClass('hypotenuseCm')}" />
              </td>
              <td class="px-1.5 py-2 text-center">
                <input type="number" step="0.01" placeholder="sin θ" value="${row.manualInputs.sinTheta}"
                  oninput="updateLabManualInput(${row.id}, 'sinTheta', this.value)"
                  class="${inputClass('sinTheta')}" />
              </td>
              <td class="px-1.5 py-2 text-center">
                <div class="flex flex-col items-center gap-1">
                  <input type="number" step="1" placeholder="λ (nm)" value="${row.manualInputs.wavelengthNm}"
                    oninput="updateLabManualInput(${row.id}, 'wavelengthNm', this.value)"
                    class="${inputClass('wavelengthNm')} w-20" />
                  <div class="flex gap-1 items-center">
                    <button type="button" onclick="checkLabManualRow(${row.id})"
                      class="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold cursor-pointer">
                      ตรวจ
                    </button>
                    ${
                      revealState.canReveal
                        ? `<button type="button" onclick="revealLabManualRow(${row.id})"
                             class="px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[10px] font-bold cursor-pointer">
                             🔓 ดูวิธีทำ
                           </button>`
                        : `<button type="button" onclick="revealLabManualRow(${row.id})"
                             title="กรอกครบ 4 ช่องแล้วลองตรวจอย่างน้อย ${revealState.requiredAttempts} ครั้งเพื่อปลดล็อก"
                             class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200 text-[10px] font-semibold cursor-pointer">
                             🔒 เฉลย (${revealState.attemptsUsed}/${revealState.requiredAttempts})
                           </button>`
                    }
                  </div>
                </div>
              </td>
            `
                : `
              <td class="px-2 py-2 text-center font-mono font-bold text-slate-800">${c.xAvgCm.toFixed(2)}</td>
              <td class="px-2 py-2 text-center font-mono text-slate-700">${c.hypotenuseCm.toFixed(1)}</td>
              <td class="px-2 py-2 text-center font-mono text-indigo-700 font-semibold">${c.sinTheta.toFixed(2)}</td>
              <td class="px-2 py-2 text-center font-mono">
                <div class="font-bold text-emerald-700">${sciCm} cm</div>
                <div class="text-[10px] text-slate-500">(${c.wavelengthNm.toFixed(0)} nm${
                    c.percentError !== null ? ` • คลาดเคลื่อน ${c.percentError.toFixed(1)}%` : ''
                  })</div>
              </td>
            `
            }
            <td class="px-2 py-2 text-center">
              <button type="button" onclick="deleteLabRecordedRow(${row.id})"
                class="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition" title="ลบแถวนี้">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </td>
          </tr>
        `;

        const hasFeedback = isManual && (row.lastCheckMessage || (row.lastCheckHints && row.lastCheckHints.length > 0));
        const feedbackRowHtml = hasFeedback
          ? `
          <tr class="bg-slate-50/90 border-b border-slate-200 text-[11px]">
            <td colspan="11" class="px-3 py-2">
              <div class="font-bold ${v?.allCorrect && !row.revealedByUser ? 'text-emerald-700' : row.revealedByUser ? 'text-indigo-700' : 'text-amber-800'}">
                ${row.lastCheckMessage}
              </div>
              ${
                row.lastCheckHints && row.lastCheckHints.length > 0
                  ? `<div class="mt-1 space-y-0.5 text-slate-600 font-mono text-[10.5px]">
                      ${row.lastCheckHints.map((h) => `<div>${h}</div>`).join('')}
                     </div>`
                  : ''
              }
            </td>
          </tr>
        `
          : '';

        return mainRowHtml + feedbackRowHtml;
      })
      .join('');
  }

  destroy() {
    this.stopAnimationLoop();
    if (this.canvas) {
      this.canvas.removeEventListener('pointermove', this._onPointerMove);
      this.canvas.removeEventListener('pointerleave', this._onPointerLeave);
      this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    }
    this.renderer.destroy();
  }
}
