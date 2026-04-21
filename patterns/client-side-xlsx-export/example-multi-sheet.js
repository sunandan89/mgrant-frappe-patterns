/**
 * Example: Multi-sheet budget workbook with styled headers
 *
 * Demonstrates loadXlsxLib + sc + autoWidth together.
 * Creates a 2-sheet workbook: Summary and Details.
 */

async function downloadBudgetWorkbook(projectName, summaryRows, detailRows) {
  // Step 1: Load library
  frappe.show_alert({ message: 'Preparing download...', indicator: 'blue' });
  await loadXlsxLib();

  // Step 2: Define styles
  var hdrFont = { name: 'Arial', sz: 12, bold: true, color: { rgb: 'FFFFFF' } };
  var hdrFill = '00529C';   // dark blue
  var numFmt = '#,##0';

  // Step 3: Build Summary sheet
  var sumData = [
    [sc('Budget Summary', { font: { name: 'Arial', sz: 14, bold: true } })],
    [sc('Project: ' + projectName)],
    [],
    [
      sc('Category', { font: hdrFont, fill: hdrFill }),
      sc('Planned', { font: hdrFont, fill: hdrFill }),
      sc('Actual', { font: hdrFont, fill: hdrFill }),
      sc('Variance', { font: hdrFont, fill: hdrFill })
    ]
  ];

  summaryRows.forEach(function (row) {
    sumData.push([
      sc(row.category),
      sc(row.planned, { numFmt: numFmt }),
      sc(row.actual, { numFmt: numFmt }),
      sc(row.planned - row.actual, { numFmt: numFmt })
    ]);
  });

  var sumSheet = XLSX.utils.aoa_to_sheet(sumData);
  autoWidth(sumSheet, sumData);

  // Merge the title row across all columns
  sumSheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

  // Step 4: Build Details sheet
  var detData = [
    [
      sc('Sr', { font: hdrFont, fill: hdrFill }),
      sc('Activity', { font: hdrFont, fill: hdrFill }),
      sc('Q1', { font: hdrFont, fill: hdrFill }),
      sc('Q2', { font: hdrFont, fill: hdrFill }),
      sc('Q3', { font: hdrFont, fill: hdrFill }),
      sc('Q4', { font: hdrFont, fill: hdrFill }),
      sc('Total', { font: hdrFont, fill: hdrFill })
    ]
  ];

  detailRows.forEach(function (row, i) {
    var total = (row.q1 || 0) + (row.q2 || 0) + (row.q3 || 0) + (row.q4 || 0);
    detData.push([
      sc(i + 1),
      sc(row.activity),
      sc(row.q1 || 0, { numFmt: numFmt }),
      sc(row.q2 || 0, { numFmt: numFmt }),
      sc(row.q3 || 0, { numFmt: numFmt }),
      sc(row.q4 || 0, { numFmt: numFmt }),
      sc(total, { numFmt: numFmt, font: { name: 'Arial', sz: 11, bold: true } })
    ]);
  });

  var detSheet = XLSX.utils.aoa_to_sheet(detData);
  autoWidth(detSheet, detData);

  // Step 5: Assemble workbook and download
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sumSheet, 'Summary');
  XLSX.utils.book_append_sheet(wb, detSheet, 'Details');

  XLSX.writeFile(wb, projectName.replace(/\s+/g, '_') + '_budget.xlsx');
  frappe.show_alert({ message: 'Download complete', indicator: 'green' });
}
