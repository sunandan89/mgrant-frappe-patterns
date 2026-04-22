/**
 * Example: Article-style read view for a Story of Change DocType
 *
 * Demonstrates using buildReadViewOverlay() to render an article layout
 * with hero image, metadata chips, narrative, and beneficiary quote.
 * The article-specific rendering is in renderContent — that's the OPTIONAL part.
 * The overlay machinery (tab find, hide, inject, edit restore) is CORE.
 */

// --- Paste getTabWrapper() and buildReadViewOverlay() from read-view-overlay.js here ---

frappe.ui.form.on('Story of Change', {
  refresh: function(frm) {
    if (frm.is_new()) return;

    setTimeout(function() {
      buildReadViewOverlay(frm, {
        tabFieldname: 'tab_story',
        editLabel: 'Edit Story',
        backLabel: 'Back to Hub',
        backUrl: '/app/stories-of-change',
        editColor: '#B45309',

        renderContent: function(frm) {
          var doc = frm.doc;
          var title = doc.title || 'Untitled';
          var narrative = doc.narrative || '';
          var cover = doc.cover_image || '';
          var ngo = doc.ngo_name || '';
          var status = doc.status || 'Draft';

          var html = '<article style="max-width:820px;margin:0 auto;">';

          // Hero image
          if (cover) {
            html += '<div style="border-radius:12px;overflow:hidden;margin-bottom:32px;' +
              'box-shadow:0 4px 20px rgba(0,0,0,0.08);max-height:420px;">' +
              '<img src="' + cover + '" style="width:100%;max-height:420px;object-fit:cover;display:block;" />' +
              '</div>';
          }

          // Title
          html += '<h1 style="font-size:32px;font-weight:800;color:#111827;' +
            'line-height:1.25;margin:0 0 16px 0;">' + title + '</h1>';

          // Status chip
          html += '<div style="margin-bottom:20px;">' +
            '<span style="font-size:12px;font-weight:500;padding:3px 12px;' +
            'border-radius:20px;background:#DCFCE7;color:#15803D;">' + status + '</span>';
          if (ngo) {
            html += ' <span style="font-size:12px;font-weight:500;padding:3px 12px;' +
              'border-radius:20px;background:#EDE9FE;color:#6D28D9;">' + ngo + '</span>';
          }
          html += '</div>';

          // Narrative
          html += '<div style="font-size:16px;line-height:1.75;color:#1F2937;">' +
            narrative + '</div>';

          html += '</article>';
          return html;
        }
      });
    }, 100);
  }
});
