/**
 * Example: Scraping budget table values for Excel export
 *
 * The budget table has inputs like:
 *   <input class="ab-inp" data-row="0" data-quarter="Q1" data-fund="lic" value="500">
 *
 * We scrape these LIVE values instead of reading frm.doc
 * so the export matches what the user sees on screen.
 */

function collectBudgetDataForExport(quarters) {
  // Approach 1: Structured scraping with data attributes
  var liveData = scrapeDOMValues(
    '.ab-prog-table',      // table container
    '.ab-inp',             // input elements
    ['row', 'quarter', 'fund']  // nesting keys
  );
  // liveData = { '0': { 'Q1': { 'lic': 500, 'govt': 200 }, 'Q2': {...} }, '1': {...} }

  // Approach 2: Row-based scraping (simpler)
  var rows = scrapeTableRows('.ab-prog-table', '.ab-data-row');
  // rows = [{ units_q1: 50, amt_q1: 500, units_q2: 60, ... _pbpId: 'PBP-0001' }, ...]

  return { structured: liveData, rows: rows };
}

/**
 * Usage in an export function:
 *
 *   var data = collectBudgetDataForExport(quarters);
 *   // Build Excel rows from data.rows instead of from frm.doc
 *   data.rows.forEach(function(row) {
 *     excelData.push([row.description, row.units_q1, row.amt_q1, ...]);
 *   });
 */
