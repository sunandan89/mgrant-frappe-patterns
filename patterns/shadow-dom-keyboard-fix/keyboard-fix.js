/**
 * Shadow DOM Keyboard Fix for Frappe v16 Custom HTML Blocks
 *
 * Problem: Frappe's global Awesomebar handler intercepts keystrokes when
 * the active element is inside a Shadow DOM. `document.activeElement`
 * returns the shadow host (not the inner input), so Frappe thinks no
 * input is focused and redirects typing to the navbar search bar.
 *
 * Fix: Stop ALL keyboard events (keydown, keypress, keyup) from
 * propagating out of the shadow DOM boundary. This must be applied to
 * every text input and textarea inside the CHB.
 *
 * @version 1.0.0
 * @license MIT
 */

/**
 * Apply the keyboard fix to a single input element inside a CHB shadow DOM.
 *
 * @param {HTMLElement} inputEl - The input or textarea element
 * @param {Object} [options] - Configuration
 * @param {Function} [options.onEnter] - Callback when Enter is pressed
 * @param {boolean} [options.preventDefault] - Also prevent default on Enter (default: true)
 *
 * @example
 * // Basic — just stop the Awesomebar hijack
 * fixShadowDomKeyboard(root_element.querySelector('#my-input'));
 *
 * @example
 * // With Enter handler — trigger search on Enter
 * fixShadowDomKeyboard(root_element.querySelector('#search-input'), {
 *   onEnter: function() { applyFilters(); }
 * });
 */
function fixShadowDomKeyboard(inputEl, options) {
  if (!inputEl) return;
  var opts = options || {};
  var preventDefault = opts.preventDefault !== undefined ? opts.preventDefault : true;

  ['keydown', 'keypress', 'keyup'].forEach(function(evt) {
    inputEl.addEventListener(evt, function(e) {
      e.stopPropagation();
      if (opts.onEnter && e.type === 'keydown' && (e.key === 'Enter' || e.keyCode === 13)) {
        if (preventDefault) e.preventDefault();
        opts.onEnter(e);
      }
    });
  });
}

/**
 * Apply the keyboard fix to ALL text inputs and textareas inside a shadow root.
 * Call this once after your CHB HTML has rendered.
 *
 * @param {ShadowRoot|HTMLElement} rootEl - The shadow root or root_element
 * @param {Object} [options] - Configuration (same as fixShadowDomKeyboard)
 *
 * @example
 * // Fix all inputs in the CHB at once
 * fixAllShadowDomInputs(root_element);
 */
function fixAllShadowDomInputs(rootEl, options) {
  var inputs = rootEl.querySelectorAll('input[type="text"], input[type="search"], input:not([type]), textarea');
  inputs.forEach(function(el) {
    fixShadowDomKeyboard(el, options);
  });
}


// ── Export for different contexts ──

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fixShadowDomKeyboard: fixShadowDomKeyboard,
    fixAllShadowDomInputs: fixAllShadowDomInputs
  };
}

if (typeof window !== 'undefined') {
  window.FrappePatterns = window.FrappePatterns || {};
  window.FrappePatterns.keyboardFix = {
    fixShadowDomKeyboard: fixShadowDomKeyboard,
    fixAllShadowDomInputs: fixAllShadowDomInputs
  };
}
