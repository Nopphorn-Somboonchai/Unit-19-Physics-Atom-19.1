/**
 * @file gas-spectrum-lab-simulator.js
 * @description Application Orchestrator for Activity 19.1: Hot Gas Spectrum Virtual Lab.
 * Coordinates state, safety interlocks, pointer-based meter-stick measurement,
 * IPST 8-column recording table (Auto & Manual Practice modes), and Canvas rendering.
 * Conforms to Physics Learning Standard (v1.13.0).
 */

import { CanvasRenderer } from '../adapters/canvas/canvas-renderer.js';
import { GasSpectrumLabPlotter } from '../adapters/canvas/gas-spectrum-lab-plotter.js';
import {
  GAS_SPECTRUM_LAB_DEFAULTS,
  IPST_SAMPLE_OBSERVATIONS,
  getGasLightSource
} from '../physics/gas-spectrum-lab-model.js';
import {
  computeLabSpectrumState,
  calculateWavelengthFromMeasurement,
  validateManualRowCalculation
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

  setTableMode(tableMode) {
    if (['auto', 'manual'].includes(tableMode)) {
      this.state.tableMode = tableMode;
      this.renderTable();
      this.updateReadouts();
    }
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
      manualValidation: null
    });

    this.renderTable();
    return true;
  }

  /**
   * Load IPST Activity 19.1 Textbook Reference Sample Data (6 rows: H2 & Ne)
   */
  loadIPSTSampleData() {
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
        manualInputs: { xAvgCm: '', hypotenuseCm: '', sinTheta: '', wavelengthNm: '' },
        manualValidation: null
      };
    });

    this.renderTable();
  }

  deleteRecordedRow(rowId) {
    this.recordedRows = this.recordedRows.filter((r) => r.id !== rowId);
    this.renderTable();
  }

  clearRecordedTable() {
    this.recordedRows = [];
    this.renderTable();
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
   * Check a row's manual calculations against exact physics values
   */
  checkManualRow(rowId) {
    const row = this.recordedRows.find((r) => r.id === rowId);
    if (!row) return null;
    row.manualValidation = validateManualRowCalculation(row.manualInputs, row.calc);
    this.renderTable();
    return row.manualValidation;
  }

  /**
   * Reveal exact answers for a manual practice row
   */
  revealManualRow(rowId) {
    const row = this.recordedRows.find((r) => r.id === rowId);
    if (!row) return;
    row.manualInputs = {
      xAvgCm: row.calc.xAvgCm.toFixed(2),
      hypotenuseCm: row.calc.hypotenuseCm.toFixed(1),
      sinTheta: row.calc.sinTheta.toFixed(2),
      wavelengthNm: row.calc.wavelengthNm.toFixed(0)
    };
    row.manualValidation = validateManualRowCalculation(row.manualInputs, row.calc);
    this.renderTable();
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

    // Table mode buttons
    ['auto', 'manual'].forEach((mode) => {
      const btn = document.getElementById(`btn-lab19-tmode-${mode}`);
      if (!btn) return;
      if (mode === this.state.tableMode) {
        btn.className =
          'px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-sm cursor-pointer transition';
      } else {
        btn.className =
          'px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer transition';
      }
    });

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

    // Live measurement readout bar
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

    if (this.state.measuredRightCm !== null && this.state.measuredLeftCm !== null) {
      const liveCalc = calculateWavelengthFromMeasurement({
        rightPosCm: this.state.measuredRightCm,
        leftPosCm: this.state.measuredLeftCm,
        distanceCm: this.state.distanceCm,
        linesPerCm: this.state.gratingLinesPerCm
      });
      if (elXAvg) elXAvg.textContent = `${liveCalc.xAvgCm.toFixed(2)} cm`;
      if (elLambda) {
        elLambda.textContent =
          this.state.tableMode === 'manual'
            ? 'โหมดฝึกคำนวณ (บันทึกเพื่อลองคำนวณเอง)'
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
            ยังไม่มีข้อมูลบันทึก — เปิดสวิตช์ไฟแรงสูง เล็งตำแหน่งซ้าย-ขวาบนไม้เมตรแล้วกด <strong>"บันทึกค่าลงตาราง"</strong>
            หรือกด <strong>"โหลดตัวอย่างผล สสวท."</strong>
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

        const inputClass = (field) => {
          const base =
            'w-16 px-1.5 py-1 text-center font-mono text-xs rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ';
          if (!v) return base + 'bg-white border-slate-300 text-slate-800';
          const status = v.checks[field]?.status;
          if (status === 'correct') return base + 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
          return base + 'bg-red-50 border-red-400 text-red-800';
        };

        const sciCm = `${(c.wavelengthCm * 1e5).toFixed(1)}×10⁻⁵`;

        return `
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
                  <div class="flex gap-1">
                    <button type="button" onclick="checkLabManualRow(${row.id})"
                      class="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold cursor-pointer">
                      ตรวจ
                    </button>
                    <button type="button" onclick="revealLabManualRow(${row.id})"
                      class="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold cursor-pointer">
                      เฉลย
                    </button>
                  </div>
                  ${
                    v
                      ? `<span class="text-[10px] font-bold ${v.allCorrect ? 'text-emerald-600' : 'text-red-600'}">
                          ${v.allCorrect ? '✅ ถูกต้องครบถ้วน!' : '❌ ลองตรวจสอบช่องสีแดง'}
                         </span>`
                      : ''
                  }
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
