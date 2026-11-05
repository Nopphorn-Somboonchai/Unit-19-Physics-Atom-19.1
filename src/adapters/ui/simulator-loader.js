/**
 * @file simulator-loader.js
 * @description Simulator Calibration & Async Loader UI Adapter for Unit 19.
 * Conforms to Physics Learning Standard (v1.13.0).
 */

export class SimulatorLoader {
  static loadedState = {
    '19-1-blackbody': false,
    '19-2-bohr': false,
    '19-3-spectrum': false
  };

  static prefixMap = {
    '19-1-blackbody': 'blackbody',
    '19-2-bohr': 'bohr',
    '19-3-spectrum': 'spectrum'
  };

  static calibrationStages = {
    '19-1-blackbody': [
      { maxPct: 25, status: 'กำลังเตรียมพิกัดกราฟสเปกตรัม...' },
      { maxPct: 60, status: 'คำนวณการกระจายรังสีของพลังค์...' },
      { maxPct: 90, status: 'เทียบทฤษฎีเรย์ลีห์-จีนส์ (หายนะ UV)...' },
      { maxPct: 100, status: 'ระบบพร้อมจำลองการแผ่รังสีเสร็จสมบูรณ์ 100%' }
    ],
    '19-2-bohr': [
      { maxPct: 25, status: 'กำลังสร้างแบบจำลองนิวเคลียสใจกลาง...' },
      { maxPct: 60, status: 'คำนวณวงโคจร rn = n²r₁ และความเร็ว vn...' },
      { maxPct: 90, status: 'ตรวจสอบโมเมนตัมเชิงมุม L = nħ...' },
      { maxPct: 100, status: 'ระบบพร้อมจำลองวงโคจรอะตอมโบร์เสร็จสมบูรณ์ 100%' }
    ],
    '19-3-spectrum': [
      { maxPct: 25, status: 'กำลังตั้งค่าระดับพลังงานไฮโดรเจน En...' },
      { maxPct: 60, status: 'คำนวณสูตรของริดเบิร์กและอนุกรมสเปกตรัม...' },
      { maxPct: 90, status: 'เตรียมแอนิเมชันปล่อยโฟตอนแสงสี...' },
      { maxPct: 100, status: 'ระบบพร้อมจำลองการเปลี่ยนระดับพลังงานเสร็จสมบูรณ์ 100%' }
    ]
  };

  static isLoaded(simId) {
    return Boolean(this.loadedState[simId]);
  }

  static markLoaded(simId) {
    this.loadedState[simId] = true;
  }

  static reset(simId) {
    if (simId) {
      this.loadedState[simId] = false;
    } else {
      Object.keys(this.loadedState).forEach((key) => {
        this.loadedState[key] = false;
      });
    }
  }

  static getStatusText(simId, pct) {
    const stages = this.calibrationStages[simId] || this.calibrationStages['19-1-blackbody'];
    const current = stages.find((s) => pct <= s.maxPct);
    return current ? current.status : stages[stages.length - 1].status;
  }

  static load(simId, options = {}) {
    const {
      force = false,
      duration = 700,
      onComplete = null,
      onProgress = null
    } = options;

    if (this.isLoaded(simId) && !force) {
      if (typeof onComplete === 'function') onComplete();
      return Promise.resolve(true);
    }

    const prefix = this.prefixMap[simId] || simId;

    return new Promise((resolve) => {
      const isDOM = typeof document !== 'undefined';
      const elOverlay = isDOM ? document.getElementById(`loader-${prefix}`) : null;
      const elPct = isDOM ? document.getElementById(`loader-${prefix}-pct`) : null;
      const elBar = isDOM ? document.getElementById(`loader-${prefix}-bar`) : null;
      const elStatus = isDOM ? document.getElementById(`loader-${prefix}-status`) : null;

      if (elOverlay) {
        elOverlay.classList.remove('opacity-0', 'pointer-events-none');
        elOverlay.style.display = 'flex';
      }

      const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

      const updateProgress = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, Math.max(0, elapsed / duration));

        const ease = 1 - Math.pow(1 - progress, 3);
        const currentPct = Math.min(100, Math.round(ease * 100));
        const statusText = this.getStatusText(simId, currentPct);

        if (elPct) elPct.textContent = String(currentPct);
        if (elBar) elBar.style.width = `${currentPct}%`;
        if (elStatus) elStatus.textContent = statusText;

        if (typeof onProgress === 'function') {
          onProgress(currentPct, statusText);
        }

        if (progress < 1) {
          if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(updateProgress);
          } else {
            setTimeout(() => updateProgress(Date.now()), 16);
          }
        } else {
          this.markLoaded(simId);

          if (elPct) elPct.textContent = '100';
          if (elBar) elBar.style.width = '100%';
          if (elStatus) elStatus.textContent = this.getStatusText(simId, 100);

          if (elOverlay) {
            setTimeout(() => {
              elOverlay.classList.add('opacity-0', 'pointer-events-none');
              setTimeout(() => {
                if (elOverlay.classList.contains('opacity-0')) {
                  elOverlay.style.display = 'none';
                }
              }, 300);
            }, 120);
          }

          if (typeof onComplete === 'function') {
            onComplete();
          }

          resolve(true);
        }
      };

      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => updateProgress(Date.now()), 16);
      }
    });
  }

  static reload(simId, onComplete = null) {
    return this.load(simId, { force: true, onComplete });
  }

  static initGlobalHandlers() {
    if (typeof window !== 'undefined') {
      window.SimulatorLoader = SimulatorLoader;
      window.reloadSimulator = (simId) => {
        return SimulatorLoader.reload(simId);
      };
    }
  }
}

