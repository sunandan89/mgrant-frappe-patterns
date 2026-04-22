/**
 * Example: Inject custom content into a specific tab
 *
 * This Client Script demonstrates using getTabWrapper() to safely
 * access a tab and inject a custom header into it.
 */

// --- Paste getTabWrapper() from tab-wrapper.js here ---

frappe.ui.form.on('My DocType', {
  refresh: function(frm) {
    if (frm.is_new()) return;

    setTimeout(function() {
      var $tab = getTabWrapper(frm, 'tab_details');
      if (!$tab) return;

      // Remove any previous injection
      $tab.find('.my-custom-header').remove();

      // Inject a custom header at the top of the tab
      $tab.prepend(
        '<div class="my-custom-header" style="' +
        'padding: 12px 16px; margin-bottom: 16px; ' +
        'background: #EFF6FF; border-radius: 8px; ' +
        'font-size: 14px; color: #1E40AF;">' +
        'Custom content injected into the Details tab' +
        '</div>'
      );
    }, 100);
  }
});
