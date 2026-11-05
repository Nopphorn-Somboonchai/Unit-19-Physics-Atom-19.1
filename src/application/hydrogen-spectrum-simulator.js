/**
 * @file hydrogen-spectrum-simulator.js
 * @description Simulator 19.1.2B Orchestrator for Hydrogen Transitions & Spectral Lines.
 * Conforms to Physics Learning Standard (v1.13.0).
 */

import { CanvasRenderer } from '../adapters/canvas/canvas-renderer.js';
import { SpectrumTransitionPlotter } from '../adapters/canvas/spectrum-transition-plotter.js';
import { getTransitionDetails } from '../physics/hydrogen-spectrum-solver.js';
import { formatScientific, formatEnergyEV } from '../utils/format.js';

export class HydrogenSpectrumSimulator {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new CanvasRenderer(canvas);
    this.plotter = new SpectrumTransitionPlotter(this.renderer);

    this.ni = 3; // Balmer H-alpha default
    this.nf = 2;
    this.transition = getTransitionDetails(this.ni, this.nf);

    this.animProgress = 1.0;
    this.isTransitioning = false;
    this.animFrameId = null;

    this.renderer.onResize = () => {
      this.plotter.render(this.transition, this.animProgress);
    };

    this.render();
  }

  setTransition(ni, nf) {
    this.ni = Math.max(1, Math.min(7, parseInt(ni, 10) || 1));
    this.nf = Math.max(1, Math.min(5, parseInt(nf, 10) || 1));
    this.transition = getTransitionDetails(this.ni, this.nf);
    this.triggerJumpAnimation();
    this.updateReadouts();
  }

  triggerJumpAnimation() {
    this.animProgress = 0.0;
    this.isTransitioning = true;
    const durationMs = 850;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      this.animProgress = Math.min(1.0, elapsed / durationMs);

      this.plotter.render(this.transition, this.animProgress);

      if (this.animProgress < 1.0) {
        this.animFrameId = requestAnimationFrame(step);
      } else {
        this.isTransitioning = false;
      }
    };

    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(step);
  }

  render() {
    this.plotter.render(this.transition, this.animProgress);
  }

  updateReadouts() {
    const t = this.transition;
    const elTransition = document.getElementById('spec-val-transition');
    if (elTransition) elTransition.textContent = `n = ${t.ni} → n = ${t.nf} (${t.typeTh})`;

    const elDeltaE = document.getElementById('spec-val-deltae');
    if (elDeltaE) elDeltaE.textContent = `${t.deltaEEV.toFixed(2)} eV (${formatScientific(t.deltaEJoules)} J)`;

    const elLambda = document.getElementById('spec-val-lambda');
    if (elLambda) elLambda.textContent = `${t.wavelengthNm.toFixed(1)} nm`;

    const elSeries = document.getElementById('spec-val-series');
    if (elSeries) elSeries.textContent = `${t.series ? t.series.nameTh : 'ไม่ระบุ'} [${t.series ? t.series.emRegionTh : ''}]`;
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.renderer.destroy();
  }
}

