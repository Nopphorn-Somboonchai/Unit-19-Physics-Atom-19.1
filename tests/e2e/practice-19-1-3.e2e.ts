import { beforeEach, describe, test } from '@e2e-dev/web';
import { expect } from 'e2e';

const RH = 1.097e7;
const C = 3.0e8;
const E1_ABS_EV = 13.6;

describe('Practice Mode 19.1.3 (Hydrogen Spectra 5-Question Bank & Answer Verification)', () => {
  beforeEach(async ({ app, browser }) => {
    await app.open('/');
    await browser.locator('#sec-home button[onclick="showSection(\'practice\')"]').click();
    await browser.locator('#btn-prac-19-1-3').click();
    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 1 / 5');
  });

  test('verifies Q1 (standard): n_i = 3 -> n_f = 2 Rydberg wavelength -> 656.3 nm', async ({ browser }) => {
    await expect(browser.locator('#prac-unit-badge-1')).toHaveText('nm');

    // Wrong answer rejected
    await browser.locator('#prac-input-val1').fill('100.0');
    await browser.locator('#btn-prac-check').click();
    await expect(browser.locator('#prac-feedback')).toContainText('ยังไม่ถูกต้อง');

    // Independent calculation: 1/λ = RH * (1/nf^2 - 1/ni^2)
    const lambdaM = 1 / (RH * (1 / 4 - 1 / 9));
    const expectedNm = Math.round(lambdaM * 1e9 * 10) / 10;
    expect(expectedNm).toBe(656.3);

    await browser.locator('#prac-input-val1').fill(String(expectedNm));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('656.3 nm');
  });

  test('verifies Q2 (standard): n_i = 2 -> n_f = 1 photon energy -> 10.20 eV', async ({ browser }) => {
    await browser.locator('button[onclick="regeneratePractice()"]').first().click();
    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 2 / 5');
    await expect(browser.locator('#prac-unit-badge-1')).toHaveText('eV');

    const expectedEV = Math.round(E1_ABS_EV * (1 - 1 / 4) * 100) / 100;
    expect(expectedEV).toBe(10.2);

    await browser.locator('#prac-input-val1').fill(String(expectedEV));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('10.20 eV');
  });

  test('verifies Q3 (standard): n_i = 3 -> n_f = 2 photon frequency -> 4.57 × 10^14 Hz', async ({ browser }) => {
    const nextBtn = browser.locator('button[onclick="regeneratePractice()"]').first();
    await nextBtn.click(); // Q2
    await nextBtn.click(); // Q3

    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 3 / 5');
    await expect(browser.locator('#prac-unit-badge-1')).toHaveText('× 10¹⁴ Hz');

    const freqHz = C * RH * (1 / 4 - 1 / 9);
    const expectedF14 = Math.round((freqHz / 1e14) * 100) / 100;
    expect(expectedF14).toBe(4.57);

    await browser.locator('#prac-input-val1').fill(String(expectedF14));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('4.57 × 10¹⁴ Hz');
  });

  test('verifies Q4 (standard): Balmer series limit (n_i = ∞ -> n_f = 2) -> 364.6 nm', async ({ browser }) => {
    const nextBtn = browser.locator('button[onclick="regeneratePractice()"]').first();
    await nextBtn.click(); // Q2
    await nextBtn.click(); // Q3
    await nextBtn.click(); // Q4

    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 4 / 5');
    await expect(browser.locator('#prac-unit-badge-1')).toHaveText('nm');

    const lambdaMinNm = Math.round(((4 / RH) * 1e9) * 10) / 10;
    expect(lambdaMinNm).toBe(364.6);

    await browser.locator('#prac-input-val1').fill(String(lambdaMinNm));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('364.6 nm');
  });

  test('verifies Q5 (standard 2-part): n_i = 4 -> n_f = 2 -> ΔE 2.55 eV & λ 486.2 nm', async ({ browser }) => {
    const nextBtn = browser.locator('button[onclick="regeneratePractice()"]').first();
    await nextBtn.click(); // Q2
    await nextBtn.click(); // Q3
    await nextBtn.click(); // Q4
    await nextBtn.click(); // Q5

    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 5 / 5');
    await expect(browser.locator('#prac-single-input-wrap')).toBeHidden();
    await expect(browser.locator('#prac-multi-numeric-zone')).toBeVisible();
    await expect(browser.locator('#prac-multi-unit-1')).toHaveText('eV');
    await expect(browser.locator('#prac-multi-unit-2')).toHaveText('nm');

    // Partial correct must fail
    await browser.locator('#prac-multi-input-1').fill('2.55');
    await browser.locator('#prac-multi-input-2').fill('999.9');
    await browser.locator('#btn-prac-check').click();
    await expect(browser.locator('#prac-feedback')).toContainText('ยังไม่ถูกต้อง');

    // Both correct
    const expectedDE = Math.round(E1_ABS_EV * (1 / 4 - 1 / 16) * 100) / 100;
    const expectedNm = Math.round((1 / (RH * (1 / 4 - 1 / 16))) * 1e9 * 10) / 10;
    expect(expectedDE).toBe(2.55);
    expect(expectedNm).toBe(486.2);

    await browser.locator('#prac-multi-input-1').fill(String(expectedDE));
    await browser.locator('#prac-multi-input-2').fill(String(expectedNm));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('2.55 eV');
    await expect(browser.locator('#prac-explanation-text')).toContainText('486.2 nm');
  });

  test('verifies random mode (all 5 questions × 2 cycles): live substitutions & 0% repeat', async ({ browser }) => {
    await browser.locator('#prac-student-roll').fill('31');
    await browser.locator('#prac-mode-select').selectOption({ value: 'random' });
    await expect(browser.locator('#prac-question-title')).toContainText('เลขที่ #31');

    const stdKeyBySlot = ['3->2', '2->1', '3->2', '2', '4->2'];
    const seenBySlot: Set<string>[] = [new Set(), new Set(), new Set(), new Set(), new Set()];
    const nextBtn = browser.locator('button[onclick="regeneratePractice()"]').first();

    for (let step = 0; step < 10; step++) {
      const slot = step % 5;
      await expect(browser.locator('#prac-question-title')).toContainText(`ข้อที่ ${slot + 1} / 5`);

      const latexSource = await browser.evaluate(() => {
        const el = document.getElementById('prac-question-text');
        if (!el) return '';
        const annotations = Array.from(el.querySelectorAll('annotation')).map((a) => a.textContent || '');
        return annotations.length > 0 ? annotations.join(' | ') : (el.textContent || '');
      });

      if (slot === 3) {
        // Q4: series limit n_f = X
        const mNf = latexSource.match(/n_f\s*=\s*(\d+)/);
        expect(mNf).not.toBeNull();
        const nf = parseInt(mNf![1], 10);
        const key = String(nf);
        expect(key).not.toBe(stdKeyBySlot[3]);
        expect(seenBySlot[3].has(key)).toBe(false);
        seenBySlot[3].add(key);

        const ansNm = Math.round(((nf * nf) / RH) * 1e9 * 10) / 10;
        await browser.locator('#prac-input-val1').fill(String(ansNm));
        await browser.locator('#btn-prac-check').click();
        await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
        await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansNm.toFixed(1)} nm`);
      } else {
        // Q1, Q2, Q3, Q5: n_i = X, n_f = Y
        const mNi = latexSource.match(/n_i\s*=\s*(\d+)/);
        const mNf = latexSource.match(/n_f\s*=\s*(\d+)/);
        expect(mNi).not.toBeNull();
        expect(mNf).not.toBeNull();
        const ni = parseInt(mNi![1], 10);
        const nf = parseInt(mNf![1], 10);
        const key = `${ni}->${nf}`;

        expect(key).not.toBe(stdKeyBySlot[slot]);
        expect(seenBySlot[slot].has(key)).toBe(false);
        seenBySlot[slot].add(key);

        const term = Math.abs(1 / (nf * nf) - 1 / (ni * ni));
        if (slot === 0) {
          const ansNm = Math.round((1 / (RH * term)) * 1e9 * 10) / 10;
          await browser.locator('#prac-input-val1').fill(String(ansNm));
          await browser.locator('#btn-prac-check').click();
          await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
          await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansNm.toFixed(1)} nm`);
        } else if (slot === 1) {
          const ansDE = Math.round(E1_ABS_EV * term * 100) / 100;
          await browser.locator('#prac-input-val1').fill(String(ansDE));
          await browser.locator('#btn-prac-check').click();
          await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
          await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansDE.toFixed(2)} eV`);
        } else if (slot === 2) {
          const ansF14 = Math.round(((C * RH * term) / 1e14) * 100) / 100;
          await browser.locator('#prac-input-val1').fill(String(ansF14));
          await browser.locator('#btn-prac-check').click();
          await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
          await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansF14.toFixed(2)} × 10¹⁴ Hz`);
        } else {
          const ansDE = Math.round(E1_ABS_EV * term * 100) / 100;
          const ansNm = Math.round((1 / (RH * term)) * 1e9 * 10) / 10;
          await browser.locator('#prac-multi-input-1').fill(String(ansDE));
          await browser.locator('#prac-multi-input-2').fill(String(ansNm));
          await browser.locator('#btn-prac-check').click();
          await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
          await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansDE.toFixed(2)} eV`);
          await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansNm.toFixed(1)} nm`);
        }
      }

      if (step < 9) {
        await nextBtn.click();
      }
    }
  });
});
