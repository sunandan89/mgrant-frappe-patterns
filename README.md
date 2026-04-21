# mGrant Frappe Patterns

Reusable utility code and patterns for Frappe v16 development at Dhwani RIS. Each pattern is self-contained — copy what you need into your project.

## Pattern Directory

| Pattern | Description | Works in |
|---------|-------------|----------|
| [Fuzzy Search](patterns/fuzzy-search/) | Typo-tolerant client-side search using trigram similarity. Catches 1–2 char typos with zero dependencies. | CHB, Client Script, Page |
| [Shadow DOM Keyboard Fix](patterns/shadow-dom-keyboard-fix/) | Prevents Frappe's Awesomebar from hijacking keyboard input inside Custom HTML Blocks. | CHB only |

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

These patterns emerged from building mGrant features (Stories of Change, NGO Directory, Document Repository) on Frappe v16 with `developer_mode` off. They solve real problems encountered during development and are tested on the mGrant staging instance.

## Related repos

- [mgrant-stories-of-change](https://github.com/sunandan89/mgrant-stories-of-change) — Stories of Change feature (uses both patterns above)
