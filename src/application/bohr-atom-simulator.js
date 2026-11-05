/**
 * @file bohr-atom-simulator.js
 * @description Simulator 19.1.2A Orchestrator for Bohr Hydrogen Atom & Electron Dynamics.
 * Conforms to Physics Learning Standard (v1.13.0).
 */

import { CanvasRenderer } from '../adapters/canvas/canvas-renderer.js';
import { BohrOrbitPlotter } from '../adapters/canvas/bohr-orbit-plotter.js';
import { createBohrOrbit } from '../physics/bohr-atom-model.js';
import { formatScientific, formatEnergyEV } from '../utils/format.js';

export class BohrAtomSimulator {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new CanvasRenderer(canvas);
    this.plotter = new BohrOrbitPlotter(this.renderer);

    this.n = 1;
    this.orbitModel = createBohrOrbit(this.n);
    this.angleRad = 0;
    this.isPlaying = true;
    this.speedMultiplier = 1.0;
    this.showVectors = true;
    this.animFrameId = null;
    this.lastTimestamp = 0;

    this.renderer.onResize = () => {
      this.plotter.render(this.orbitModel, this.angleRad, {
        showVectors: this.showVectors
      });
    };

    this.startLoop();
  }

  setOrbit(n) {
    this.n = Math.max(1, Math.min(5, parseInt(n, 10) || 1));
    this.orbitModel = createBohrOrbit(this.n);
    this.updateReadouts();
  }

  setSpeed(mult) {
    this.speedMultiplier = Math.max(0.1, Math.min(3.0, Number(mult) || 1.0));
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    return this.isPlaying;
  }

  toggleVectors() {
    this.showVectors = !this.showVectors;
  }

  startLoop() {
    const loop = (timestamp) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min(0.1, (timestamp - this.lastTimestamp) / 1000);
      this.lastTimestamp = timestamp;

      if (this.isPlaying) {
        // Angular speed proportional to 1 / n^1.5 for pleasing educational motion
        const baseOmega = 2.5;
        const omega = (baseOmega / Math.pow(this.n, 1.25)) * this.speedMultiplier;
        this.angleRad = (this.angleRad + omega * dt) % (Math.PI * 2);
      }

      this.plotter.render(this.orbitModel, this.angleRad, {
        showVectors: this.showVectors
      });

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  updateReadouts() {
    const m = this.orbitModel;
    const elN = document.getElementById('bohr-val-n');
    if (elN) elN.textContent = `n = ${m.n}`;

    const elR = document.getElementById('bohr-val-radius');
    if (elR) elR.textContent = `${m.radiusAngstroms.toFixed(3)} Å (${formatScientific(m.radiusMeters)} m)`;

    const elV = document.getElementById('bohr-val-velocity');
    if (elV) elV.textContent = `${formatScientific(m.velocityMps)} m/s`;

    const elE = document.getElementById('bohr-val-energy');
    if (elE) elE.textContent = formatEnergyEV(m.totalEnergyEV);

    const elL = document.getElementById('bohr-val-momentum');
    if (elL) elL.textContent = `${m.n}ħ (${formatScientific(m.angularMomentum)} J·s)`;
  }

  destroy() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.renderer.destroy();
  }
}

