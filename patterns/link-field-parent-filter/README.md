# Link Field Parent Filter

Filters a child form's Link fields to only show values associated with a parent document's child tables. Auto-fills when exactly one option exists.

## Problem

When a form links to a parent document (e.g. a Story links to a Grant), its Link fields (theme, state, district) show the entire master list. Users must scroll through hundreds of options to find the few that are relevant to their specific Grant. If the parent only has one theme assigned, it should auto-fill.

## Solution

Fetch the parent document once, extract Link values from its child tables (Table, Table MultiSelect), then:
1. **Filter** the child form's Link dropdowns to only show parent-associated values
2. **Auto-fill** if exactly one value exists and the field is empty
3. **Cache** extracted values on `frm` so filters persist across form refreshes

## API

### `auto_fetch_and_filter(frm, parent_doctype, parent_field, mappings)`

Call this in the parent field's change handler.

| Parameter | Type | Description |
|-----------|------|-------------|
| `frm` | object | Current form instance |
| `parent_doctype` | string | Parent DocType to fetch (e.g. `'Grant'`) |
| `parent_field` | string | Field on current form linking to parent (e.g. `'grant'`) |
| `mappings` | Array | Array of field mapping objects (see below) |

### Mapping object

```javascript
{
    source_field: 'custom_project_theme',  // Child table on parent
    source_link: 'theme',                  // Link field inside child table rows
    target_field: 'theme',                 // Link field on current form
    cache_key: '_grant_themes'             // Cache key on frm (optional)
}
```

### `restore_filters(frm, mappings)`

Call this in `refresh` to re-apply filters after form reload.

## Example: Story of Change → Grant

```javascript
var GRANT_MAPPINGS = [
    {
        source_field: 'custom_project_theme',  // Table of Themes Child
        source_link: 'theme',                  // Each row has theme → Link to Themes
        target_field: 'theme',                 // Story's theme field
        cache_key: '_grant_themes'
    },
    {
        source_field: 'states',                // Table MultiSelect of State Child
        source_link: 'state',                  // Each row has state → Link to State
        target_field: 'state',
        cache_key: '_grant_states'
    },
    {
        source_field: 'districts',             // Table MultiSelect of District Child
        source_link: 'district',
        target_field: 'district',
        cache_key: '_grant_districts'
    }
];

frappe.ui.form.on('Story of Change', {
    refresh: function(frm) {
        restore_filters(frm, GRANT_MAPPINGS);
    },
    grant: function(frm) {
        if (frm.doc.grant) {
            auto_fetch_and_filter(frm, 'Grant', 'grant', GRANT_MAPPINGS);
        }
    }
});
```

## How it works

1. On parent field change, fetches the full parent document via `frappe.client.get`
2. For each mapping, extracts Link values from the parent's child table rows
3. Calls `frm.set_query()` to restrict the dropdown to only those values
4. If exactly one value exists and the target field is empty, auto-fills it
5. Caches extracted values on `frm` so `restore_filters()` can re-apply on refresh

## Supports

- **Table** child tables (e.g. `custom_project_theme` with multiple rows)
- **Table MultiSelect** child tables (e.g. `states` with state Link in each row)
- **Direct Link** fields on the parent (e.g. `focus_area` — treated as single-value array)
- Multiple mappings in a single fetch (one API call populates all fields)

## Works in

Client Script

## Gotchas

- The parent document is fetched in full — if the parent has many child tables with thousands of rows, consider using `frappe.call` with specific fields instead
- `set_query` only affects the dropdown; it doesn't prevent programmatic assignment of invalid values
- Make sure the target field's Link DocType matches what the parent's child table stores (e.g. if the child table links to "Themes", the target field must also link to "Themes", not "Focus Area")
