// Example: Story of Change — auto-populate theme, state, district from Grant
//
// Grant has:
//   custom_project_theme: Table of "Themes Child" (each row: theme → Link to Themes)
//   states: Table MultiSelect of "State Child" (each row: state → Link to State)
//   districts: Table MultiSelect of "District Child" (each row: district → Link to District)
//
// Story of Change has:
//   theme: Link to Themes
//   state: Link to State (was Data, changed to Link via Property Setter)
//   district: Link to District (was Data, changed to Link via Property Setter)

var GRANT_MAPPINGS = [
    {
        source_field: 'custom_project_theme',
        source_link: 'theme',
        target_field: 'theme',
        cache_key: '_grant_themes'
    },
    {
        source_field: 'states',
        source_link: 'state',
        target_field: 'state',
        cache_key: '_grant_states'
    },
    {
        source_field: 'districts',
        source_link: 'district',
        target_field: 'district',
        cache_key: '_grant_districts'
    }
];

frappe.ui.form.on('Story of Change', {

    refresh: function(frm) {
        // Re-apply filters on form refresh (uses cached values)
        restore_filters(frm, GRANT_MAPPINGS);
    },

    grant: function(frm) {
        if (frm.doc.grant) {
            auto_fetch_and_filter(frm, 'Grant', 'grant', GRANT_MAPPINGS);
        } else {
            // Clear caches when grant is removed
            GRANT_MAPPINGS.forEach(function(m) {
                if (m.cache_key) frm[m.cache_key] = null;
            });
        }
    },

    state: function(frm) {
        // Clear district when state changes — user should pick a new district
        frm.set_value('district', '');
    }
});

// ── Inline the utility functions below, or load from link-field-parent-filter.js ──

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
                    values = source.map(function(row) {
                        return row[m.source_link || m.target_field];
                    }).filter(Boolean);
                } else if (source) {
                    values = [source];
                }

                if (m.cache_key) frm[m.cache_key] = values;

                if (values.length > 0) {
                    frm.set_query(m.target_field, function() {
                        return { filters: { name: ['in', values] } };
                    });
                }

                if (values.length === 1 && !frm.doc[m.target_field]) {
                    frm.set_value(m.target_field, values[0]);
                }
            });
        }
    });
}

function restore_filters(frm, mappings) {
    mappings.forEach(function(m) {
        if (m.cache_key && frm[m.cache_key] && frm[m.cache_key].length) {
            frm.set_query(m.target_field, function() {
                return { filters: { name: ['in', frm[m.cache_key]] } };
            });
        }
    });
}
