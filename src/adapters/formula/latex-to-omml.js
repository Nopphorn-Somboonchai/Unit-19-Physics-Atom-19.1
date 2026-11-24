/**
 * @file latex-to-omml.js
 * @description Converts LaTeX expressions into native Microsoft Word Office Math Markup Language (OMML <m:oMath>)
 * using MathJax v3 (TeX -> Presentation MathML) + mathml2omml (MathML -> OMML) + docx ImportedXmlComponent.
 * Runs 100% client-side and offline with zero external network calls.
 * Conforms to Physics Learning Standard (v1.13.0) — Formula Adapter Layer.
 */

import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import 'mathjax-full/js/input/tex/base/BaseConfiguration.js';
import 'mathjax-full/js/input/tex/ams/AmsConfiguration.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { SerializedMmlVisitor } from 'mathjax-full/js/core/MmlTree/SerializedMmlVisitor.js';
import { mml2omml } from 'mathml2omml';
import { ImportedXmlComponent } from 'docx';

let _mathJaxCtx = null;

function getMathJaxContext() {
  if (_mathJaxCtx) return _mathJaxCtx;

  const adaptor = liteAdaptor();
  RegisterHTMLHandler(adaptor);
  const texInput = new TeX({ packages: ['base', 'ams'] });
  const mathDoc = mathjax.document('', { InputJax: texInput });
  const mmlVisitor = new SerializedMmlVisitor();

  _mathJaxCtx = { mathDoc, mmlVisitor };
  return _mathJaxCtx;
}

/**
 * Sanitize raw OMML produced by mathml2omml so Microsoft Word renders every construct cleanly:
 * 1. Strip invisible U+2061 (FUNCTION APPLICATION) characters emitted by MathJax.
 * 2. Unwrap mathml2omml's malformed <m:sSup>...<m:sub/></m:sSup> wrapper inside <m:bar>.
 * 3. Inject Cambria Math (ASCII/HAnsi) + TH SarabunPSK (Complex Script Thai) run formatting into <m:r>.
 *
 * @param {string} rawOmml
 * @param {number} fontSizeHalfPts - Half-point size (e.g. 22 = 11pt, 24 = 12pt)
 * @returns {string} Clean <m:oMath> XML string
 */
export function sanitizeOmml(rawOmml, fontSizeHalfPts = 22) {
  let clean = String(rawOmml || '');

  // 1. Remove invisible function application U+2061 and redundant outer xmlns attributes
  clean = clean.replace(/\u2061|&#x2061;/gi, '');

  // 2. Fix mathml2omml v0.5.0 <mover> bug: <m:sSup><m:sSupPr><m:ctrlPr/></m:sSupPr><m:e>INNER</m:e><m:sub/></m:sSup>
  let prev;
  do {
    prev = clean;
    clean = clean.replace(
      /<m:sSup><m:sSupPr><m:ctrlPr\/><\/m:sSupPr><m:e>((?:(?!<m:sSup>).)*?)<\/m:e><m:sub\/><\/m:sSup>/g,
      '$1'
    );
  } while (clean !== prev);

  // 3. Ensure every <m:r> specifies Cambria Math (Latin/Math) and TH SarabunPSK (Thai complex script)
  const wRPr = `<w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math" w:cs="TH SarabunPSK"/><w:sz w:val="${fontSizeHalfPts}"/><w:szCs w:val="${fontSizeHalfPts}"/></w:rPr>`;
  clean = clean.replace(/<m:r>((?:<m:rPr>[\s\S]*?<\/m:rPr>)?)(<m:t\b)/g, `<m:r>$1${wRPr}$2`);

  return clean;
}

/**
 * Convert a LaTeX math string to sanitized Word OMML XML string (<m:oMath>...</m:oMath>)
 * @param {string} latex - LaTeX expression (without surrounding $ delimiters)
 * @param {{ display?: boolean, fontSizeHalfPts?: number }} [options]
 * @returns {string}
 */
export function latexToOmmlString(latex, { display = false, fontSizeHalfPts = 22 } = {}) {
  const { mathDoc, mmlVisitor } = getMathJaxContext();
  const mmlNode = mathDoc.convert(latex, { display });
  const mmlString = mmlVisitor.visitTree(mmlNode);
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
