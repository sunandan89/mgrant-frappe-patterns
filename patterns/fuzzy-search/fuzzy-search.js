/**
 * Fuzzy Search Utility — Trigram-based typo-tolerant matching
 *
 * Works in any JavaScript context: Frappe Client Scripts, Custom HTML Blocks,
 * Page scripts, or standalone browser apps. No dependencies.
 *
 * Usage:
 *   var results = fuzzyFilterRecords(allRecords, searchText, function(rec) {
 *     return [rec.name, rec.title, rec.city, rec.state];
 *   });
 *
 * @version 1.0.0
 * @license MIT
 * @see README.md for integration examples and tuning guide
 */

// ── Core: Trigram generation ──

/**
 * Generate a set of trigrams (3-character sliding windows) from a string.
 * Pads with spaces to improve matching at word boundaries.
 *
 * @param {string} str - Input string
 * @returns {Object} Hash map of trigrams (keys = trigram strings, values = true)
 */
function trigrams(str) {
  var t = {};
  var s = '  ' + str.toLowerCase().replace(/\s+/g, ' ').trim() + '  ';
  for (var i = 0; i < s.length - 2; i++) {
    t[s.substr(i, 3)] = true;
  }
  return t;
}

// ── Core: Jaccard similarity ──

/**
 * Compute Jaccard similarity between two strings using their trigram sets.
 * Returns a value between 0 (no overlap) and 1 (identical).
 *
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Similarity score (0..1)
 */
function similarity(a, b) {
  if (!a || !b) return 0;
  var tA = trigrams(a), tB = trigrams(b);
  var shared = 0, total = 0;
  for (var k in tA) { total++; if (tB[k]) shared++; }
  for (var k in tB) { if (!tA[k]) total++; }
  return total ? shared / total : 0;
}

// ── Fuzzy field matcher ──

/**
 * Check if a search word fuzzy-matches any of the provided field values.
 * Splits each field value into individual words and compares against each.
 *
 * @param {string} word - The search word to match
 * @param {string[]} fieldValues - Array of field value strings to match against
 * @param {number} [threshold=0.3] - Minimum similarity score to count as a match
 * @returns {boolean} True if any field word exceeds the similarity threshold
 */
function fuzzyMatchFields(word, fieldValues, threshold) {
  if (threshold === undefined) threshold = 0.3;
  return fieldValues.some(function(val) {
    if (!val) return false;
    var parts = val.toLowerCase().split(/\s+/);
    return parts.some(function(part) {
      return similarity(word, part) > threshold;
    });
  });
}

// ── Main: Filter records ──

/**
 * Filter an array of records using combined substring + fuzzy matching.
 *
 * Strategy:
 *   1. Fast path — exact substring match (indexOf) for instant results
 *   2. Fuzzy fallback — trigram similarity when substring fails
 *
 * All search words must match (AND logic). Each word can match via either path.
 *
 * @param {Array} records - Array of record objects to filter
 * @param {string} searchText - User's search input (can be multiple words)
 * @param {Function} getFields - Function that takes a record and returns an
 *                               array of string field values to search through
 * @param {Object} [options] - Optional configuration
 * @param {number} [options.threshold=0.3] - Fuzzy similarity threshold (0..1)
 * @param {boolean} [options.searchNarrative=false] - If true, getFields should
 *        return narrative/long text as the LAST element; it will be included in
 *        substring search but excluded from fuzzy matching (too slow on long text)
 * @returns {Array} Filtered records that match the search
 *
 * @example
 * // Basic usage
 * var results = fuzzyFilterRecords(allNGOs, 'helth bihar', function(ngo) {
 *   return [ngo.ngo_name, ngo.state, ngo.district, ngo.city, ngo.focus_area];
 * });
 *
 * @example
 * // With narrative text (included in substring but not fuzzy)
 * var results = fuzzyFilterRecords(stories, 'prya', function(s) {
 *   return [s.title, s.ngo_name, s.theme, s.state, stripHtml(s.narrative)];
 * }, { searchNarrative: true });
 *
 * @example
 * // Stricter matching (fewer false positives)
 * var results = fuzzyFilterRecords(records, query, getFields, { threshold: 0.4 });
 */
function fuzzyFilterRecords(records, searchText, getFields, options) {
  if (!searchText || !searchText.trim()) return records;

  var opts = options || {};
  var threshold = opts.threshold !== undefined ? opts.threshold : 0.3;
  var searchNarrative = opts.searchNarrative || false;

  var words = searchText.toLowerCase().trim().split(/\s+/);

  return records.filter(function(record) {
    var fieldValues = getFields(record);

    // Build haystack for fast substring matching (all fields including narrative)
    var hay = fieldValues.filter(Boolean).join(' ').toLowerCase();

    // For fuzzy matching, exclude the last field if it's a narrative
    // (long text produces false positives and is slow to trigram-match)
    var fuzzyFields = searchNarrative
      ? fieldValues.slice(0, -1).filter(Boolean)
      : fieldValues.filter(Boolean);

    // Every word must match (AND logic)
    return words.every(function(word) {
      // Fast path: exact substring anywhere in the haystack
      if (hay.indexOf(word) !== -1) return true;
      // Fuzzy fallback: trigram similarity against individual field values
      return fuzzyMatchFields(word, fuzzyFields, threshold);
    });
  });
}


// ── Export for different contexts ──

// Node.js / CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    trigrams: trigrams,
    similarity: similarity,
    fuzzyMatchFields: fuzzyMatchFields,
    fuzzyFilterRecords: fuzzyFilterRecords
  };
}

// Browser global (for script tags or Frappe Client Scripts)
if (typeof window !== 'undefined') {
  window.FrappePatterns = window.FrappePatterns || {};
  window.FrappePatterns.fuzzySearch = {
    trigrams: trigrams,
    similarity: similarity,
    fuzzyMatchFields: fuzzyMatchFields,
    fuzzyFilterRecords: fuzzyFilterRecords
  };
}
