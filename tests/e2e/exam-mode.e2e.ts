import { beforeEach, describe, test } from '@e2e-dev/web';
import { expect } from 'e2e';

const H = 6.626e-34;
const C = 3.0e8;
const EV_TO_J = 1.602e-19;
const RH = 1.097e7;

const KNOWN_CORRECT_CHOICE_SUBSTRINGS = [
  'จำนวนเต็มเท่าของ hf',
  'โมเมนตัมเชิงมุมเป็นจำนวนเต็มเท่าของ h/(2π)',
  'ปล่อยโฟตอนที่มีพลังงานเท่ากับผลต่างระหว่างระดับพลังงาน',
  'อนุกรมบัลเมอร์ (Balmer Series)',
  'แปรผันตรงกับกำลังสองของเลขควอนตัม',
  'โฟตอนของแสงสีน้ำเงินมีพลังงานมากกว่า'
];

async function getLatexAnnotations(browser) {
  return browser.evaluate(() => {
    const el = document.getElementById('exam-q-text');
    if (!el) return '';
    const annotations = Array.from(el.querySelectorAll('annotation')).map((a) => a.textContent || '');
    return annotations.length > 0 ? annotations.join(' | ') : (el.textContent || '');
  });
}

function solveExamQuestionFromLiveDom(idx, unitText, latexText) {
  if (idx === 1) {
    // Q2 (19.1.1): E (eV) from f, OR f (×10^14 Hz) from E
    if (unitText === 'eV') {
      const m = latexText.match(/f\s*=\s*([0-9]+(?:\.[0-9]+)?)/);
      const fCoeff = parseFloat(m![1]);
      return Math.round(((H * fCoeff * 1e14) / EV_TO_J) * 100) / 100;
    }
    const m = latexText.match(/E\s*=\s*([0-9]+(?:\.[0-9]+)?)/);
    const eEV = parseFloat(m![1]);
    return Math.round((((eEV * EV_TO_J) / H) / 1e14) * 100) / 100;
  }

  if (idx === 2) {
    // Q3 (19.1.1): λ (nm) from E, OR E_n (×10^-19 J) from E_1 and n
    if (unitText === 'nm') {
      const m = latexText.match(/E\s*=\s*([0-9]+(?:\.[0-9]+)?)/);
      const eCoeff = parseFloat(m![1]);
      return Math.round((((H * C) / (eCoeff * 1e-19)) * 1e9) * 10) / 10;
    }
    const mE1 = latexText.match(/E_1\s*=\s*([0-9]+(?:\.[0-9]+)?)/);
    const mN = latexText.match(/n\s*=\s*(\d+)/);
    const e1Coeff = parseFloat(mE1![1]);
    const n = parseInt(mN![1], 10);
    return Math.round(n * e1Coeff * 100) / 100;
  }

  if (idx === 3) {
    // Q4 (19.1.2): r_n (Å), v_n (×10^6 m/s), or IE (eV)
    const mN = latexText.match(/n\s*=\s*(\d+)/);
    const n = parseInt(mN![1], 10);
    if (unitText === 'Å') return Math.round(n * n * 0.529 * 100) / 100;
    if (unitText === '× 10⁶ m/s') return Math.round((2.18 / n) * 100) / 100;
    return Math.round((13.6 / (n * n)) * 100) / 100;
  }

  // Q5 (19.1.3): series limit (n_i = \infty) OR transition λ (nm) / ΔE (eV)
  if (latexText.includes('\\infty')) {
    const mNf = latexText.match(/n_f\s*=\s*(\d+)/);
    const nf = parseInt(mNf![1], 10);
    return Math.round(((nf * nf) / RH) * 1e9 * 10) / 10;
  }
  const mNi = latexText.match(/n_i\s*=\s*(\d+)/);
  const mNf = latexText.match(/n_f\s*=\s*(\d+)/);
  const ni = parseInt(mNi![1], 10);
  const nf = parseInt(mNf![1], 10);
  const term = Math.abs(1 / (nf * nf) - 1 / (ni * ni));
  if (unitText === 'nm') {
    return Math.round((1 / (RH * term)) * 1e9 * 10) / 10;
  }
  return Math.round(13.6 * term * 100) / 100;
}

describe('Timed Exam Mode (Unit 19.1 — IPST Bank, Anti-Cheat, Auto-Submit & Recovery)', () => {
  beforeEach(async ({ app }) => {
    await app.open('/');
  });

  test('validates start screen rules, warning panel, and disabled start button until valid identity', async ({ browser }) => {
    await browser.locator('#sec-home button[onclick="showSection(\'exam-start\')"]').click();

    await expect(browser.locator('#sec-exam-start')).toContainText('กติกาการสอบ (อ่านก่อนเริ่ม)');
    await expect(browser.locator('#sec-exam-start')).toContainText('19.1.1 สมมติฐานของพลังค์');
    await expect(browser.locator('#sec-exam-start')).toContainText('ทศนิยมไม่เกิน 2 ตำแหน่ง');
    await expect(browser.locator('#btn-exam-start-submit')).toBeDisabled();

    // Invalid roll number keeps start disabled and shows inline hint
    await browser.locator('#exam-input-name').fill('นักเรียน ทดสอบ');
    await browser.locator('#exam-input-roll').fill('99');
    await expect(browser.locator('#exam-err-roll')).toBeVisible();
    await expect(browser.locator('#btn-exam-start-submit')).toBeDisabled();

    // Valid identity enables start button
    await browser.locator('#exam-input-roll').fill('12');
    await expect(browser.locator('#exam-err-roll')).toBeHidden();
    await expect(browser.locator('#btn-exam-start-submit')).toBeEnabled();
  });

  test('completes 5-question IPST exam with 10/10, no Wien Law, readable choice text, and no duplicate titles', async ({ browser }) => {
    await browser.locator('#sec-home button[onclick="showSection(\'exam-start\')"]').click();
    await browser.locator('#exam-input-name').fill('สมหญิง เรียนดี');
    await browser.locator('#exam-input-class').fill('ม.6/1');
    await browser.locator('#exam-input-roll').fill('7');
    await browser.locator('#btn-exam-start-submit').click();

    await expect(browser.locator('#sec-exam-live')).toBeVisible();
    await expect(browser.locator('#exam-q-title')).toContainText('ข้อที่ 1:');

    // Q1: Choice question — pick correct option dynamically & verify text
    const choiceTexts = await browser.locator('#exam-zone-choice button').allTextContents();
    expect(choiceTexts.length).toBe(4);
    const correctChoiceIdx = choiceTexts.findIndex((txt) =>
      KNOWN_CORRECT_CHOICE_SUBSTRINGS.some((sub) => txt.includes(sub))
    );
    expect(correctChoiceIdx).toBeGreaterThanOrEqual(0);
    await browser.locator('#exam-zone-choice button').nth(correctChoiceIdx).click();

    // Q2..Q5: Solve independently from live DOM parameters
    for (let idx = 1; idx < 5; idx++) {
      await browser.locator('#btn-exam-next').click();
      await expect(browser.locator('#exam-q-title')).toContainText(`ข้อที่ ${idx + 1}:`);

      const qText = await browser.locator('#exam-q-text').textContent();
      expect(qText).not.toContain('วีน');

      const unitText = ((await browser.locator('#exam-unit-badge').textContent()) || '').trim();
      expect(unitText).not.toBe('-');

      const latexText = await getLatexAnnotations(browser);
      const ans = solveExamQuestionFromLiveDom(idx, unitText, latexText);
      await browser.locator('#exam-input-numeric').fill(String(ans));
    }

    // Submit exam and accept confirmation dialog
    const unsub = await browser.onDialog('accept');
    await browser.locator('#btn-exam-next').click();
    await unsub();

    await expect(browser.locator('#sec-exam-result')).toBeVisible();
    await expect(browser.locator('#res-score-value')).toHaveText('10 / 10');
    await expect(browser.locator('#res-score-pct')).toHaveText('100%');
    await expect(browser.locator('#res-tab-switches')).toContainText('ความโปร่งใส 100%');

    const breakdownText = (await browser.locator('#res-breakdown-list').textContent()) || '';
    // Ensure no duplicate "ข้อที่ X: ข้อที่ X:"
    expect(breakdownText).not.toMatch(/ข้อที่\s*1:\s*ข้อที่\s*1:/);
    // Ensure Q1 displays letter + full text, NOT raw index digit "0/1/2/3"
    const expectedLetter = String.fromCharCode(65 + correctChoiceIdx);
    const q1CardText = (await browser.locator('#res-breakdown-list > div').first().textContent()) || '';
    expect(q1CardText).toContain(`คำตอบของคุณ: ${expectedLetter}. `);
  });

  test('counts anti-cheat tab switches strictly 1:1 even when blur and visibilitychange fire together', async ({ browser }) => {
    await browser.locator('#sec-home button[onclick="showSection(\'exam-start\')"]').click();
    await browser.locator('#exam-input-name').fill('ทดสอบ สลับแท็บ');
    await browser.locator('#exam-input-roll').fill('5');
    await browser.locator('#btn-exam-start-submit').click();
    await expect(browser.locator('#sec-exam-live')).toBeVisible();

    // Simulate 1 leave (blur + visibilitychange hidden firing together), then return
    await browser.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      window.dispatchEvent(new Event('blur'));
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('focus'));
    });

    await expect(browser.locator('#cheat-warning-banner')).toContainText('ครั้งที่ 1');

    // Second leave -> must count as 2 (strictly 1:1)
    await browser.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      window.dispatchEvent(new Event('blur'));
      document.dispatchEvent(new Event('visibilitychange'));
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('focus'));
    });

    await expect(browser.locator('#cheat-warning-banner')).toContainText('ครั้งที่ 2');

    // Submitting exam must NOT increment switch count
    const unsub = await browser.onDialog('accept');
    await browser.locator('#exam-question-pager button').last().click();
    await browser.locator('#btn-exam-next').click();
    await unsub();

    await expect(browser.locator('#sec-exam-result')).toBeVisible();
    await expect(browser.locator('#res-tab-switches')).toHaveText('สลับจอ 2 ครั้ง');
  });

  test('recovers mid-exam session at exact question index and preserves remaining time without resetting to 15:00', async ({ app, browser }) => {
    await browser.locator('#sec-home button[onclick="showSection(\'exam-start\')"]').click();
    await browser.locator('#exam-input-name').fill('ทดสอบ รีเฟรช');
    await browser.locator('#exam-input-roll').fill('19');
    await browser.locator('#btn-exam-start-submit').click();

    await browser.locator('#exam-zone-choice button').first().click();
    await browser.locator('#exam-question-pager button').nth(3).click(); // Jump to Q4
    await expect(browser.locator('#exam-q-title')).toContainText('ข้อที่ 4:');

    // Backdate start/end by 3 minutes so remaining time is ~12:00
    await browser.evaluate(() => {
      const raw = localStorage.getItem('u19_exam_active_session');
      const s = JSON.parse(raw!);
      s.startTime -= 3 * 60 * 1000;
      s.endTime -= 3 * 60 * 1000;
      localStorage.setItem('u19_exam_active_session', JSON.stringify(s));
    });

    const unsub = await browser.onDialog('accept');
    await app.open('/');
    await unsub();

    await expect(browser.locator('#sec-exam-live')).toBeVisible();
    await expect(browser.locator('#exam-q-title')).toContainText('ข้อที่ 4:');
    const timerText = ((await browser.locator('#exam-timer-display').textContent()) || '').trim();
    expect(timerText.startsWith('11:') || timerText.startsWith('12:00')).toBe(true);
  });

  test('forces immediate auto-submit and navigates to result screen when timer reaches 00:00', async ({ app, browser }) => {
    await browser.locator('#sec-home button[onclick="showSection(\'exam-start\')"]').click();
    await browser.locator('#exam-input-name').fill('ทดสอบ หมดเวลา');
    await browser.locator('#exam-input-roll').fill('24');
    await browser.locator('#btn-exam-start-submit').click();
    await expect(browser.locator('#sec-exam-live')).toBeVisible();

    // Set saved session deadline to 2 seconds from now and resume via reload
    await browser.evaluate(() => {
      const raw = localStorage.getItem('u19_exam_active_session');
      const s = JSON.parse(raw!);
      s.endTime = Date.now() + 2000;
      localStorage.setItem('u19_exam_active_session', JSON.stringify(s));
    });

    const unsub = await browser.onDialog('accept');
    await app.open('/');
    await unsub();

    // Real 1s timer ticks down to 00:00 and forces transition to #sec-exam-result
    await expect(browser.locator('#sec-exam-result')).toBeVisible();
    await expect(browser.locator('#res-auto-submit-banner')).toContainText('ระบบบังคับส่งกระดาษคำตอบ');
    await expect(browser.locator('#res-student-info')).toContainText('ทดสอบ หมดเวลา');
  });

  test('auto-submits expired session immediately when refreshing after deadline passed', async ({ app, browser }) => {
    await browser.locator('#sec-home button[onclick="showSection(\'exam-start\')"]').click();
    await browser.locator('#exam-input-name').fill('ทดสอบ เลยเวลา');
    await browser.locator('#exam-input-roll').fill('33');
    await browser.locator('#btn-exam-start-submit').click();
    await expect(browser.locator('#sec-exam-live')).toBeVisible();

    // Simulate closing tab and returning 10 seconds AFTER deadline expired
    await browser.evaluate(() => {
      const raw = localStorage.getItem('u19_exam_active_session');
      const s = JSON.parse(raw!);
      s.endTime = Date.now() - 10000;
      localStorage.setItem('u19_exam_active_session', JSON.stringify(s));
    });

    await app.open('/');

    await expect(browser.locator('#sec-exam-result')).toBeVisible();
    await expect(browser.locator('#res-auto-submit-banner')).toContainText('หมดเวลาการสอบขณะออกจากหน้าจอ');
    const remainingSession = await browser.evaluate(() => localStorage.getItem('u19_exam_active_session'));
    expect(remainingSession).toBeNull();
  });
});
