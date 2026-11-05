/**
 * @file control-panel.js
 * @description UI Adapter connecting DOM inputs (sliders, buttons, presets) to Unit 19 Simulator Orchestrators.
 * Conforms to Physics Learning Standard (v1.13.0).
 */

export class ControlPanelAdapter {
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

    if (selectNi) selectNi.addEventListener('change', updateFromDropdowns);
    if (selectNf) selectNf.addEventListener('change', updateFromDropdowns);

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

