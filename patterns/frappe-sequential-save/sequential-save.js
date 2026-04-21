/**
 * frappe-sequential-save
 *
 * Saves multiple Frappe documents one at a time to avoid lock conflicts.
 * Uses recursive promise chaining — no async/await required (ES5 compatible).
 *
 * CORE: Sequential execution + per-item error handling
 * OPTIONAL: Retry logic, rollback, batch sizing (not included — add if needed)
 */

/**
 * Save an array of items sequentially using a provided save function.
 *
 * @param {Array} items - Items to save
 * @param {Function} saveFn - (item, index) => Promise — performs one save
 * @param {Object} [options]
 * @param {Function} [options.onProgress] - (index, total) => void
 * @param {Function} [options.onComplete] - (total) => void
 * @param {Function} [options.onError] - (index, error) => void
 * @param {boolean} [options.stopOnError=true] - Stop on first error
 */
function sequentialSave(items, saveFn, options) {
  options = options || {};
  var stopOnError = options.stopOnError !== false; // default true
  var total = items.length;

  function next(idx) {
    if (idx >= total) {
      if (options.onComplete) options.onComplete(total);
      return Promise.resolve();
    }

    if (options.onProgress) options.onProgress(idx, total);

    var p;
    try {
      p = saveFn(items[idx], idx);
    } catch (e) {
      p = Promise.reject(e);
    }

    return (p || Promise.resolve())
      .then(function () {
        return next(idx + 1);
      })
      .catch(function (err) {
        console.error('[sequentialSave] Error at index ' + idx + ':', err);
        if (options.onError) options.onError(idx, err);

        if (stopOnError) {
          return Promise.reject(err);
        }
        // Skip and continue
        return next(idx + 1);
      });
  }

  return next(0);
}
