# Pattern Discovery Prompt

Paste this into any Claude chat where you've built a Frappe feature. It will audit the conversation and codebase for reusable patterns.

---

## The prompt

```
I maintain a shared pattern library for reusable Frappe v16 code at:
https://github.com/sunandan89/mgrant-frappe-patterns

Each pattern is a self-contained utility that solves a specific, recurring problem — not tied to any one feature. Patterns already in the repo:

1. **fuzzy-search** — trigram-based typo-tolerant client-side search with substring fast-path
2. **shadow-dom-keyboard-fix** — prevents Frappe's Awesomebar from hijacking input inside CHB Shadow DOM
3. **frappe-wrapper-guard** — prevents Frappe's form refresh from wiping custom HTML in an HTML field
4. **sticky-table-freeze** — pure CSS frozen headers + left columns (border-collapse: separate fix)
5. **frappe-sequential-save** — recursive promise chain to save multiple Frappe docs without lock conflicts
6. **client-side-xlsx-export** — styled Excel workbook generation in the browser via xlsx-js-style CDN
7. **frappe-dom-data-scraper** — reads live DOM input values instead of stale frm.doc for custom-rendered UIs
8. **frappe-tab-wrapper-access** — safe Tab Break wrapper lookup for Frappe v16 (fields_dict doesn't work, use layout.tabs[])
9. **form-read-view-overlay** — presentation-mode overlay on a form tab with Edit button to restore the form
10. **remote-client-script-deploy** — create/update/patch Client Scripts via frappe.xcall when developer_mode is off

Do NOT re-discover any of the above — they're already extracted.

Review everything we've built in this conversation — the code, the bugs we fixed, the workarounds we used, the utilities we wrote. Identify anything NEW that could be extracted as a reusable pattern. For each candidate, tell me:

- **Pattern name** — short, descriptive (e.g., "chb-deploy-helper", "frappe-date-formatter")
- **What it solves** — the specific problem, in one sentence
- **Why it's reusable** — who else would hit this problem and when
- **Core vs Optional** — what's reusable as-is (CORE) vs what's project-specific customisation (OPTIONAL). Cell locking, locale-specific formatting, business-rule validation — these are OPTIONAL. The generic utility is CORE.
- **What the code would look like** — rough outline of the standalone utility (not the full code, just the shape)
- **Visual diagram** — describe a before/after or flow diagram that explains the pattern visually (will be generated as a PNG later)
- **Confidence** — High (definitely reusable across projects), Medium (reusable but niche), Low (might be too specific to this feature)

Each pattern will be added to the repo as a folder under `patterns/` with:
- `README.md` — when to use, API docs, core vs optional, origin
- `*.js` or `*.css` — standalone utility code (copy-paste ready)
- `example-*.js` — integration example
- `visual-guide.png` — diagram explaining the pattern

Only flag things that are genuinely reusable — not feature-specific business logic. A good pattern is something where another developer building a different feature on Frappe v16 would independently run into the same problem and wish they had a ready-made solution.

If nothing qualifies, just say so — don't force it.
```
