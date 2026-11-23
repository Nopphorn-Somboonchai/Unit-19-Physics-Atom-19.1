import { beforeEach, describe, test } from '@e2e-dev/web';
import { expect } from 'e2e';

const R1_ANG = 0.529;
const V1_E6 = 2.18;
const HBAR_E34 = 6.626 / (2 * Math.PI); // ~1.05456
const E1_ABS_EV = 13.6;

describe('Practice Mode 19.1.2 (Bohr Atomic Model 5-Question Bank & Answer Verification)', () => {
  beforeEach(async ({ app, browser }) => {
    await app.open('/');
    await browser.locator('#sec-home button[onclick="showSection(\'practice\')"]').click();
    await browser.locator('#btn-prac-19-1-2').click();
    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 1 / 5');
  });

  test('verifies Q1 (standard): n = 3 Bohr radius -> 4.76 Å', async ({ browser }) => {
    await expect(browser.locator('#prac-unit-badge-1')).toHaveText('Å');

    // Wrong answer rejected
    await browser.locator('#prac-input-val1').fill('1.00');
    await browser.locator('#btn-prac-check').click();
    await expect(browser.locator('#prac-feedback')).toContainText('ยังไม่ถูกต้อง');

    // Independent calculation: r_n = n^2 * r1
    const expected = Math.round(9 * R1_ANG * 100) / 100;
    expect(expected).toBe(4.76);

    await browser.locator('#prac-input-val1').fill(String(expected));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('4.76 Å');
  });

  test('verifies Q2 (standard): n = 2 orbital velocity -> 1.09 × 10^6 m/s', async ({ browser }) => {
    await browser.locator('button[onclick="regeneratePractice()"]').first().click();
    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 2 / 5');
    await expect(browser.locator('#prac-unit-badge-1')).toHaveText('× 10⁶ m/s');

    const expected = Math.round((V1_E6 / 2) * 100) / 100;
    expect(expected).toBe(1.09);

    await browser.locator('#prac-input-val1').fill(String(expected));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('1.09 × 10⁶ m/s');
  });

  test('verifies Q3 (standard): n = 3 angular momentum -> 3.16 × 10^-34 J·s', async ({ browser }) => {
    const nextBtn = browser.locator('button[onclick="regeneratePractice()"]').first();
    await nextBtn.click(); // Q2
    await nextBtn.click(); // Q3

    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 3 / 5');
    await expect(browser.locator('#prac-unit-badge-1')).toHaveText('× 10⁻³⁴ J·s');

    const expected = Math.round(3 * HBAR_E34 * 100) / 100;
    expect(expected).toBe(3.16);

    await browser.locator('#prac-input-val1').fill(String(expected));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('3.16 × 10⁻³⁴ J·s');
  });

  test('verifies Q4 (standard): n = 2 ionization energy -> 3.40 eV', async ({ browser }) => {
    const nextBtn = browser.locator('button[onclick="regeneratePractice()"]').first();
    await nextBtn.click(); // Q2
    await nextBtn.click(); // Q3
    await nextBtn.click(); // Q4

    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 4 / 5');
    await expect(browser.locator('#prac-unit-badge-1')).toHaveText('eV');

    const expected = Math.round((E1_ABS_EV / 4) * 100) / 100;
    expect(expected).toBe(3.4);

    await browser.locator('#prac-input-val1').fill(String(expected));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('3.40 eV');
  });

  test('verifies Q5 (standard 2-part): n = 4 -> radius 8.46 Å & IE 0.85 eV', async ({ browser }) => {
    const nextBtn = browser.locator('button[onclick="regeneratePractice()"]').first();
    await nextBtn.click(); // Q2
    await nextBtn.click(); // Q3
    await nextBtn.click(); // Q4
    await nextBtn.click(); // Q5

    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 5 / 5');
    await expect(browser.locator('#prac-single-input-wrap')).toBeHidden();
    await expect(browser.locator('#prac-multi-numeric-zone')).toBeVisible();
    await expect(browser.locator('#prac-multi-unit-1')).toHaveText('Å');
    await expect(browser.locator('#prac-multi-unit-2')).toHaveText('eV');

    // Partial correct must fail
    await browser.locator('#prac-multi-input-1').fill('8.46');
    await browser.locator('#prac-multi-input-2').fill('9.99');
    await browser.locator('#btn-prac-check').click();
    await expect(browser.locator('#prac-feedback')).toContainText('ยังไม่ถูกต้อง');

    // Both correct
    const expectedR = Math.round(16 * R1_ANG * 100) / 100;
    const expectedIE = Math.round((E1_ABS_EV / 16) * 100) / 100;
    expect(expectedR).toBe(8.46);
    expect(expectedIE).toBe(0.85);

    await browser.locator('#prac-multi-input-1').fill(String(expectedR));
    await browser.locator('#prac-multi-input-2').fill(String(expectedIE));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('8.46 Å');
    await expect(browser.locator('#prac-explanation-text')).toContainText('0.85 eV');
  });

  test('verifies random mode (all 5 questions × 2 cycles): live substitutions & 0% repeat', async ({ browser }) => {
    await browser.locator('#prac-student-roll').fill('22');
    await browser.locator('#prac-mode-select').selectOption({ value: 'random' });
    await expect(browser.locator('#prac-question-title')).toContainText('เลขที่ #22');

    const stdNBySlot = [3, 2, 3, 2, 4];
    const seenBySlot: Set<number>[] = [new Set(), new Set(), new Set(), new Set(), new Set()];
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

      const match = latexSource.match(/n\s*=\s*(\d+)/);
      expect(match).not.toBeNull();
      const n = parseInt(match![1], 10);

      expect(n).not.toBe(stdNBySlot[slot]);
      expect(seenBySlot[slot].has(n)).toBe(false);
      seenBySlot[slot].add(n);

      if (slot === 0) {
        const ansR = Math.round(n * n * R1_ANG * 100) / 100;
        await browser.locator('#prac-input-val1').fill(String(ansR));
        await browser.locator('#btn-prac-check').click();
        await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
        await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansR.toFixed(2)} Å`);
      } else if (slot === 1) {
        const ansV = Math.round((V1_E6 / n) * 100) / 100;
        await browser.locator('#prac-input-val1').fill(String(ansV));
        await browser.locator('#btn-prac-check').click();
        await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
        await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansV.toFixed(2)} × 10⁶ m/s`);
      } else if (slot === 2) {
        const ansL = Math.round(n * HBAR_E34 * 100) / 100;
        await browser.locator('#prac-input-val1').fill(String(ansL));
        await browser.locator('#btn-prac-check').click();
        await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
        await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansL.toFixed(2)} × 10⁻³⁴ J·s`);
      } else if (slot === 3) {
        const ansIE = Math.round((E1_ABS_EV / (n * n)) * 100) / 100;
        await browser.locator('#prac-input-val1').fill(String(ansIE));
        await browser.locator('#btn-prac-check').click();
        await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
        await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansIE.toFixed(2)} eV`);
      } else {
        const ansR = Math.round(n * n * R1_ANG * 100) / 100;
        const ansIE = Math.round((E1_ABS_EV / (n * n)) * 100) / 100;
        await browser.locator('#prac-multi-input-1').fill(String(ansR));
        await browser.locator('#prac-multi-input-2').fill(String(ansIE));
        await browser.locator('#btn-prac-check').click();
        await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
        await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansR.toFixed(2)} Å`);
        await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansIE.toFixed(2)} eV`);
      }

      if (step < 9) {
        await nextBtn.click();
      }
    }
  });
});
