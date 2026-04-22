/**
 * form-read-view-overlay
 *
 * Renders a clean "presentation mode" overlay on a Frappe form tab,
 * hiding all form sections and providing an Edit button to restore
 * the standard form. Uses frappe-tab-wrapper-access internally.
 *
 * CORE: Tab discovery + children hide/show + overlay inject + edit/back buttons
 * OPTIONAL: The specific HTML layout inside the overlay (article, dashboard, etc.)
 */

/**
 * Get the jQuery wrapper for a Tab Break field in Frappe v16.
 * (Inlined from frappe-tab-wrapper-access pattern)
 */
function getTabWrapper(frm, tabFieldname) {
  if (frm.layout && frm.layout.tabs) {
    for (var i = 0; i < frm.layout.tabs.length; i++) {
      var tab = frm.layout.tabs[i];
      if (tab.df && tab.df.fieldname === tabFieldname) {
        if (tab.wrapper && tab.wrapper.length) return tab.wrapper;
        return null;
      }
    }
  }
  if (frm.fields_dict && frm.fields_dict[tabFieldname]) {
    var field = frm.fields_dict[tabFieldname];
    if (field.$wrapper && field.$wrapper.length) return field.$wrapper;
  }
  return null;
}

/**
 * Build a read-view overlay on a Frappe form tab.
 *
 * @param {Object} frm - The Frappe form object (cur_frm)
 * @param {Object} options
 * @param {string} options.tabFieldname - The Tab Break fieldname to target
 * @param {Function} options.renderContent - (frm) => string — returns the HTML for the overlay body
 * @param {Function} [options.renderCSS] - () => string — returns CSS rules (injected in <style>)
 * @param {string} [options.overlayClass='rv-overlay'] - CSS class for the overlay wrapper
 * @param {string} [options.editLabel='Edit'] - Label for the edit button
 * @param {string} [options.backLabel='Back'] - Label for the back button
 * @param {string} [options.backUrl] - URL for the back button (omit to hide back button)
 * @param {string} [options.editColor='#B45309'] - Background color for the edit button
 * @param {Function} [options.onEdit] - Callback after edit button restores the form
 * @returns {boolean} true if overlay was rendered, false if tab not found
 */
function buildReadViewOverlay(frm, options) {
  var tabFieldname = options.tabFieldname;
  var overlayClass = options.overlayClass || 'rv-overlay';

  // Find the tab
  var $tab = getTabWrapper(frm, tabFieldname);
  if (!$tab) return false;

  // Remove any previous overlay
  $tab.find('.' + overlayClass).remove();

  // Build toolbar
  var editColor = options.editColor || '#B45309';
  var editHoverColor = darkenColor(editColor);
  var toolbar = '<div class="rv-overlay-toolbar">' +
    '<button class="btn btn-sm rv-overlay-btn-edit" style="' +
      'background:' + editColor + ' !important;color:white !important;' +
      'border:none !important;padding:7px 18px !important;border-radius:6px !important;' +
      'font-size:13px !important;font-weight:600 !important;cursor:pointer !important;">' +
      (options.editLabel || 'Edit') +
    '</button>';

  if (options.backUrl) {
    toolbar += '<button class="btn btn-sm rv-overlay-btn-back" style="' +
      'background:#F3F4F6 !important;color:#374151 !important;' +
      'border:1px solid #E5E7EB !important;padding:7px 16px !important;' +
      'border-radius:6px !important;font-size:13px !important;font-weight:500 !important;' +
      'cursor:pointer !important;">' +
      (options.backLabel || 'Back') +
    '</button>';
  }
  toolbar += '</div>';

  // Build overlay HTML
  var css = options.renderCSS ? '<style>' + options.renderCSS() + '</style>' : '';
  var content = options.renderContent(frm);

  var html = '<div class="' + overlayClass + '">' +
    css +
    '<style>' +
    '.rv-overlay-toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding:0 4px; }' +
    '</style>' +
    toolbar +
    content +
    '</div>';

  // Hide all form children, inject overlay
  $tab.children().hide();
  $tab.prepend(html);

  // Wire up Edit button
  $tab.find('.rv-overlay-btn-edit').on('click', function() {
    $tab.find('.' + overlayClass).remove();
    $tab.children().show();
    if (options.onEdit) options.onEdit(frm);
  });

  // Wire up Back button
  if (options.backUrl) {
    $tab.find('.rv-overlay-btn-back').on('click', function() {
      window.location.href = options.backUrl;
    });
  }

  return true;
}

/**
 * Simple color darkener for hover states.
 * Takes a hex color and returns a darker shade.
 */
function darkenColor(hex) {
  hex = hex.replace('#', '');
  var r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 30);
  var g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 30);
  var b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 30);
  return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}
