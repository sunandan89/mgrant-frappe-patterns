/**
 * JSZip Bulk Download — Client-side ZIP generation for Frappe
 *
 * Downloads multiple files from a Frappe instance, bundles them into a
 * ZIP archive in the browser, and triggers a download. No server-side
 * code needed — works in Client Scripts, Custom HTML Blocks, and Pages.
 *
 * Requires: JSZip CDN (loaded automatically by loadJSZip)
 *
 * @version 1.0.0
 * @license MIT
 * @see README.md for integration examples
 */

// ── CDN Loader ──

/**
 * Load the JSZip library from CDN.
 * Returns immediately if already loaded. Safe to call multiple times.
 *
 * @returns {Promise<JSZip>} Resolves with the JSZip constructor
 */
function loadJSZip() {
  return new Promise(function(resolve, reject) {
    if (window.JSZip) {
      resolve(window.JSZip);
      return;
    }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
    s.onload = function() { resolve(window.JSZip); };
    s.onerror = function() { reject(new Error('Failed to load JSZip library from CDN')); };
    document.head.appendChild(s);
  });
}


// ── Unique filename helper ──

/**
 * Generate a unique filename to avoid overwrites inside the ZIP.
 * Tracks used names in the provided map.
 *
 * @param {string} name - Original filename
 * @param {Object} usedNames - Mutable map tracking used names and their counts
 * @returns {string} Unique filename (e.g., "report.pdf", "report (2).pdf")
 */
function uniqueFileName(name, usedNames) {
  if (!usedNames[name]) {
    usedNames[name] = 1;
    return name;
  }
  usedNames[name]++;
  var ext = name.lastIndexOf('.') > 0 ? name.slice(name.lastIndexOf('.')) : '';
  var base = ext ? name.slice(0, name.lastIndexOf('.')) : name;
  return base + ' (' + usedNames[name] + ')' + ext;
}


// ── Core: Bulk download as ZIP ──

/**
 * Download multiple files and bundle them into a ZIP.
 *
 * @param {Array<{file_name: string, file_url: string}>} files
 *   Array of file objects. Each must have `file_name` and `file_url`.
 *   URLs starting with "/" are made absolute using window.location.origin.
 *
 * @param {Object} [options] - Configuration
 * @param {string} [options.zipName] - Output ZIP filename
 *   (default: "Documents_YYYY-MM-DD.zip")
 * @param {Function} [options.onProgress] - Called with (fetched, errors, total)
 *   after each file completes. Use this to update a progress indicator.
 * @param {Function} [options.onComplete] - Called with ({fetched, errors, total})
 *   after the ZIP is generated and download triggered.
 * @param {Function} [options.onError] - Called with (error) if JSZip fails
 *   to load or all files fail to fetch.
 *
 * @returns {Promise<void>}
 *
 * @example
 * // Basic usage
 * bulkDownloadZip([
 *   { file_name: 'report.pdf', file_url: '/files/report.pdf' },
 *   { file_name: 'budget.xlsx', file_url: '/files/budget.xlsx' }
 * ]);
 *
 * @example
 * // With progress callback (update a button label)
 * bulkDownloadZip(files, {
 *   zipName: 'Project_Documents.zip',
 *   onProgress: function(fetched, errors, total) {
 *     btn.textContent = 'Zipping ' + fetched + '/' + total + '...';
 *   },
 *   onComplete: function(result) {
 *     btn.textContent = 'Download ZIP';
 *     frappe.show_alert({
 *       message: result.fetched + ' files downloaded',
 *       indicator: result.errors > 0 ? 'orange' : 'green'
 *     });
 *   },
 *   onError: function(err) {
 *     frappe.show_alert({ message: err.message, indicator: 'red' });
 *   }
 * });
 */
function bulkDownloadZip(files, options) {
  var opts = options || {};

  if (!files || files.length === 0) {
    if (opts.onError) opts.onError(new Error('No files provided'));
    return Promise.resolve();
  }

  return loadJSZip().then(function(JSZip) {
    var zip = new JSZip();
    var fetched = 0;
    var errors = 0;
    var total = files.length;
    var usedNames = {};

    return new Promise(function(resolve) {
      function checkComplete() {
        if (fetched + errors < total) return;

        if (fetched === 0) {
          // All files failed
          if (opts.onError) opts.onError(new Error('Could not fetch any files'));
          resolve();
          return;
        }

        // Generate and trigger download
        zip.generateAsync({ type: 'blob' }).then(function(content) {
          var a = document.createElement('a');
          a.href = URL.createObjectURL(content);
          a.download = opts.zipName
            || 'Documents_' + new Date().toISOString().slice(0, 10) + '.zip';
          a.click();
          URL.revokeObjectURL(a.href);

          if (opts.onComplete) {
            opts.onComplete({ fetched: fetched, errors: errors, total: total });
          }
          resolve();
        });
      }

      files.forEach(function(f) {
        var url = f.file_url;
        if (!url) {
          errors++;
          if (opts.onProgress) opts.onProgress(fetched, errors, total);
          checkComplete();
          return;
        }

        // Make absolute URL for Frappe's relative paths
        if (url.charAt(0) === '/') {
          url = window.location.origin + url;
        }

        fetch(url, { credentials: 'include' })
          .then(function(resp) {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.blob();
          })
          .then(function(blob) {
            zip.file(uniqueFileName(f.file_name || 'file', usedNames), blob);
            fetched++;
            if (opts.onProgress) opts.onProgress(fetched, errors, total);
            checkComplete();
          })
          .catch(function() {
            errors++;
            if (opts.onProgress) opts.onProgress(fetched, errors, total);
            checkComplete();
          });
      });
    });
  }).catch(function(err) {
    if (opts.onError) opts.onError(err);
  });
}


// ── Export for different contexts ──

// Node.js / CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadJSZip: loadJSZip,
    uniqueFileName: uniqueFileName,
    bulkDownloadZip: bulkDownloadZip
  };
}

// Browser global
if (typeof window !== 'undefined') {
  window.FrappePatterns = window.FrappePatterns || {};
  window.FrappePatterns.bulkDownload = {
    loadJSZip: loadJSZip,
    uniqueFileName: uniqueFileName,
    bulkDownloadZip: bulkDownloadZip
  };
}
