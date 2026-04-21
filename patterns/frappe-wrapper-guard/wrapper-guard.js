/**
 * frappe-wrapper-guard
 *
 * Prevents Frappe's form refresh from wiping custom HTML rendered
 * into an HTML-type field's $wrapper.
 *
 * Usage:
 *   const $w = frm.fields_dict.my_html_field.$wrapper;
 *   wrapperGuard($w);
 *   safeRender($w, frm, '<div>My UI</div>');
 */

/**
 * Monkey-patch $wrapper.html() to block external overwrites.
 * Idempotent — safe to call on every refresh.
 *
 * @param {jQuery} $wrapper - The HTML field's $wrapper element
 */
function wrapperGuard($wrapper) {
  if ($wrapper._wg_patched) return;

  var origHtml = $.fn.html;

  $wrapper.html = function () {
    // Read calls (.html() with no args) always pass through
    if (arguments.length === 0) return origHtml.apply(this, arguments);

    // Write calls only pass if the self-render flag is set
    if ($wrapper._wg_allow) return origHtml.apply(this, arguments);

    // Block external writes (Frappe refresh cycle)
    return this;
  };

  $wrapper._wg_patched = true;
}

/**
 * Safely render HTML into a guarded wrapper.
 * Sets the allow flag, writes content, then clears the flag.
 *
 * @param {jQuery} $wrapper - The guarded wrapper
 * @param {Object} frm - Frappe form object (unused but available for extensions)
 * @param {string} htmlString - HTML content to render
 */
function safeRender($wrapper, frm, htmlString) {
  $wrapper._wg_allow = true;
  $wrapper.html(htmlString);
  $wrapper._wg_allow = false;
}
