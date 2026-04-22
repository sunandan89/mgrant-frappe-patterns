/**
 * frappe-tab-wrapper-access
 *
 * Safe accessor for Tab Break wrappers in Frappe v16.
 * frm.fields_dict.tab_name.$wrapper is undefined in v16 — tabs live
 * under frm.layout.tabs[] with a .wrapper jQuery property.
 *
 * CORE: Tab lookup by fieldname, returns jQuery wrapper or null
 * OPTIONAL: Fallback for v15 (fields_dict path), multi-tab lookup
 */

/**
 * Get the jQuery wrapper for a Tab Break field in Frappe v16.
 *
 * @param {Object} frm - The Frappe form object (cur_frm)
 * @param {string} tabFieldname - The fieldname of the Tab Break (e.g., 'tab_story')
 * @returns {jQuery|null} The tab's jQuery wrapper, or null if not found
 *
 * @example
 *   var $tab = getTabWrapper(frm, 'tab_story');
 *   if ($tab) {
 *     $tab.prepend('<div>My custom content</div>');
 *   }
 */
function getTabWrapper(frm, tabFieldname) {
  // Frappe v16: tabs are in frm.layout.tabs[]
  if (frm.layout && frm.layout.tabs) {
    for (var i = 0; i < frm.layout.tabs.length; i++) {
      var tab = frm.layout.tabs[i];
      if (tab.df && tab.df.fieldname === tabFieldname) {
        // tab.wrapper is a jQuery object in v16
        if (tab.wrapper && tab.wrapper.length) {
          return tab.wrapper;
        }
        return null;
      }
    }
  }

  // Fallback: Frappe v15 style (fields_dict path)
  if (frm.fields_dict && frm.fields_dict[tabFieldname]) {
    var field = frm.fields_dict[tabFieldname];
    if (field.$wrapper && field.$wrapper.length) {
      return field.$wrapper;
    }
  }

  return null;
}

/**
 * Get all Tab Break wrappers as a name→jQuery map.
 * Useful when you need to operate on multiple tabs at once.
 *
 * @param {Object} frm - The Frappe form object
 * @returns {Object} Map of { fieldname: $wrapper }
 *
 * @example
 *   var tabs = getAllTabWrappers(frm);
 *   if (tabs.tab_story) tabs.tab_story.addClass('my-custom-class');
 */
function getAllTabWrappers(frm) {
  var result = {};
  if (frm.layout && frm.layout.tabs) {
    frm.layout.tabs.forEach(function(tab) {
      if (tab.df && tab.wrapper && tab.wrapper.length) {
        result[tab.df.fieldname] = tab.wrapper;
      }
    });
  }
  return result;
}
