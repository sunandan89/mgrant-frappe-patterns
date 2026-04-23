# Pattern Usage Matrix

Tracks where each pattern has been used across projects and features. This helps measure pattern adoption, identify candidates for improvement, and demonstrate reuse value.

**Data source:** [`usage.json`](usage.json) — the machine-readable version. Update `usage.json` when you use a pattern, then regenerate this file (or update manually).

## Summary

| Pattern | Total Uses | Projects |
|---------|-----------|----------|
| fuzzy-search | 2 | mgrant-stories-of-change, mgrant-document-repository |
| shadow-dom-keyboard-fix | 2 | mgrant-stories-of-change, mgrant-document-repository |
| frappe-tab-wrapper-access | 2 | mgrant-stories-of-change, mgrant-document-repository |
| form-read-view-overlay | 2 | mgrant-stories-of-change, mgrant-document-repository |
| remote-client-script-deploy | 3 | mgrant-stories-of-change, mgrant-document-repository |
| client-side-xlsx-export | 2 | lic-hfl-budget-allocation, mgrant-document-repository |
| jszip-bulk-download | 1 | mgrant-document-repository |
| frappe-wrapper-guard | 1 | lic-hfl-budget-allocation |
| sticky-table-freeze | 1 | lic-hfl-budget-allocation |
| frappe-sequential-save | 1 | lic-hfl-budget-allocation |
| frappe-dom-data-scraper | 1 | lic-hfl-budget-allocation |
| link-field-parent-filter | 1 | mgrant-stories-of-change |

## By Project

### mgrant-stories-of-change

| Pattern | Feature | Type | Date |
|---------|---------|------|------|
| fuzzy-search | Stories of Change Hub | inline | 2026-04-19 |
| shadow-dom-keyboard-fix | Stories of Change Hub | inline | 2026-04-19 |
| frappe-tab-wrapper-access | Story Form Read-View | inline | 2026-04-22 |
| form-read-view-overlay | Story Form Read-View | reference | 2026-04-22 |
| remote-client-script-deploy | Story Form Read-View | reference | 2026-04-22 |
| remote-client-script-deploy | Story Form Compact | reference | 2026-04-20 |
| link-field-parent-filter | Story Form Workflow | reference | 2026-04-23 |

### mgrant-document-repository

| Pattern | Feature | Type | Date |
|---------|---------|------|------|
| form-read-view-overlay | Document Registry Form View | inline | 2026-04-22 |
| frappe-tab-wrapper-access | Document Registry Form View | inline | 2026-04-22 |
| remote-client-script-deploy | Document Registry Form View | inline | 2026-04-22 |
| fuzzy-search | Document Repository CHB | inline | 2026-04-21 |
| shadow-dom-keyboard-fix | Document Repository CHB | inline | 2026-04-21 |
| client-side-xlsx-export | Document Repository CHB | inline | 2026-04-21 |
| jszip-bulk-download | Document Repository CHB | inline | 2026-04-21 |

### lic-hfl-budget-allocation

| Pattern | Feature | Type | Date |
|---------|---------|------|------|
| frappe-wrapper-guard | Budget Allocation Form | inline | 2026-04-20 |
| sticky-table-freeze | Budget Allocation Form | inline | 2026-04-20 |
| frappe-sequential-save | Budget Allocation Form | inline | 2026-04-20 |
| client-side-xlsx-export | Budget Export | inline | 2026-04-20 |
| frappe-dom-data-scraper | Budget Allocation Form | inline | 2026-04-20 |

## Usage Types

- **inline** — Pattern code copied directly into the project file
- **import** — Pattern loaded as a module/dependency
- **reference** — Pattern informed the approach but wasn't copied verbatim (e.g., the original implementation that the pattern was extracted from)

## How to record new usage

When you use a pattern in a project, add an entry to `usage.json`:

```json
{
  "pattern": "pattern-folder-name",
  "project": "github-repo-name",
  "feature": "Feature or module name",
  "file": "path/to/file.js",
  "usageType": "inline",
  "addedDate": "2026-04-22",
  "notes": "Brief context"
}
```

Then update this file's tables, or ask Claude to regenerate it from the JSON.
