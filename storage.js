// storage.js
// Single source of truth for all alias data.
// Both content.js and options.js import through here.
// Never call chrome.storage directly from anywhere else.

const STORAGE_KEY = "aliases";

// Returns full alias array from sync storage
// Shape: [{ alias: "gh", url: "https://github.com", label: "GitHub" }]
function getAliases() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY] || []);
    });
  });
}

// Overwrites the full alias array in sync storage
function saveAliases(aliases) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEY]: aliases }, resolve);
  });
}

// Adds a single alias. Rejects if alias already exists.
async function addAlias({ alias, url, label }) {
  const aliases = await getAliases();
  const normalized = alias.trim().toLowerCase();

  const exists = aliases.some((a) => a.alias === normalized);
  if (exists) {
    throw new Error(`Alias "${normalized}" already exists.`);
  }

  const entry = {
    alias: normalized,
    url: url.trim(),
    label: label ? label.trim() : "",
  };

  aliases.push(entry);
  await saveAliases(aliases);
  return entry;
}

// Removes alias by alias string
async function deleteAlias(aliasString) {
  const aliases = await getAliases();
  const filtered = aliases.filter((a) => a.alias !== aliasString);
  await saveAliases(filtered);
}

// Updates an existing alias entry
async function updateAlias(aliasString, updates) {
  const aliases = await getAliases();
  const index = aliases.findIndex((a) => a.alias === aliasString);
  if (index === -1) throw new Error(`Alias "${aliasString}" not found.`);

  aliases[index] = { ...aliases[index], ...updates };
  await saveAliases(aliases);
  return aliases[index];
}

// Core match function used by content.js
// Takes raw user input string, returns array of matching alias objects
// Phase 1: exact prefix match only
// Phase 3 will upgrade this to fuzzy
async function findMatches(input) {
  if (!input || !input.trim()) return [];

  const aliases = await getAliases();
  const query = input.trim().toLowerCase();

  return aliases.filter((a) => a.alias.startsWith(query));
}

// Exact match — used on Enter keypress
async function findExactMatch(input) {
  if (!input || !input.trim()) return null;

  const aliases = await getAliases();
  const query = input.trim().toLowerCase();

  return aliases.find((a) => a.alias === query) || null;
}

// ── Expose to other content scripts ───────────────────────────
// overlay.js runs in the same content script context and reads
// these functions from window.__DashStorage.
window.__DashStorage = {
  getAliases,
  saveAliases,
  addAlias,
  deleteAlias,
  updateAlias,
  findMatches,
  findExactMatch,
};
