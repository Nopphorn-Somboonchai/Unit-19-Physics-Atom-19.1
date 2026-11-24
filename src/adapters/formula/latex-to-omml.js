/**
 * @file latex-to-omml.js
 * @description Converts LaTeX expressions into native Microsoft Word Office Math Markup Language (OMML <m:oMath>)
 * using KaTeX (LaTeX -> Presentation MathML, 100% browser-safe) + mathml2omml (MathML -> OMML) + docx ImportedXmlComponent.
 * Runs 100% client-side and offline with zero Node-only APIs or eval('require') calls.
 * Conforms to Physics Learning Standard (v1.13.0) — Formula Adapter Layer.
 */

import katex from 'katex';
import { mml2omml } from 'mathml2omml';
import { ImportedXmlComponent } from 'docx';

/**
 * Sanitize raw OMML produced by mathml2omml so Microsoft Word renders every construct cleanly:
 * 1. Strip invisible U+2061 (FUNCTION APPLICATION) characters.
 * 2. Convert KaTeX modifier-macron accent (<m:acc><m:accPr><m:chr m:val="ˉ"/></m:accPr>...)
 *    into Word's native top overbar (<m:bar><m:barPr><m:pos m:val="top"/></m:barPr>...) for crisp x-bar alignment.
 * 3. Inject Cambria Math (ASCII/HAnsi) + TH SarabunPSK (Complex Script Thai) run formatting into <m:r>.
 *
 * @param {string} rawOmml
 * @param {number} fontSizeHalfPts - Half-point size (e.g. 20 = 10pt, 22 = 11pt)
 * @returns {string} Clean <m:oMath> XML string
 */
export function sanitizeOmml(rawOmml, fontSizeHalfPts = 22) {
  let clean = String(rawOmml || '');

  // 1. Strip invisible function application U+2061
  clean = clean.replace(/\u2061|&#x2061;/gi, '');

  // 2. Convert modifier-macron accent (ˉ / ¯) into native Word top overbar <m:bar>
  clean = clean.replace(
    /<m:acc><m:accPr><m:chr m:val="[ˉ¯\u0304]"\/><\/m:accPr><m:e>([\s\S]*?)<\/m:e><\/m:acc>/g,
    '<m:bar><m:barPr><m:pos m:val="top"/></m:barPr><m:e>$1</m:e></m:bar>'
  );

  // 3. Ensure every <m:r> specifies Cambria Math (Latin/Math) and TH SarabunPSK (Thai complex script)
  const wRPr = `<w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="TH SarabunPSK"/><w:sz w:val="${fontSizeHalfPts}"/><w:szCs w:val="${fontSizeHalfPts}"/></w:rPr>`;
  clean = clean.replace(/<m:r>((?:<m:rPr>[\s\S]*?<\/m:rPr>)?)(<m:t\b)/g, `<m:r>$1${wRPr}$2`);

  return clean;
}

/**
 * Convert a LaTeX math string to Presentation MathML via KaTeX
 * @param {string} latex
 * @param {boolean} [display=false]
 * @returns {string}
 */
export function latexToMathML(latex, display = false) {
  const rendered = katex.renderToString(latex, {
    output: 'mathml',
    displayMode: Boolean(display),
    throwOnError: true,
    strict: 'ignore'
  });
  const match = rendered.match(/<math[\s\S]*?<\/math>/);
  if (!match) {
    throw new Error(`[latexToMathML] KaTeX did not produce <math> markup for: ${latex}`);
  }
  // Remove <annotation encoding="application/x-tex"> so mathml2omml only converts Presentation MathML
  return match[0]
    .replace(/<annotation[\s\S]*?<\/annotation>/g, '')
    .replace(/<\/?semantics>/g, '');
}

/**
 * Convert a LaTeX math string to sanitized Word OMML XML string (<m:oMath>...</m:oMath>)
 * @param {string} latex - LaTeX expression (without surrounding $ delimiters)
 * @param {{ display?: boolean, fontSizeHalfPts?: number }} [options]
 * @returns {string}
 */
export function latexToOmmlString(latex, { display = false, fontSizeHalfPts = 22 } = {}) {
  const mmlString = latexToMathML(latex, display);
  const rawOmml = mml2omml(mmlString);
  return sanitizeOmml(rawOmml, fontSizeHalfPts);
}

/**
 * Convert a LaTeX math string directly into a docx Paragraph child component (<m:oMath>)
 * @param {string} latex - LaTeX expression (without surrounding $ delimiters)
 * @param {{ display?: boolean, fontSizeHalfPts?: number }} [options]
 * @returns {object} XML component compatible with docx Paragraph children[]
 */
export function latexToDocxMath(latex, options = {}) {
  const ommlXml = latexToOmmlString(latex, options);
  const imported = ImportedXmlComponent.fromXmlString(ommlXml);
  if (!imported || !imported.root || imported.root.length === 0) {
    throw new Error(`[latexToDocxMath] Failed to parse OMML for LaTeX: ${latex}`);
  }
  return imported.root[0];
}
