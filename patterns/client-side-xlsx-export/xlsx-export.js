/**
 * client-side-xlsx-export
 *
 * CORE utilities for generating styled Excel workbooks in the browser.
 * Requires xlsx-js-style loaded via CDN (see loadXlsxLib).
 *
 * CORE: loadXlsxLib, sc (styled cell), autoWidth
 * OPTIONAL: sheet protection, merged cells, locale-specific formats
 */

/**
 * Load the xlsx-js-style library from CDN.
 * Returns immediately if already loaded. Safe to call multiple times.
 *
 * @returns {Promise<void>}
 */
function loadXlsxLib() {
  return new Promise(function (resolve, reject) {
    if (window.XLSX && window.XLSX.utils && window.XLSX.utils.aoa_to_sheet) {
      resolve();
      return;
    }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js';
    s.onload = function () { resolve(); };
    s.onerror = function () { reject(new Error('Failed to load XLSX library from CDN')); };
    document.head.appendChild(s);
  });
}

/**
 * Create a styled cell for xlsx-js-style.
 *
 * @param {*} value - Cell value (string or number)
 * @param {Object} [opts]
 * @param {Object} [opts.font] - Font config {name, sz, bold, color: {rgb}}
 * @param {string} [opts.fill] - Background colour as hex string (e.g., 'E6E6E6')
 * @param {Object} [opts.alignment] - Alignment config {horizontal, vertical, wrapText}
 * @param {Object|false} [opts.border] - Border config, or false for no borders
 * @param {string} [opts.numFmt] - Number format string (e.g., '#,##0', '0.00%')
 * @returns {Object} xlsx-js-style cell object
 */
function sc(value, opts) {
  opts = opts || {};
  var cell = {
    v: value,
    t: typeof value === 'number' ? 'n' : 's'
  };

  var s = {};

  // Font
  s.font = opts.font || { name: 'Arial', sz: 11 };

  // Fill
  if (opts.fill) {
    s.fill = { fgColor: { rgb: opts.fill } };
  }

  // Alignment
  s.alignment = opts.alignment || { vertical: 'center' };

  // Border (default: thin black on all sides)
  if (opts.border !== false) {
    var thin = { style: 'thin', color: { rgb: '000000' } };
    s.border = opts.border || {
      top: thin, bottom: thin, left: thin, right: thin
    };
  }

  // Number format
  if (opts.numFmt) {
    s.numFmt = opts.numFmt;
    cell.z = opts.numFmt;
  }

  cell.s = s;
  return cell;
}

/**
 * Auto-size column widths based on content.
 *
 * @param {Object} ws - XLSX worksheet object
 * @param {Array[]} data - 2D array of cell data
 */
function autoWidth(ws, data) {
  if (!data || !data.length) return;
  var colCount = 0;
  data.forEach(function (row) {
    if (row.length > colCount) colCount = row.length;
  });

  var widths = [];
  for (var c = 0; c < colCount; c++) {
    var maxLen = 8; // minimum width
    data.forEach(function (row) {
      if (row[c]) {
        var val = row[c].v !== undefined ? String(row[c].v) : String(row[c]);
        if (val.length > maxLen) maxLen = val.length;
      }
    });
    widths.push({ wch: Math.min(maxLen + 2, 40) }); // cap at 40
  }
  ws['!cols'] = widths;
}
