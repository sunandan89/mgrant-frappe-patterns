/**
 * remote-client-script-deploy
 *
 * Create or update Frappe Client Scripts remotely via frappe.xcall
 * when developer_mode is off and you have no SSH/bench access.
 *
 * CORE: Create, update, toggle, and list Client Scripts via API
 * OPTIONAL: Chunked upload for large scripts, diff-based patching
 */

/**
 * Create a new Client Script on the Frappe instance.
 *
 * @param {Object} options
 * @param {string} options.name - Document name (e.g., 'My DocType-Form-feature-name')
 * @param {string} options.dt - Target DocType (e.g., 'Story of Change')
 * @param {string} options.script - The full JavaScript content
 * @param {string} [options.scriptType='Form'] - 'Form' or 'List'
 * @param {boolean} [options.enabled=true] - Whether to enable immediately
 * @returns {Promise} Resolves with the created document
 */
function createClientScript(options) {
  return frappe.xcall('frappe.client.insert', {
    doc: {
      doctype: 'Client Script',
      name: options.name,
      dt: options.dt,
      script_type: options.scriptType || 'Form',
      enabled: options.enabled !== false ? 1 : 0,
      script: options.script
    }
  });
}

/**
 * Update the script content of an existing Client Script.
 *
 * @param {string} name - The Client Script document name
 * @param {string} script - The new JavaScript content
 * @returns {Promise} Resolves with the updated document
 */
function updateClientScript(name, script) {
  return frappe.xcall('frappe.client.set_value', {
    doctype: 'Client Script',
    name: name,
    fieldname: 'script',
    value: script
  });
}

/**
 * Enable or disable a Client Script.
 *
 * @param {string} name - The Client Script document name
 * @param {boolean} enabled - true to enable, false to disable
 * @returns {Promise}
 */
function toggleClientScript(name, enabled) {
  return frappe.xcall('frappe.client.set_value', {
    doctype: 'Client Script',
    name: name,
    fieldname: 'enabled',
    value: enabled ? 1 : 0
  });
}

/**
 * List all Client Scripts for a given DocType.
 *
 * @param {string} dt - The DocType to filter by
 * @returns {Promise<Array>} Array of { name, enabled, script_type }
 */
function listClientScripts(dt) {
  return frappe.xcall('frappe.client.get_list', {
    doctype: 'Client Script',
    filters: { dt: dt },
    fields: ['name', 'enabled', 'script_type', 'modified'],
    order_by: 'modified desc'
  });
}

/**
 * Create or update a Client Script (upsert).
 * If a script with the given name exists, updates it. Otherwise creates it.
 *
 * @param {Object} options - Same as createClientScript options
 * @returns {Promise} Resolves with the created/updated document
 */
function upsertClientScript(options) {
  return frappe.xcall('frappe.client.get_value', {
    doctype: 'Client Script',
    filters: { name: options.name },
    fieldname: 'name'
  }).then(function(r) {
    if (r && r.name) {
      // Exists — update
      return updateClientScript(options.name, options.script).then(function(doc) {
        console.log('[deploy] Updated: ' + options.name);
        return doc;
      });
    } else {
      // Doesn't exist — create
      return createClientScript(options).then(function(doc) {
        console.log('[deploy] Created: ' + doc.name);
        return doc;
      });
    }
  });
}

/**
 * Fetch the current script content of a Client Script.
 * Useful for diff-based patching — fetch, modify in JS, save back.
 *
 * @param {string} name - The Client Script document name
 * @returns {Promise<string>} The current script content
 */
function fetchClientScript(name) {
  return frappe.xcall('frappe.client.get', {
    doctype: 'Client Script',
    name: name,
    fields: ['script']
  }).then(function(r) {
    return r.script;
  });
}

/**
 * Patch a Client Script by fetching, applying string replacements, and saving.
 * Avoids re-uploading the entire script for small changes.
 *
 * @param {string} name - The Client Script document name
 * @param {Array<{old: string, new: string}>} replacements - Find/replace pairs
 * @returns {Promise} Resolves with the updated document
 */
function patchClientScript(name, replacements) {
  return fetchClientScript(name).then(function(script) {
    var patched = script;
    var applied = 0;
    replacements.forEach(function(r) {
      if (patched.indexOf(r.old) >= 0) {
        patched = patched.replace(r.old, r.new);
        applied++;
      }
    });
    console.log('[deploy] Patching ' + name + ': ' + applied + '/' + replacements.length + ' replacements applied');
    if (applied === 0) {
      return Promise.reject(new Error('No replacements matched — script unchanged'));
    }
    return updateClientScript(name, patched);
  });
}
