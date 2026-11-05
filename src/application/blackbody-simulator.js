/**
 * @file blackbody-simulator.js
 * @description Simulator 19.1.1 Orchestrator for Blackbody Radiation & Planck Hypothesis.
 * Conforms to Physics Learning Standard (v1.13.0).
 */

import { CanvasRenderer } from '../adapters/canvas/canvas-renderer.js';
import { BlackbodyPlotter } from '../adapters/canvas/blackbody-plotter.js';
import { createBlackbody } from '../physics/blackbody-model.js';
import { formatScientific } from '../utils/format.js';

export class BlackbodySimulator {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new CanvasRenderer(canvas);
    this.plotter = new BlackbodyPlotter(this.renderer);

    this.temperature = 5800; // Sun surface temp
    this.showRayleighJeans = true;
    this.showVisibleBand = true;

    this.model = createBlackbody(this.temperature);

    // Re-render when resized
    this.renderer.onResize = () => {
      this.render();
    };

    this.render();
  }

  /**
   * Set absolute temperature in Kelvin
   * @param {number} kelvin
   */
  setTemperature(kelvin) {
    this.temperature = Math.max(1000, Math.min(12000, Number(kelvin) || 5800));
    this.model = createBlackbody(this.temperature);
    this.render();
    this.updateReadouts();
  }

  /**
   * Toggle classical Rayleigh-Jeans curve
   * @param {boolean} show
   */
  setShowRayleighJeans(show) {
    this.showRayleighJeans = Boolean(show);
    this.render();
  }

  /**
   * Toggle visible spectrum highlight band
   * @param {boolean} show
   */
  setShowVisibleBand(show) {
    this.showVisibleBand = Boolean(show);
    this.render();
  }

  render() {
    this.plotter.render(this.model, {
      showRayleighJeans: this.showRayleighJeans,
      showVisibleBand: this.showVisibleBand
    });
  }

  /**
   * Update HTML DOM readout elements if present
   */
  updateReadouts() {
    const elTemp = document.getElementById('bb-val-temp');
    if (elTemp) elTemp.textContent = `${this.temperature.toLocaleString()} K`;

    const elLambda = document.getElementById('bb-val-lambda');
    if (elLambda) elLambda.textContent = `${this.model.peakWavelengthNm.toFixed(1)} nm`;

    const elRegion = document.getElementById('bb-val-region');
    if (elRegion) {
      const regMap = {
        ultraviolet: 'อัลตราไวโอเลต (UV)',
        visible: 'แสงที่ตามองเห็น (Visible)',
        infrared: 'อินฟราเรด (Infrared)'
      };
      elRegion.textContent = regMap[this.model.getPeakRegion()] || this.model.getPeakRegion();
    }
  }

  destroy() {
    this.renderer.destroy();
  }
}

