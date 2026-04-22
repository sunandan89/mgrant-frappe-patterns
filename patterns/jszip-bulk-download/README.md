# JSZip Bulk Download

Client-side ZIP generation for downloading multiple files from a Frappe instance. Fetches files via `fetch()` with credentials, bundles them using JSZip, and triggers a browser download. No server-side code needed.

## When to use

- Users need to download multiple attachments at once (e.g., from a document repository, project files, compliance documents)
- You have a list/table view with selectable rows, each linked to a file URL
- The files are served by Frappe (private or public) and the user has access
- You want progress feedback and error handling without server-side ZIP generation

## How it works

1. **Load JSZip** from CDN (cached after first call)
2. **Fetch each file** using `fetch()` with `credentials: 'include'` (so Frappe's session cookie is sent — required for private files)
3. **Deduplicate filenames** — if two files have the same name, the second becomes `name (2).ext`
4. **Generate ZIP** in-browser and trigger download via a temporary `<a>` element
5. **Report progress** via callbacks — update button text, show success/error alerts

## Quick start

### Option A: Use the `bulkDownloadZip` helper

```javascript
// Copy loadJSZip, uniqueFileName, bulkDownloadZip from jszip-bulk-download.js

var files = [
  { file_name: 'report.pdf', file_url: '/files/report.pdf' },
  { file_name: 'budget.xlsx', file_url: '/private/files/budget.xlsx' }
];

bulkDownloadZip(files, {
  zipName: 'Project_Files.zip',
  onProgress: function(fetched, errors, total) {
    console.log(fetched + '/' + total + ' done');
  },
  onComplete: function(result) {
    frappe.show_alert({
      message: result.fetched + ' files downloaded',
      indicator: 'green'
    });
  }
});
```

### Option B: Use just the loader + raw JSZip

```javascript
// If you need more control over the ZIP structure (folders, metadata)

loadJSZip().then(function(JSZip) {
  var zip = new JSZip();
  var folder = zip.folder('attachments');

  fetch('/files/doc.pdf', { credentials: 'include' })
    .then(function(r) { return r.blob(); })
    .then(function(blob) {
      folder.file('doc.pdf', blob);
      return zip.generateAsync({ type: 'blob' });
    })
    .then(function(content) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = 'archive.zip';
      a.click();
    });
});
```

## API

### `loadJSZip()`

Returns a `Promise<JSZip>` that resolves with the JSZip constructor. Safe to call multiple times — uses cache check.

### `uniqueFileName(name, usedNames)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Original filename |
| `usedNames` | Object | Mutable map for tracking used names (pass `{}` initially) |

Returns a unique filename. On collision, appends ` (2)`, ` (3)`, etc. before the extension.

### `bulkDownloadZip(files, [options])`

| Parameter | Type | Description |
|-----------|------|-------------|
| `files` | Array | `[{file_name, file_url}, ...]` — URLs starting with `/` are made absolute |
| `options.zipName` | string | Output filename (default: `Documents_YYYY-MM-DD.zip`) |
| `options.onProgress` | Function | `(fetched, errors, total)` — called after each file |
| `options.onComplete` | Function | `({fetched, errors, total})` — called after ZIP download triggers |
| `options.onError` | Function | `(error)` — called if JSZip fails to load or all files fail |

Returns a `Promise<void>`.

## Important notes

- **Private files**: `fetch()` is called with `credentials: 'include'`, so Frappe's session cookie is sent. This means users can only download files they have permission to access.
- **File size**: ZIP generation happens in-browser memory. For very large downloads (500MB+), users may experience slowness. Consider adding a warning or limit.
- **CDN dependency**: Requires internet access to load JSZip from CDN. For air-gapped environments, self-host the library.
- **Duplicate filenames**: Handled automatically — `report.pdf` + `report.pdf` becomes `report.pdf` + `report (2).pdf`.

## CDN URL

```
https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
```

## Used in

- **Document Repository** hub (Custom HTML Block) — `mgrant-document-repository` repo
