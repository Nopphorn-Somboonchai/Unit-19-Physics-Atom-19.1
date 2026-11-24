/**
 * @file worksheet-docx.test.js
 * @description Automated verification for Activity 19.1 blank .docx worksheet generation
 * and LaTeX -> MathJax -> native Microsoft Word OMML (<m:oMath>) equation conversion.
 */

import assert from 'node:assert';
import zlib from 'node:zlib';
import { latexToOmmlString } from '../src/adapters/formula/latex-to-omml.js';
import { generateBlankLabWorksheetBuffer } from '../src/adapters/export/gas-spectrum-worksheet-docx.js';

/**
 * Extract a named entry from an uncompressed or DEFLATE-compressed ZIP buffer.
 * @param {Buffer} zipBuffer
 * @param {string} targetName
 * @returns {string} UTF-8 text contents
 */
function extractZipEntryText(zipBuffer, targetName) {
  let offset = 0;
  while (offset + 30 <= zipBuffer.length) {
    const sig = zipBuffer.readUInt32LE(offset);
    if (sig !== 0x04034b50) break;

    const flags = zipBuffer.readUInt16LE(offset + 6);
    const compression = zipBuffer.readUInt16LE(offset + 8);
    let compSize = zipBuffer.readUInt32LE(offset + 18);
    const nameLen = zipBuffer.readUInt16LE(offset + 26);
    const extraLen = zipBuffer.readUInt16LE(offset + 28);

    const nameStart = offset + 30;
    const fileName = zipBuffer.subarray(nameStart, nameStart + nameLen).toString('utf8');
    const dataStart = nameStart + nameLen + extraLen;

    if ((flags & 0x08) !== 0 && compSize === 0) {
      let nextSigOffset = dataStart;
      while (nextSigOffset + 4 <= zipBuffer.length) {
        const candidate = zipBuffer.readUInt32LE(nextSigOffset);
        if (candidate === 0x08074b50) {
          compSize = zipBuffer.readUInt32LE(nextSigOffset + 8);
          break;
        }
        if (candidate === 0x04034b50 || candidate === 0x02014b50) {
          compSize = nextSigOffset - dataStart;
          break;
        }
        nextSigOffset++;
      }
      const rawData = zipBuffer.subarray(dataStart, dataStart + compSize);
      if (fileName === targetName) {
        if (compression === 0) return rawData.toString('utf8');
        if (compression === 8) return zlib.inflateRawSync(rawData).toString('utf8');
      }
      const hasDataDescSig = zipBuffer.readUInt32LE(dataStart + compSize) === 0x08074b50;
      offset = dataStart + compSize + (hasDataDescSig ? 16 : 0);
      continue;
    }

    const rawData = zipBuffer.subarray(dataStart, dataStart + compSize);
    if (fileName === targetName) {
      if (compression === 0) return rawData.toString('utf8');
      if (compression === 8) return zlib.inflateRawSync(rawData).toString('utf8');
    }

    offset = dataStart + compSize;
  }
  throw new Error(`Entry "${targetName}" not found in generated .docx ZIP archive`);
}

console.log('=============== 🧪 RUNNING .DOCX WORKSHEET & OMML TESTS ===============\n');

// Test Suite 1: LaTeX -> MathJax -> Sanitized OMML
const ommlSin = latexToOmmlString('\\sin\\theta = \\frac{\\bar{x}}{\\sqrt{D^2 + \\bar{x}^2}}', { fontSizeHalfPts: 20 });
assert(ommlSin.includes('<m:oMath'), 'OMML contains <m:oMath> root element');
assert(ommlSin.includes('<m:f>'), 'Fraction rendered as native Word <m:f>');
assert(ommlSin.includes('<m:rad>'), 'Square root rendered as native Word <m:rad>');
assert(ommlSin.includes('<m:bar>'), 'Overbar x-bar rendered as native Word <m:bar>');
assert(ommlSin.includes('<m:sSup>'), 'Squared terms rendered as native Word <m:sSup>');
assert(!ommlSin.includes('<m:sub/>'), 'Malformed mathml2omml <m:sub/> wrapper inside <m:bar> is unwrapped cleanly');
assert(!ommlSin.includes('\u2061'), 'Invisible U+2061 function application character stripped');
assert(ommlSin.includes('Cambria Math'), 'Cambria Math font assigned for OMML math runs');
console.log('✅ [PASS] LaTeX -> MathJax -> Sanitized Word OMML (<m:oMath>) verified');

// Test Suite 2: Generated .docx binary archive & word/document.xml
const rawBuf = Buffer.from(await generateBlankLabWorksheetBuffer());
assert(rawBuf.length > 2000, `Generated .docx buffer should be substantial (got ${rawBuf.length} bytes)`);
assert.strictEqual(rawBuf.subarray(0, 2).toString('ascii'), 'PK', 'Generated .docx starts with valid ZIP "PK" signature');
console.log(`✅ [PASS] Generated valid .docx binary archive (${rawBuf.length} bytes)`);

const docXml = extractZipEntryText(rawBuf, 'word/document.xml');
assert(docXml.length > 1000, 'word/document.xml extracted successfully');

// Check Page Setup: A4 Landscape + 0.5 inch (720 twips) narrow margins
assert(docXml.includes('w:orient="landscape"'), 'Page orientation is Landscape');
assert(
  docXml.includes('w:top="720"') &&
    docXml.includes('w:bottom="720"') &&
    docXml.includes('w:left="720"') &&
    docXml.includes('w:right="720"'),
  'Margins are set to 0.5 inch (720 twips)'
);
console.log('✅ [PASS] Page setup verified: A4 Landscape with 0.5-inch (720 twips) narrow margins');

// Verify native Word OMML equations are embedded inside word/document.xml (and no broken <m:sub/> bug)
const oMathMatches = docXml.match(/<m:oMath\b/g) || [];
assert(oMathMatches.length >= 15, `Expected >= 15 native Word <m:oMath> equations, found ${oMathMatches.length}`);
assert(!docXml.includes('<m:sub/>'), 'Document XML contains zero malformed <m:sub/> tags');
assert(docXml.includes('<m:f>') && docXml.includes('<m:rad>') && docXml.includes('<m:bar>'), 'Document XML contains native fractions, radicals, and overbars');
console.log(`✅ [PASS] Embedded ${oMathMatches.length} native Microsoft Word OMML (<m:oMath>) equations in word/document.xml`);

// Check all required Thai worksheet elements
const requiredTexts = [
  'ใบงานกิจกรรม 19.1 เรื่อง การศึกษาสเปกตรัมของแก๊สร้อน',
  'จุดประสงค์การเรียนรู้',
  'ตารางบันทึกผลการทำกิจกรรม 19.1',
  'ไฮโดรเจน (',
  'นีออน (',
  'แสดงวิธีทำตัวอย่างการคำนวณ 1 เส้นสี',
  'สเปกตรัมจากหลอดบรรจุแก๊สมีลักษณะเหมือนกับสเปกตรัมจากหลอดไฟฟ้าทั่วไปหรือไม่ อย่างไร?',
  'สเปกตรัมจากหลอดบรรจุแก๊สแต่ละชนิดมีลักษณะเหมือนและต่างกันอย่างไร?',
  'สเปกตรัมจากหลอดบรรจุแก๊สไฮโดรเจน ประกอบด้วยแสงที่มีความยาวคลื่นเท่าใดบ้าง?',
  'ชื่อผู้เรียน',
  'ชั้น',
  'เลขที่',
  'นายนพพร สมบูรณ์ชัย'
];

for (const snippet of requiredTexts) {
  assert(docXml.includes(snippet), `Worksheet XML must contain "${snippet}"`);
}
console.log(`✅ [PASS] All ${requiredTexts.length} required Thai worksheet sections verified`);

console.log('\n=======================================================');
console.log('📊 WORKSHEET .DOCX & OMML TEST SUMMARY: ALL PASSED');
console.log('=======================================================\n');
