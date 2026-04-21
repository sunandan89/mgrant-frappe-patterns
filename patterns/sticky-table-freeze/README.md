# Sticky Table Freeze

CSS + HTML pattern for freezing both header rows (vertical) and left columns (horizontal) in a scrollable HTML table rendered inside a Frappe form. Pure CSS — no JavaScript scroll listeners.

![Visual guide](visual-guide.png)

## When to use

- You render a wide data table inside a Frappe Client Script or Custom HTML Block
- The table has multi-row headers (merged cells spanning quarters/years)
- Users need frozen left columns (like row labels) while scrolling horizontally
- Users need frozen header rows while scrolling vertically

## The problem

CSS `position: sticky` on `<th>` elements breaks silently when the table uses `border-collapse: collapse` — a default in many CSS resets. Headers appear to work but scroll away on horizontal scroll. This is a known browser behaviour that is extremely hard to debug because there's no error — the sticky just silently stops working.

## How it works

Three things must be true for sticky table cells to work:

1. **`border-collapse: separate`** on the `<table>` (with `border-spacing: 0` to keep the visual identical to `collapse`)
2. **`position: sticky`** with explicit `top` values on header rows and `left` values on frozen columns
3. **Z-index layering** so frozen elements stack correctly:
   - `z-index: 15` — Frozen header cells (stuck both top and left)
   - `z-index: 10` — Frozen data column cells (stuck left only)
   - `z-index: 9` — Regular header rows (stuck top only)
   - `z-index: 1` — Regular data cells (default)

## Quick start

Copy the CSS from `sticky-table.css` and apply the classes to your table:

```html
<div class="stf-scroll-container">
  <table class="stf-table">
    <thead>
      <tr>
        <th class="stf-frozen" style="left:0;">Sr</th>
        <th class="stf-frozen" style="left:40px;">Name</th>
        <th>Q1 Units</th>
        <th>Q1 Amount</th>
        <!-- more columns -->
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="stf-frozen" style="left:0;">1</td>
        <td class="stf-frozen" style="left:40px;">Activity A</td>
        <td>100</td>
        <td>50000</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Frozen column offsets

You must calculate cumulative widths for each frozen column's `left` value. Example from a 5-column freeze:

| Column | Width | Left offset |
|--------|-------|------------|
| Sr | 40px | `left: 0` |
| Activity | 200px | `left: 40px` |
| Task Details | 180px | `left: 240px` |
| UoM | 80px | `left: 420px` |
| Unit Cost | 80px | `left: 500px` |

## Multi-row headers

For tables with 2–3 header rows (common in budget/financial tables), each row needs its own `top` value:

```css
.stf-table thead tr:nth-child(1) th { top: 0; }
.stf-table thead tr:nth-child(2) th { top: 25px; }
.stf-table thead tr:nth-child(3) th { top: 50px; }
```

**Important:** When using multi-row headers with frozen columns, avoid `colspan` on cells in the frozen column range. Use individual `<th>` cells with explicit `left` offsets instead — `colspan` and `sticky` don't combine reliably.

## Works in

Client Scripts, Custom HTML Blocks, Frappe Pages — anywhere you render an HTML `<table>` inside a scrollable container.

## Browser support

Tested on Chrome 120+, Firefox 115+, Edge 120+. Works in all modern browsers that support `position: sticky` on table cells with `border-collapse: separate`.

## Origin

Extracted from the LIC HFL Budget Allocation feature, where a financial budget table with 50+ quarterly columns and 5 frozen left columns needed both horizontal and vertical scroll freezing.
