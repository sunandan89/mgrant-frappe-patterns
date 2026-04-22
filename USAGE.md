# Pattern Usage Matrix

Tracks where each pattern has been used across projects and features. This helps measure pattern adoption, identify candidates for improvement, and demonstrate reuse value.

**Data source:** [`usage.json`](usage.json) — the machine-readable version. Update `usage.json` when you use a pattern, then regenerate this file (or update manually).

## Summary

| Pattern | Total Uses | Projects |
|---------|-----------|----------|
| fuzzy-search | 1 | mgrant-stories-of-change |
| shadow-dom-keyboard-fix | 1 | mgrant-stories-of-change |
| frappe-tab-wrapper-access | 1 | mgrant-stories-of-change |
| form-read-view-overlay | 1 | mgrant-stories-of-change |
| remote-client-script-deploy | 2 | mgrant-stories-of-change |
| frappe-wrapper-guard | 1 | lic-hfl-budget-allocation |
| sticky-table-freeze | 1 | lic-hfl-budget-allocation |
| frappe-sequential-save | 1 | lic-hfl-budget-allocation |
| client-side-xlsx-export | 1 | lic-hfl-budget-allocation |
| frappe-dom-data-scraper | 1 | lic-hfl-budget-allocation |

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
