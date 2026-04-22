/**
 * Example: JSZip bulk download in a Frappe v16 Custom HTML Block
 *
 * This shows a typical CHB pattern — checkbox selection on table rows,
 * a selection bar with count + actions, and a Download ZIP button.
 *
 * Copy the core functions from jszip-bulk-download.js into your CHB,
 * then follow this wiring pattern.
 *
 * NOTE: This example assumes Shadow DOM context (root_element).
 */

(function() {
  var $ = function(sel) { return root_element.querySelector(sel); };
  var $$ = function(sel) { return root_element.querySelectorAll(sel); };

  // ── State ──
  var selected = {};  // { docName: { file_name, file_url } }

  // ── Paste jszip-bulk-download.js functions here ──
  // (loadJSZip, uniqueFileName, bulkDownloadZip)

  // ── Selection management ──

  function getSelectedCount() {
    return Object.keys(selected).length;
  }

  function updateSelectionBar() {
    var count = getSelectedCount();
    var bar = $('#selection-bar');
    if (count > 0) {
      bar.style.display = 'flex';
      $('#selection-count').textContent = count + ' selected';
    } else {
      bar.style.display = 'none';
    }
  }

  function clearSelection() {
    selected = {};
    $$('.row-check').forEach(function(cb) { cb.checked = false; });
    $$('tr.row-selected').forEach(function(r) { r.classList.remove('row-selected'); });
    updateSelectionBar();
  }

  // ── Select All checkbox ──

  $('#select-all').addEventListener('change', function() {
    var checked = this.checked;
    $$('tr[data-name]').forEach(function(row) {
      var name = row.getAttribute('data-name');
      var url = row.getAttribute('data-url');
      var fname = row.getAttribute('data-fname');
      var cb = row.querySelector('.row-check');
      if (cb) cb.checked = checked;
      if (checked && url) {
        row.classList.add('row-selected');
        selected[name] = { file_name: fname || name, file_url: url };
      } else {
        row.classList.remove('row-selected');
        delete selected[name];
      }
    });
    updateSelectionBar();
  });

  // ── Row checkbox handler ──
  // (bind after rendering table rows)

  function bindRowCheckboxes() {
    $$('.row-check').forEach(function(cb) {
      cb.addEventListener('change', function(e) {
        e.stopPropagation();
        var row = this.closest('tr');
        var name = row.getAttribute('data-name');
        var url = row.getAttribute('data-url');
        var fname = row.getAttribute('data-fname');
        if (this.checked && url) {
          row.classList.add('row-selected');
          selected[name] = { file_name: fname || name, file_url: url };
        } else {
          row.classList.remove('row-selected');
          delete selected[name];
        }
        updateSelectionBar();
      });
    });
  }

  // ── Download ZIP button ──

  $('#btn-download-zip').addEventListener('click', function() {
    var files = [];
    for (var key in selected) {
      if (selected[key].file_url) {
        files.push(selected[key]);
      }
    }

    if (files.length === 0) {
      frappe.show_alert({ message: 'No downloadable files selected', indicator: 'orange' });
      return;
    }

    var btn = this;
    btn.disabled = true;
    btn.textContent = 'Preparing ZIP...';

    bulkDownloadZip(files, {
      zipName: 'My_Documents_' + new Date().toISOString().slice(0, 10) + '.zip',
      onProgress: function(fetched, errors, total) {
        btn.textContent = 'Zipping ' + fetched + '/' + total + '...';
      },
      onComplete: function(result) {
        btn.disabled = false;
        btn.textContent = 'Download ZIP';
        var msg = result.fetched + ' files downloaded';
        if (result.errors > 0) msg += ' (' + result.errors + ' failed)';
        frappe.show_alert({ message: msg, indicator: result.errors > 0 ? 'orange' : 'green' });
      },
      onError: function(err) {
        btn.disabled = false;
        btn.textContent = 'Download ZIP';
        frappe.show_alert({ message: err.message || 'Download failed', indicator: 'red' });
      }
    });
  });

  // ── Clear selection button ──
  $('#btn-clear-selection').addEventListener('click', clearSelection);

})();
