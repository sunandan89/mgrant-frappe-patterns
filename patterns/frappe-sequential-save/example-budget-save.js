/**
 * Example: Saving budget rows sequentially to avoid lock errors
 *
 * Context: A budget table rendered via Client Script has 15 editable rows.
 * Each row maps to a "Project Budget Planning" record.
 * Parallel saves cause TimestampMismatchError; sequential saves work.
 */

function saveBudgetRows(frm, rows, quarters) {
  var saveFn = function (row, idx) {
    var planningTable = quarters.map(function (q) {
      return { timespan: q.quarter, planned_amount: row.amounts[q.quarter] || 0 };
    });

    return frappe.call({
      method: 'frappe.client.save_doc',
      args: {
        doc: {
          doctype: 'Project Budget Planning',
          name: row.pbpId || undefined,        // update if exists, create if new
          project_proposal: frm.doc.name,
          description: row.description,
          budget_head: row.budgetHead,
          sub_budget_head: row.subBudgetHead,
          fund_source: row.fundSource,
          total_planned_budget: row.total,
          planning_table: planningTable
        }
      },
      freeze: false   // don't freeze UI — let progress indicator show
    });
  };

  return sequentialSave(rows, saveFn, {
    onProgress: function (i, total) {
      frappe.show_alert({
        message: 'Saving row ' + (i + 1) + ' of ' + total + '...',
        indicator: 'blue'
      });
    },
    onComplete: function (total) {
      frappe.show_alert({
        message: 'Saved ' + total + ' budget rows successfully',
        indicator: 'green'
      });
    },
    onError: function (i, err) {
      frappe.show_alert({
        message: 'Error saving row ' + (i + 1) + '. Stopped.',
        indicator: 'red'
      });
    },
    stopOnError: true
  });
}
