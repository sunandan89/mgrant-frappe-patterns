/**
 * Example: Using wrapper-guard in a Frappe Client Script
 *
 * DocType: Project proposal
 * HTML field: cummulative_budget
 */

frappe.ui.form.on('Project proposal', {
  refresh(frm) {
    if (!frm.doc.__islocal) setup_custom_ui(frm);
  },
  onload(frm) {
    if (!frm.doc.__islocal) setup_custom_ui(frm);
  }
});

function setup_custom_ui(frm) {
  // Prevent re-entrant rendering
  if (frm._rendering) return;

  var $w = frm.fields_dict.cummulative_budget
    && frm.fields_dict.cummulative_budget.$wrapper;
  if (!$w || !$w.length) return;

  // Step 1: Apply the guard (runs once)
  wrapperGuard($w);

  // Step 2: Skip re-render if already rendered for this document
  if (frm._rendered_for === frm.doc.name) return;

  // Step 3: Render your UI
  frm._rendering = true;

  buildMyUI(frm).then(function (html) {
    safeRender($w, frm, html);
    frm._rendered_for = frm.doc.name;
    frm._rendering = false;
  }).catch(function (err) {
    console.error('Render error:', err);
    frm._rendering = false;
  });
}

async function buildMyUI(frm) {
  // Your async data fetching and HTML building here
  return '<div style="padding:24px;">Custom UI for ' + frm.doc.name + '</div>';
}
