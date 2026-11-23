import { beforeEach, describe, test } from '@e2e-dev/web';
import { expect } from 'e2e';

const H = 6.626e-34;
const C = 3.0e8;
const EV_TO_J = 1.602e-19;

describe('Practice Mode 19.1.1 (IPST 5-Question Bank & Answer Key Verification)', () => {
  beforeEach(async ({ app, browser }) => {
    await app.open('/');
    await browser.locator('#sec-home button[onclick="showSection(\'practice\')"]').click();
    await browser.locator('#btn-prac-19-1-1').click();
    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 1 / 5');
  });

  test('verifies Q1 (standard): f = 6.50 × 10^14 Hz -> 2.69 eV', async ({ browser }) => {
    await expect(browser.locator('#prac-question-text')).toContainText('6.50');
    await expect(browser.locator('#prac-unit-badge-1')).toHaveText('eV');

    // Wrong answer rejected
    await browser.locator('#prac-input-val1').fill('9.99');
    await browser.locator('#btn-prac-check').click();
    await expect(browser.locator('#prac-feedback')).toContainText('ยังไม่ถูกต้อง');

    // Independent physics calculation: E = h * f / e
    const expectedEV = Math.round(((H * 6.5e14) / EV_TO_J) * 100) / 100;
    expect(expectedEV).toBe(2.69);

    await browser.locator('#prac-input-val1').fill(String(expectedEV));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-box')).toBeVisible();
    await expect(browser.locator('#prac-explanation-text')).toContainText('2.69 eV');
  });

  test('verifies Q2 (standard): E = 2.50 eV -> 6.04 × 10^14 Hz', async ({ browser }) => {
    await browser.locator('button[onclick="regeneratePractice()"]').first().click();
    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 2 / 5');
    await expect(browser.locator('#prac-question-text')).toContainText('2.50');
    await expect(browser.locator('#prac-unit-badge-1')).toHaveText('× 10¹⁴ Hz');

    // Independent physics calculation: f = (E * e) / h
    const expectedFreq14 = Math.round((((2.5 * EV_TO_J) / H) / 1e14) * 100) / 100;
    expect(expectedFreq14).toBe(6.04);

    await browser.locator('#prac-input-val1').fill(String(expectedFreq14));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('6.04 × 10¹⁴ Hz');
  });

  test('verifies Q3 (standard 2-part): E1 = 21.76 × 10^-19 J -> n=2 (43.52) & n=3 (65.28)', async ({ browser }) => {
    const nextBtn = browser.locator('button[onclick="regeneratePractice()"]').first();
    await nextBtn.click(); // Q2
    await nextBtn.click(); // Q3

    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 3 / 5');
    await expect(browser.locator('#prac-single-input-wrap')).toBeHidden();
    await expect(browser.locator('#prac-multi-numeric-zone')).toBeVisible();
    await expect(browser.locator('#prac-multi-unit-1')).toHaveText('× 10⁻¹⁹ J');
    await expect(browser.locator('#prac-multi-unit-2')).toHaveText('× 10⁻¹⁹ J');

    // Partial correct (Q3 part 1 right, part 2 wrong) must fail
    await browser.locator('#prac-multi-input-1').fill('43.52');
    await browser.locator('#prac-multi-input-2').fill('10.00');
    await browser.locator('#btn-prac-check').click();
    await expect(browser.locator('#prac-feedback')).toContainText('ยังไม่ถูกต้อง');
    await expect(browser.locator('#prac-feedback')).toContainText('✅');
    await expect(browser.locator('#prac-feedback')).toContainText('❌');

    // Both correct
    const expectedN2 = Math.round(2 * 21.76 * 100) / 100;
    const expectedN3 = Math.round(3 * 21.76 * 100) / 100;
    expect(expectedN2).toBe(43.52);
    expect(expectedN3).toBe(65.28);

    await browser.locator('#prac-multi-input-1').fill(String(expectedN2));
    await browser.locator('#prac-multi-input-2').fill(String(expectedN3));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('43.52 × 10⁻¹⁹ J');
    await expect(browser.locator('#prac-explanation-text')).toContainText('65.28 × 10⁻¹⁹ J');
  });

  test('verifies Q4 (standard): f = 5.0 × 10^14 Hz -> 2.07 eV (accepts textbook 2.1 eV, no answer leak)', async ({ browser }) => {
    const nextBtn = browser.locator('button[onclick="regeneratePractice()"]').first();
    await nextBtn.click(); // Q2
    await nextBtn.click(); // Q3
    await nextBtn.click(); // Q4

    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 4 / 5');
    await expect(browser.locator('#prac-unit-badge-1')).toHaveText('eV');

    const promptText = await browser.locator('#prac-question-text').textContent();
    expect(promptText).not.toContain('(2.1 eV)');

    // Independent calculation: 2.07 eV; textbook rounded 2.1 eV within ±3%
    const expectedEV = Math.round(((H * 5.0e14) / EV_TO_J) * 100) / 100;
    expect(expectedEV).toBe(2.07);

    await browser.locator('#prac-input-val1').fill('2.1');
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('2.07 eV');
  });

  test('verifies Q5 (standard): E = 3.62 × 10^-19 J -> wavelength 549.1 nm (no color prompt)', async ({ browser }) => {
    const nextBtn = browser.locator('button[onclick="regeneratePractice()"]').first();
    await nextBtn.click(); // Q2
    await nextBtn.click(); // Q3
    await nextBtn.click(); // Q4
    await nextBtn.click(); // Q5

    await expect(browser.locator('#prac-question-title')).toContainText('ข้อที่ 5 / 5');
    await expect(browser.locator('#prac-unit-badge-1')).toHaveText('nm');
    await expect(browser.locator('#prac-choice-zone')).toBeHidden();

    const promptText = await browser.locator('#prac-question-text').textContent();
    expect(promptText).not.toContain('สีอะไร');

    // Independent calculation: λ = h * c / E
    const expectedNm = Math.round((((H * C) / 3.62e-19) * 1e9) * 10) / 10;
    expect(expectedNm).toBe(549.1);

    await browser.locator('#prac-input-val1').fill(String(expectedNm));
    await browser.locator('#btn-prac-check').click();

    await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
    await expect(browser.locator('#prac-explanation-text')).toContainText('549.1 nm');
  });

  test('verifies random mode (all 5 questions × 2 cycles): live physics answers match & 0% repeat', async ({ browser }) => {
    await browser.locator('#prac-student-roll').fill('15');
    await browser.locator('#prac-mode-select').selectOption({ value: 'random' });
    await expect(browser.locator('#prac-question-title')).toContainText('เลขที่ #15');

    const standardBySlot = [6.5, 2.5, 21.76, 5.0, 3.62];
    const seenBySlot: Set<number>[] = [new Set(), new Set(), new Set(), new Set(), new Set()];
    const nextBtn = browser.locator('button[onclick="regeneratePractice()"]').first();

    // Run 2 full cycles (10 randomized questions: Q1..Q5 twice)
    for (let step = 0; step < 10; step++) {
      const slot = step % 5;
      const expectedSeq = `ข้อที่ ${slot + 1} / 5`;
      await expect(browser.locator('#prac-question-title')).toContainText(expectedSeq);

      // Extract the exact LaTeX parameter rendered inside #prac-question-text
      const latexSource = await browser.evaluate(() => {
        const el = document.getElementById('prac-question-text');
        if (!el) return '';
        const annotations = Array.from(el.querySelectorAll('annotation')).map((a) => a.textContent || '');
        return annotations.length > 0 ? annotations.join(' | ') : (el.textContent || '');
      });

      if (slot === 0) {
        // Q1: f = X.XX \times 10^{14} \text{ Hz}
        const m = latexSource.match(/f\s*=\s*([0-9]+(?:\.[0-9]+)?)/);
        expect(m).not.toBeNull();
        const fCoeff = parseFloat(m![1]);
        expect(fCoeff).not.toBe(standardBySlot[0]);
        expect(seenBySlot[0].has(fCoeff)).toBe(false);
        seenBySlot[0].add(fCoeff);

        const ansEV = Math.round(((H * fCoeff * 1e14) / EV_TO_J) * 100) / 100;
        await browser.locator('#prac-input-val1').fill(String(ansEV));
        await browser.locator('#btn-prac-check').click();
        await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
        await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansEV.toFixed(2)} eV`);
      } else if (slot === 1) {
        // Q2: E = X.XX \text{ eV}
        const m = latexSource.match(/E\s*=\s*([0-9]+(?:\.[0-9]+)?)/);
        expect(m).not.toBeNull();
        const eEV = parseFloat(m![1]);
        expect(eEV).not.toBe(standardBySlot[1]);
        expect(seenBySlot[1].has(eEV)).toBe(false);
        seenBySlot[1].add(eEV);

        const ansFreq14 = Math.round((((eEV * EV_TO_J) / H) / 1e14) * 100) / 100;
        await browser.locator('#prac-input-val1').fill(String(ansFreq14));
        await browser.locator('#btn-prac-check').click();
        await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
        await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansFreq14.toFixed(2)} × 10¹⁴ Hz`);
      } else if (slot === 2) {
        // Q3: E_1 = XX.XX \times 10^{-19} \text{ J}
        const m = latexSource.match(/E_1\s*=\s*([0-9]+(?:\.[0-9]+)?)/);
        expect(m).not.toBeNull();
        const e1Coeff = parseFloat(m![1]);
        expect(e1Coeff).not.toBe(standardBySlot[2]);
        expect(seenBySlot[2].has(e1Coeff)).toBe(false);
        seenBySlot[2].add(e1Coeff);

        const ansN2 = Math.round(2 * e1Coeff * 100) / 100;
        const ansN3 = Math.round(3 * e1Coeff * 100) / 100;
        await browser.locator('#prac-multi-input-1').fill(String(ansN2));
        await browser.locator('#prac-multi-input-2').fill(String(ansN3));
        await browser.locator('#btn-prac-check').click();
        await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
        await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansN2.toFixed(2)} × 10⁻¹⁹ J`);
        await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansN3.toFixed(2)} × 10⁻¹⁹ J`);
      } else if (slot === 3) {
        // Q4: f = X.X \times 10^{14} \text{ Hz}
        const m = latexSource.match(/f\s*=\s*([0-9]+(?:\.[0-9]+)?)/);
        expect(m).not.toBeNull();
        const fCoeff = parseFloat(m![1]);
        expect(fCoeff).not.toBe(standardBySlot[3]);
        expect(seenBySlot[3].has(fCoeff)).toBe(false);
        seenBySlot[3].add(fCoeff);

        const ansEV = Math.round(((H * fCoeff * 1e14) / EV_TO_J) * 100) / 100;
        await browser.locator('#prac-input-val1').fill(String(ansEV));
        await browser.locator('#btn-prac-check').click();
        await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
        await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansEV.toFixed(2)} eV`);
      } else {
        // Q5: E = X.XX \times 10^{-19} \text{ J}
        const m = latexSource.match(/E\s*=\s*([0-9]+(?:\.[0-9]+)?)/);
        expect(m).not.toBeNull();
        const eCoeff = parseFloat(m![1]);
        expect(eCoeff).not.toBe(standardBySlot[4]);
        expect(seenBySlot[4].has(eCoeff)).toBe(false);
        seenBySlot[4].add(eCoeff);

        const ansNm = Math.round((((H * C) / (eCoeff * 1e-19)) * 1e9) * 10) / 10;
        await browser.locator('#prac-input-val1').fill(String(ansNm));
        await browser.locator('#btn-prac-check').click();
        await expect(browser.locator('#prac-feedback')).toContainText('ยินดีด้วย! คำตอบถูกต้อง');
        await expect(browser.locator('#prac-explanation-text')).toContainText(`${ansNm.toFixed(1)} nm`);
      }

      if (step < 9) {
        await nextBtn.click();
      }
    }
  });
});
