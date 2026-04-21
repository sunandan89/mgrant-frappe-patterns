/**
 * Example: Integrating fuzzy search into a Frappe v16 Custom HTML Block
 *
 * This file shows how to wire up fuzzyFilterRecords() inside a CHB's
 * script field. Copy the core functions from fuzzy-search.js into your
 * CHB script, then follow this wiring pattern.
 *
 * NOTE: CHBs run inside Shadow DOM, so you MUST also apply the
 * shadow-dom-keyboard-fix pattern to prevent Frappe's Awesomebar
 * from hijacking keystrokes. See ../shadow-dom-keyboard-fix/
 */

(function() {
  // Shadow DOM context — always use root_element, never document
  var $ = function(sel) { return root_element.querySelector(sel); };

  var allRecords = [];

  // ── Paste fuzzy-search.js functions here ──
  // (trigrams, similarity, fuzzyMatchFields, fuzzyFilterRecords)
  // ... or load via script tag if your setup supports it

  // ── Search input wiring ──

  var searchTimeout;
  var DEBOUNCE_MS = 300;

  $('#search-input').addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFilters, DEBOUNCE_MS);
  });

  // REQUIRED: Stop keyboard events from leaking to Frappe's Awesomebar
  // See: patterns/shadow-dom-keyboard-fix/
  ['keydown', 'keypress', 'keyup'].forEach(function(evt) {
    $('#search-input').addEventListener(evt, function(e) {
      e.stopPropagation();
      if (e.type === 'keydown' && (e.key === 'Enter' || e.keyCode === 13)) {
        e.preventDefault();
        clearTimeout(searchTimeout);
        applyFilters();
      }
    });
  });

  // ── Filter logic ──

  function applyFilters() {
    var searchText = $('#search-input').value;

    // Apply dropdown filters first (if any)
    var preFiltered = allRecords; // .filter(...) for dropdowns

    // Then apply fuzzy search
    var results = fuzzyFilterRecords(preFiltered, searchText, function(rec) {
      // Return the fields you want to be searchable.
      // Adapt these to YOUR DocType's field names.
      return [
        rec.name,        // document ID
        rec.title,       // display title
        rec.ngo_name,    // linked NGO
        rec.state,       // location fields
        rec.district,
        rec.theme        // classification
      ];
    });

    renderResults(results);
  }

  // ── Data fetch ──

  frappe.call({
    method: 'frappe.client.get_list',
    args: {
      doctype: 'Your DocType',
      fields: ['name', 'title', 'ngo_name', 'state', 'district', 'theme'],
      order_by: 'creation desc',
      limit_page_length: 100
    },
    async: true,
    callback: function(r) {
      allRecords = r.message || [];
      applyFilters();
    }
  });

  function renderResults(records) {
    // Your rendering logic here
  }
})();
