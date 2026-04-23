/**
 * Link Field Parent Filter
 *
 * Filters a child form's Link field to only show options associated with
 * a parent document's child table. Also auto-fills when exactly one option exists.
 *
 * Common use case: a child DocType (e.g. Story of Change) links to a parent
 * (e.g. Grant) and should only offer themes/states/districts that belong to
 * that specific Grant, not the entire master list.
 *
 * Works with:
 *   - Table (child table with Link fields)
 *   - Table MultiSelect (child table with single Link field)
 *   - Direct Link fields on the parent
 *
 * @param {object} frm - Current Frappe form instance
 * @param {string} parent_doctype - Parent DocType to fetch (e.g. 'Grant')
 * @param {string} parent_field - Field on current form linking to parent (e.g. 'grant')
 * @param {Array} mappings - Array of mapping objects:
 *   {
 *     source_field: 'custom_project_theme',  // child table field on parent
 *     source_link: 'theme',                   // Link field inside child table rows
 *     target_field: 'theme',                  // Link field on current form to filter/fill
 *     cache_key: '_grant_themes'              // optional cache key on frm
 *   }
 */
function auto_fetch_and_filter(frm, parent_doctype, parent_field, mappings) {
    if (!frm.doc[parent_field]) return;

    frappe.call({
        method: 'frappe.client.get',
        args: { doctype: parent_doctype, name: frm.doc[parent_field] },
        callback: function(r) {
            if (!r.message) return;
            var parent = r.message;

            mappings.forEach(function(m) {
                var source = parent[m.source_field];
                var values = [];

                if (Array.isArray(source)) {
                    // Child table — extract Link values from rows
                    values = source.map(function(row) {
                        return row[m.source_link || m.target_field];
                    }).filter(Boolean);
                } else if (source) {
                    // Direct Link field on parent
                    values = [source];
                }

                // Cache on frm for reuse in refresh
                if (m.cache_key) {
                    frm[m.cache_key] = values;
                }

                // Set dropdown filter
                if (values.length > 0) {
                    frm.set_query(m.target_field, function() {
                        return { filters: { name: ['in', values] } };
                    });
                }

                // Auto-fill if exactly one value and field is empty
                if (values.length === 1 && !frm.doc[m.target_field]) {
                    frm.set_value(m.target_field, values[0]);
                }
            });
        }
    });
}

/**
 * Restore filters on form refresh (uses cached values from previous fetch)
 *
 * Call this in the refresh handler to re-apply filters after the form reloads.
 *
 * @param {object} frm - Current Frappe form instance
 * @param {Array} mappings - Same mappings array used in auto_fetch_and_filter
 */
function restore_filters(frm, mappings) {
    mappings.forEach(function(m) {
        if (m.cache_key && frm[m.cache_key] && frm[m.cache_key].length) {
            frm.set_query(m.target_field, function() {
                return { filters: { name: ['in', frm[m.cache_key]] } };
            });
        }
    });
}
