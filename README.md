# mGrant Frappe Patterns

Reusable utility code and patterns for Frappe v16 development at Dhwani RIS. Each pattern is self-contained — copy what you need into your project.

## Pattern Directory

| Pattern | Description | Works in |
|---------|-------------|----------|
| [Fuzzy Search](patterns/fuzzy-search/) | Typo-tolerant client-side search using trigram similarity. Catches 1–2 char typos with zero dependencies. | CHB, Client Script, Page |
| [Shadow DOM Keyboard Fix](patterns/shadow-dom-keyboard-fix/) | Prevents Frappe's Awesomebar from hijacking keyboard input inside Custom HTML Blocks. | CHB only |
| [Wrapper Guard](patterns/frappe-wrapper-guard/) | Prevents Frappe's form refresh from wiping custom HTML rendered into an HTML field. | Client Script |
| [Sticky Table Freeze](patterns/sticky-table-freeze/) | Pure CSS frozen headers + frozen left columns for scrollable HTML tables. Fixes the `border-collapse` trap. | Client Script, CHB, Page |
| [Sequential Save](patterns/frappe-sequential-save/) | Recursive promise chain for saving multiple Frappe documents without lock conflicts. | Client Script, CHB, Page |
| [Client-Side XLSX Export](patterns/client-side-xlsx-export/) | Styled Excel workbook generation in the browser using xlsx-js-style CDN. Core + optional utilities. | Client Script, CHB, Page |
| [DOM Data Scraper](patterns/frappe-dom-data-scraper/) | Reads live input values from the DOM instead of stale `frm.doc` for custom-rendered UIs. | Client Script, CHB |

## How to use

1. Go to the pattern folder you need
2. Read its README for context and integration guide
3. Copy the `.js` file into your project (inline it in your CHB script, or load it as needed)
4. Adapt the example to your DocType's fields

Each pattern folder contains:
- **`*.js`** — The standalone utility code (copy this)
- **`README.md`** — When to use, API docs, tuning guide, tested examples
- **`example-*.js`** — Integration example for common contexts (CHB, Client Script, etc.)

## Adding a new pattern

1. Create a folder under `patterns/` with a descriptive name
2. Add the utility `.js` file, a `README.md`, and an example if helpful
3. Update this table above
4. Commit and push

## Context

These patterns emerged from building mGrant features (Stories of Change, NGO Directory, Document Repository, LIC HFL Budget Allocation) on Frappe v16 with `developer_mode` off. They solve real problems encountered during development and are tested on the mGrant staging instance.

## Related repos

- [mgrant-stories-of-change](https://github.com/sunandan89/mgrant-stories-of-change) — Stories of Change feature (uses fuzzy-search + shadow-dom-keyboard-fix)
- [lic-hfl-budget-allocation](https://github.com/sunandan89/lic-hfl-budget-allocation) — LIC HFL Budget Allocation feature (uses wrapper-guard, sticky-table-freeze, sequential-save, xlsx-export, dom-data-scraper)
