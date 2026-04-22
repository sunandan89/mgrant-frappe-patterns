/**
 * Example: Deploy a Client Script from the browser console
 *
 * Run these snippets in the browser console on your Frappe instance.
 * No SSH, no bench, no developer_mode required.
 */

// --- Paste the functions from deploy-client-script.js here, or load via CDN ---

// ============================================================
// 1. CREATE a new Client Script
// ============================================================
createClientScript({
  name: 'My DocType-Form-read-view',
  dt: 'My DocType',
  script: 'frappe.ui.form.on("My DocType", {\n  refresh: function(frm) {\n    console.log("Hello from remote deploy!");\n  }\n});',
  scriptType: 'Form',
  enabled: true
}).then(function(doc) {
  console.log('Created:', doc.name);
});

// ============================================================
// 2. LIST all Client Scripts for a DocType
// ============================================================
listClientScripts('My DocType').then(function(scripts) {
  scripts.forEach(function(s) {
    console.log(s.name, '| enabled:', s.enabled, '| modified:', s.modified);
  });
});

// ============================================================
// 3. UPSERT (create-or-update) — safe for repeated deploys
// ============================================================
var myScript = 'frappe.ui.form.on("My DocType", {\n' +
  '  refresh: function(frm) {\n' +
  '    // Updated logic here\n' +
  '  }\n' +
  '});';

upsertClientScript({
  name: 'My DocType-Form-read-view',
  dt: 'My DocType',
  script: myScript
}).then(function(doc) {
  console.log('Upserted:', doc.name);
});

// ============================================================
// 4. PATCH — change specific lines without re-uploading everything
// ============================================================
patchClientScript('My DocType-Form-read-view', [
  {
    old: "$tab.find('.frappe-control').hide();",
    new: "$tab.children().hide();"
  },
  {
    old: "$tab.find('.frappe-control').show();",
    new: "$tab.children().show();"
  }
]).then(function(doc) {
  console.log('Patched:', doc.name);
});

// ============================================================
// 5. TOGGLE enable/disable for testing
// ============================================================
toggleClientScript('My DocType-Form-read-view', false); // disable
// toggleClientScript('My DocType-Form-read-view', true);  // re-enable

// ============================================================
// 6. After deploy: HARD RELOAD the page (Ctrl+Shift+R)
//    Frappe caches Client Scripts — a soft reload won't pick up changes.
// ============================================================
