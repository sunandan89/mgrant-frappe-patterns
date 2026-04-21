/**
 * frappe-dom-data-scraper
 *
 * Reads live input values from the DOM for custom-rendered UIs
 * where frm.doc contains stale data.
 *
 * CORE: scrapeDOMValues, scrapeTableRows
 * OPTIONAL: dirty tracking, change highlighting, type coercion
 */

/**
 * Scrape input values from a table, keyed by data attributes.
 * Builds a nested object from the data-* attributes on each input.
 *
 * Example: <input class="my-inp" data-row="0" data-quarter="Q1" value="500">
 * With dataKeys = ['row', 'quarter'], returns { '0': { 'Q1': 500 } }
 *
 * @param {string} containerSelector - CSS selector for the container element
 * @param {string} inputSelector - CSS selector for input elements
 * @param {string[]} dataKeys - Data attribute names to use as nesting keys
 * @param {Object} [options]
 * @param {boolean} [options.asNumbers=true] - Parse values as numbers (default true)
 * @returns {Object} Nested object of scraped values
 */
function scrapeDOMValues(containerSelector, inputSelector, dataKeys, options) {
  options = options || {};
  var asNumbers = options.asNumbers !== false;

  var container = document.querySelector(containerSelector);
  if (!container) return {};

  var inputs = container.querySelectorAll(inputSelector);
  var result = {};

  inputs.forEach(function (inp) {
    var val = inp.value;
    if (asNumbers) {
      var num = parseFloat(val);
      val = isNaN(num) ? val : num;
    }

    // Build nested path from data attributes
    var current = result;
    for (var i = 0; i < dataKeys.length; i++) {
      var key = inp.dataset[dataKeys[i]];
      if (key === undefined) return; // skip if attribute missing

      if (i === dataKeys.length - 1) {
        // Last key — set the value
        current[key] = val;
      } else {
        // Intermediate key — ensure object exists
        if (!current[key]) current[key] = {};
        current = current[key];
      }
    }
  });

  return result;
}

/**
 * Simpler variant: scrape all inputs within each row of a table.
 * Returns an array of objects, one per row.
 *
 * Each row object has keys from the inputs' data-field attribute
 * (or falls back to the input's name attribute, or positional index).
 *
 * @param {string} tableSelector - CSS selector for the table
 * @param {string} rowSelector - CSS selector for data rows
 * @param {Object} [options]
 * @param {boolean} [options.asNumbers=true] - Parse values as numbers
 * @returns {Array<Object>} Array of row data objects
 */
function scrapeTableRows(tableSelector, rowSelector, options) {
  options = options || {};
  var asNumbers = options.asNumbers !== false;

  var table = document.querySelector(tableSelector);
  if (!table) return [];

  var rows = table.querySelectorAll(rowSelector);
  var result = [];

  rows.forEach(function (tr) {
    var rowData = {};
    var inputs = tr.querySelectorAll('input, select, textarea');

    inputs.forEach(function (inp, idx) {
      var key = inp.dataset.field || inp.name || ('col_' + idx);
      var val = inp.value;

      if (asNumbers && inp.type !== 'text') {
        var num = parseFloat(val);
        val = isNaN(num) ? val : num;
      }

      rowData[key] = val;
    });

    // Also capture any data attributes on the row itself
    if (tr.dataset.pbp) rowData._pbpId = tr.dataset.pbp;
    if (tr.dataset.idx) rowData._idx = parseInt(tr.dataset.idx);

    result.push(rowData);
  });

  return result;
}
