# Fuzzy Search

Typo-tolerant client-side search for Frappe applications. Uses trigram-based Jaccard similarity to catch 1–2 character typos while keeping exact substring matching as the fast path.

## When to use

- Any list/grid view with a client-side search input
- Custom HTML Blocks, Page scripts, or Client Scripts that filter in-memory records
- When users search by names, places, or short text fields where typos are common

## How it works

The search runs in two layers:

1. **Fast path** — exact substring match using `indexOf`. Handles partial matches like "hea" → "Health" instantly.
2. **Fuzzy fallback** — when substring fails, splits the search word and each field value into trigrams (3-character windows) and computes Jaccard similarity. A score above the threshold (default 0.3) counts as a match.

All search words must match (AND logic), but each word can match via either layer.

## Quick start

Copy the functions from `fuzzy-search.js` into your script, then call:

```javascript
var results = fuzzyFilterRecords(allRecords, searchText, function(rec) {
  return [rec.name, rec.title, rec.city, rec.state];
});
```

For a full CHB wiring example, see `example-chb-integration.js`.

## API

### `fuzzyFilterRecords(records, searchText, getFields, [options])`

| Parameter | Type | Description |
|-----------|------|-------------|
| `records` | Array | Array of record objects to filter |
| `searchText` | string | User's search input (can be multiple words) |
| `getFields` | Function | Takes a record, returns array of string field values to search |
| `options.threshold` | number | Similarity threshold, default `0.3` |
| `options.searchNarrative` | boolean | If `true`, last field from `getFields` is included in substring search but excluded from fuzzy (avoids false positives on long text) |

Returns: filtered array of records.

### `similarity(a, b)`

Returns Jaccard similarity (0–1) between two strings using trigrams. Useful for standalone comparisons.

```javascript
similarity('health', 'helth');   // ~0.42
similarity('bihar', 'bihr');     // ~0.38
similarity('mumbai', 'mmbai');   // ~0.45
similarity('health', 'apple');   // ~0.04
```

## Tuning the threshold

| Threshold | Catches | Best for |
|-----------|---------|----------|
| 0.20 | 3+ char typos, loose | Long words, narrative fields |
| 0.30 | 1–2 char typos, balanced | Names, places, short fields (recommended) |
| 0.40 | 1 char typos only, strict | When false positives are a problem |

You can also scale dynamically by word length:

```javascript
var threshold = Math.max(0.2, 0.4 - (word.length * 0.02));
```

## Performance

Trigram matching is O(n × m) where n = record count and m = fields per record.

| Records | Fields | Approx. time |
|---------|--------|-------------|
| 100 | 6 | < 5ms |
| 1,000 | 6 | < 20ms |
| 5,000 | 6 | < 50ms |
| 30,000+ | 6 | Consider server-side pre-filter |

For large datasets (30K+), use a hybrid approach: server-side `LIKE` filter via `frappe.call` to reduce the set, then client-side fuzzy on the result.

## Tested examples

From the Stories of Change hub on mGrant staging:

| Typed | Matched | Why |
|-------|---------|-----|
| `helth` | "Mobile **Health** Camps..." | 1-char deletion, similarity ~0.42 |
| `bihr` | Stories with state = **Bihar** | 1-char deletion, similarity ~0.38 |
| `prya` | "From Dropout to District Topper: **Priya**'s Journey" | 1-char deletion |
| `health` | Same Health story | Exact substring — fast path, no fuzzy needed |

## Used in

- **Stories of Change** hub (Custom HTML Block) — `mgrant-stories-of-change` repo
- **NGO Directory** hub (Custom HTML Block) — handoff provided
- **Document Repository** hub (Custom HTML Block) — `mgrant-document-repository` repo
