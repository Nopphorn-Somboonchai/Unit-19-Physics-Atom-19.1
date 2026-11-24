/**
 * @file control-panel.js
 * @description UI Adapter connecting DOM inputs (sliders, buttons, presets) to Unit 19 Simulator Orchestrators.
 * Conforms to Physics Learning Standard (v1.13.0).
 */

export class ControlPanelAdapter {
  /**
   * Bind controls for Activity 19.1 Virtual Lab (Hot Gas Spectrum Experiment)
   * @param {Object} simulator - GasSpectrumLabSimulator instance
   */
  static bindGasSpectrumLabControls(simulator) {
    const btnPower = document.getElementById('btn-lab19-power');
    const selectGrating = document.getElementById('select-lab19-grating');
    const sliderDistance = document.getElementById('slider-lab19-distance');
    const sliderAmbient = document.getElementById('slider-lab19-ambient');
    const cbBackdrop = document.getElementById('cb-lab19-backdrop');
    const cbNoise = document.getElementById('cb-lab19-noise');
    const btnClearPins = document.getElementById('btn-lab19-clear-pins');
    const btnRecord = document.getElementById('btn-lab19-record');
    const btnLoadSample = document.getElementById('btn-lab19-load-sample');
    const btnExportCsv = document.getElementById('btn-lab19-export-csv');
    const btnClearTable = document.getElementById('btn-lab19-clear-table');

    if (btnPower) {
      btnPower.addEventListener('click', () => simulator.togglePower());
    }

    ['hydrogen', 'neon', 'incandescent', 'helium', 'mercury'].forEach((srcId) => {
      const btn = document.getElementById(`btn-lab19-src-${srcId}`);
      if (btn) {
        btn.addEventListener('click', () => simulator.selectLightSource(srcId, false));
      }
    });

    ['split', 'setup', 'eyepiece'].forEach((mode) => {
      const btn = document.getElementById(`btn-lab19-view-${mode}`);
      if (btn) {
        btn.addEventListener('click', () => simulator.setViewMode(mode));
      }
    });

    ['auto', 'manual'].forEach((tmode) => {
      const btn = document.getElementById(`btn-lab19-tmode-${tmode}`);
      if (btn) {
        btn.addEventListener('click', () => simulator.setTableMode(tmode));
      }
    });

    if (selectGrating) {
      selectGrating.addEventListener('change', (e) => {
        simulator.setGratingLinesPerCm(parseInt(e.target.value, 10));
      });
    }

    if (sliderDistance) {
      sliderDistance.addEventListener('input', (e) => {
        simulator.setDistanceCm(parseFloat(e.target.value));
      });
    }

    if (sliderAmbient) {
      sliderAmbient.addEventListener('input', (e) => {
        simulator.setAmbientLight(parseFloat(e.target.value));
      });
    }

    if (cbBackdrop) {
      cbBackdrop.addEventListener('change', (e) => {
        simulator.setUseBlackBackdrop(e.target.checked);
      });
    }

    if (cbNoise) {
      cbNoise.addEventListener('change', (e) => {
        simulator.setRealisticNoise(e.target.checked);
      });
    }

    if (btnClearPins) {
      btnClearPins.addEventListener('click', () => simulator.clearMeasurementPins());
    }

    if (btnRecord) {
      btnRecord.addEventListener('click', () => simulator.recordCurrentMeasurement());
    }

    if (btnLoadSample) {
      btnLoadSample.addEventListener('click', () => simulator.loadIPSTSampleData());
    }

    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => simulator.exportCSV());
    }

    if (btnClearTable) {
      btnClearTable.addEventListener('click', () => simulator.clearRecordedTable());
    }

    if (typeof window !== 'undefined') {
      window.forceSwapLabTube = (srcId) => simulator.selectLightSource(srcId, true);
      window.aimLabSpectralLine = (lineId) => simulator.aimAtSpectralLine(lineId);
      window.deleteLabRecordedRow = (rowId) => simulator.deleteRecordedRow(rowId);
      window.updateLabManualInput = (rowId, field, value) =>
        simulator.updateManualRowInput(rowId, field, value);
      window.checkLabManualRow = (rowId) => simulator.checkManualRow(rowId);
      window.revealLabManualRow = (rowId) => simulator.revealManualRow(rowId);
    }
  }

  /**
   * Bind controls for Simulator 19.1.1 (Blackbody Radiation)
   * @param {Object} simulator - BlackbodySimulator instance
   */
  static bindBlackbodyControls(simulator) {
    const sliderTemp = document.getElementById('slider-bb-temp');
    const cbRayleigh = document.getElementById('cb-bb-rayleigh');
    const cbVisible = document.getElementById('cb-bb-visible');

    if (sliderTemp) {
      sliderTemp.addEventListener('input', (e) => {
        const tempK = parseInt(e.target.value, 10);
        simulator.setTemperature(tempK);
      });
    }

    if (cbRayleigh) {
      cbRayleigh.addEventListener('change', (e) => {
        simulator.setShowRayleighJeans(e.target.checked);
      });
    }

    if (cbVisible) {
      cbVisible.addEventListener('change', (e) => {
        simulator.setShowVisibleBand(e.target.checked);
      });
    }

    if (typeof window !== 'undefined') {
      window.setBlackbodyTemp = (tempK) => {
        if (sliderTemp) {
          sliderTemp.value = tempK;
          sliderTemp.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };
    }
  }

  /**
   * Bind controls for Simulator 19.1.2A (Bohr Atom Orbits)
   * @param {Object} simulator - BohrAtomSimulator instance
   */
  static bindBohrControls(simulator) {
    const btnPlay = document.getElementById('btn-bohr-play');
    const cbVectors = document.getElementById('cb-bohr-vectors');

    if (btnPlay) {
      btnPlay.addEventListener('click', () => {
        const isPlaying = simulator.togglePlay();
        btnPlay.innerHTML = isPlaying
          ? '<i class="fa-solid fa-pause mr-1"></i> พักการหมุน'
          : '<i class="fa-solid fa-play mr-1"></i> เริ่มหมุนต่อ';
      });
    }

    if (cbVectors) {
      cbVectors.addEventListener('change', () => {
        simulator.toggleVectors();
      });
    }

    if (typeof window !== 'undefined') {
      window.setBohrOrbitLevel = (level) => {
        simulator.setOrbit(level);
        for (let l = 1; l <= 5; l++) {
          const btn = document.getElementById(`btn-bohr-n-${l}`);
          if (btn) {
            if (l === level) {
              btn.className = 'flex-1 py-1.5 rounded-lg text-xs font-bold transition bg-cyan-500 text-slate-950 shadow-sm cursor-pointer';
            } else {
              btn.className = 'flex-1 py-1.5 rounded-lg text-xs font-medium transition bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer';
            }
          }
        }
      };
    }
  }

  /**
   * Bind controls for Simulator 19.1.2B (Hydrogen Spectra & Transitions)
   * @param {Object} simulator - HydrogenSpectrumSimulator instance
   */
  static bindSpectrumControls(simulator) {
    const selectNi = document.getElementById('select-spec-ni');
    const selectNf = document.getElementById('select-spec-nf');
    const btnJump = document.getElementById('btn-spec-jump');

    const updateFromDropdowns = () => {
      if (selectNi && selectNf) {
        const ni = parseInt(selectNi.value, 10);
        const nf = parseInt(selectNf.value, 10);
        simulator.setTransition(ni, nf);
      }
    };

    if (selectNf) {
      selectNf.addEventListener('change', () => {
        if (selectNi) {
          let ni = parseInt(selectNi.value, 10);
          const nf = parseInt(selectNf.value, 10);
          // Ensure valid emission series (ni > nf) when user picks higher series
          if (ni <= nf) {
            ni = Math.min(7, nf + 1);
            selectNi.value = String(ni);
          }
          simulator.setTransition(ni, nf);
        } else {
          updateFromDropdowns();
        }
      });
    }

    if (selectNi) selectNi.addEventListener('change', updateFromDropdowns);

    if (btnJump) {
      btnJump.addEventListener('click', () => {
        simulator.triggerJumpAnimation();
      });
    }

    if (typeof window !== 'undefined') {
      window.selectBalmerPreset = (ni, nf) => {
        if (selectNi) selectNi.value = ni;
        if (selectNf) selectNf.value = nf;
        simulator.setTransition(ni, nf);
      };
    }
  }
}

