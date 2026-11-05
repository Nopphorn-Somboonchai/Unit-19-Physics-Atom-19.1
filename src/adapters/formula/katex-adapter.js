/**
 * @file katex-adapter.js
 * @description Formula Rendering Adapter wrapping local offline KaTeX library for Unit 19.
 * Safe rendering with fallback handling according to Formula-Display.md standards.
 */

export class KaTeXAdapter {
  /**
   * Render LaTeX string into a target DOM element.
   * @param {string} latex - LaTeX formula string
   * @param {HTMLElement|string} elementOrId - Target DOM element or element ID
   * @param {boolean} [displayMode=false] - True for centered block display ($$), false for inline ($)
   * @returns {boolean} Success status
   */
  static render(latex, elementOrId, displayMode = false) {
    if (typeof document === 'undefined') return false;
    const el = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;

    if (!el) {
      console.warn(`[KaTeXAdapter] Target element "${elementOrId}" not found in DOM`);
      return false;
    }

    if (typeof window.katex === 'undefined') {
      el.textContent = latex;
      return false;
    }

    try {
      window.katex.render(latex, el, {
        displayMode: displayMode,
        throwOnError: false,
        strict: false,
        output: 'htmlAndMathml'
      });
      return true;
    } catch (err) {
      console.error('[KaTeXAdapter] KaTeX render error:', err);
      el.textContent = latex;
      return false;
    }
  }

  /**
   * Render LaTeX string to HTML string.
   * @param {string} latex
   * @param {boolean} [displayMode=false]
   * @returns {string}
   */
  static renderToString(latex, displayMode = false) {
    if (typeof window === 'undefined' || typeof window.katex === 'undefined') {
      return latex;
    }
    try {
      return window.katex.renderToString(latex, {
        displayMode: displayMode,
        throwOnError: false,
        strict: false,
        output: 'htmlAndMathml'
      });
    } catch (e) {
      return latex;
    }
  }

  /**
   * Safely scan and render all mathematical formulas in a container element.
   * @param {HTMLElement|string} [container=document.body]
   */
  static renderAllMath(container = document.body) {
    if (typeof document === 'undefined') return;
    const targetEl = typeof container === 'string' ? document.getElementById(container) : container;
    if (!targetEl) return;

    if (typeof window !== 'undefined' && typeof window.renderMathInElement === 'function') {
      try {
        window.renderMathInElement(targetEl, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '\\(', right: '\\)', display: false },
            { left: '$', right: '$', display: false }
          ],
          ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'input', 'select', 'option'],
          throwOnError: false,
          strict: false,
          errorColor: '#ef4444'
        });
      } catch (err) {
        console.warn('[KaTeXAdapter] renderMathInElement failed:', err);
      }
    }
  }
}

