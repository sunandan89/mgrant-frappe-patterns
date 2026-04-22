# Shadow DOM Keyboard Fix

Prevents Frappe v16's global Awesomebar from hijacking keyboard input inside Custom HTML Blocks.

## The problem

Frappe v16 Custom HTML Blocks render inside a **Shadow DOM**. When a user clicks on an `<input>` inside the shadow root and starts typing:

1. `document.activeElement` returns the **shadow host** element, not the actual input
2. Frappe's global keyboard handler sees no focused input
3. Frappe redirects the keystrokes to the navbar search bar (Awesomebar)

The result: the user clicks on your search box, types, and the text appears in the top navbar instead.

## The fix

Block `keydown`, `keypress`, and `keyup` events from propagating out of the shadow DOM. All three must be blocked — blocking only `keydown` is not enough, as `keypress` and `keyup` still leak and confuse Frappe's handler.

## Quick start

### Option A: Fix a single input

```javascript
// Inside your CHB script
fixShadowDomKeyboard(root_element.querySelector('#search-input'), {
  onEnter: function() {
    // trigger search
    applyFilters();
  }
});
```

### Option B: Fix all inputs at once

```javascript
// Call after your HTML is in the DOM
fixAllShadowDomInputs(root_element);
```

### Option C: Inline (no utility function needed)

If you prefer not to import the utility, paste this directly:

```javascript
['keydown', 'keypress', 'keyup'].forEach(function(evt) {
  root_element.querySelector('#your-input').addEventListener(evt, function(e) {
    e.stopPropagation();
    if (e.type === 'keydown' && (e.key === 'Enter' || e.keyCode === 13)) {
      e.preventDefault();
      // your Enter handler here
    }
  });
});
```

## API

### `fixShadowDomKeyboard(inputEl, [options])`

| Parameter | Type | Description |
|-----------|------|-------------|
| `inputEl` | HTMLElement | The input or textarea element |
| `options.onEnter` | Function | Callback when Enter is pressed |
| `options.preventDefault` | boolean | Prevent default on Enter (default: `true`) |

### `fixAllShadowDomInputs(rootEl, [options])`

Applies `fixShadowDomKeyboard` to every `<input type="text">`, `<input type="search">`, untyped `<input>`, and `<textarea>` found under `rootEl`.

## Important notes

- This fix is **only needed inside Custom HTML Blocks** (Shadow DOM). Regular Client Scripts and Page scripts don't have this problem.
- Apply the fix **after** the HTML is rendered — if you dynamically add inputs later, fix those too.
- The fix does NOT prevent keyboard shortcuts like Ctrl+C, Ctrl+V from working inside the input — it only stops the events from reaching Frappe's global handler.

## Discovered in

This issue was discovered and fixed during the **Stories of Change** hub development. The search input was completely non-functional — every keystroke was redirected to Frappe's navbar search. The root cause was confirmed by checking that `document.activeElement` returns the shadow host, not the inner input element.

## Used in

- **Stories of Change** hub (Custom HTML Block)
- **NGO Directory** hub (Custom HTML Block)
- **Document Repository** hub (Custom HTML Block) — `mgrant-document-repository` repo
