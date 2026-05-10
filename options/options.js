// options.js
// Wires the options page UI to storage.js.
// Add / delete aliases. Render the list. Validate input.

const inputAlias = document.getElementById("input-alias");
const inputUrl = document.getElementById("input-url");
const inputLabel = document.getElementById("input-label");
const btnAdd = document.getElementById("btn-add");
const formError = document.getElementById("form-error");
const aliasList = document.getElementById("alias-list");
const aliasCount = document.getElementById("alias-count");

// ── Render list ────────────────────────────────────────────
async function renderList() {
  const aliases = await getAliases();

  aliasCount.textContent = `${aliases.length} alias${aliases.length !== 1 ? "es" : ""}`;

  if (aliases.length === 0) {
    aliasList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">No aliases yet.</div>
        <div class="empty-state-hint">e.g.&nbsp;&nbsp;gh → github.com</div>
      </div>
    `;
    return;
  }

  aliasList.innerHTML = "";

  aliases.forEach((a) => {
    const row = document.createElement("div");
    row.className = "alias-row";

    const displayLabel = a.label || urlToLabel(a.url);
    const displayUrl = a.url.replace(/^https?:\/\//, "");

    row.innerHTML = `
      <span class="alias-row-alias">${escapeHtml(a.alias)}</span>
      <span class="alias-row-arrow">→</span>
      <span class="alias-row-label">${escapeHtml(displayLabel)}</span>
      <span class="alias-row-url">${escapeHtml(displayUrl)}</span>
      <button class="alias-row-delete" data-alias="${escapeHtml(a.alias)}" title="Delete">✕</button>
    `;

    aliasList.appendChild(row);
  });

  // Wire delete buttons
  aliasList.querySelectorAll(".alias-row-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const aliasStr = btn.dataset.alias;
      await deleteAlias(aliasStr);
      renderList();
    });
  });
}

// ── Add alias ──────────────────────────────────────────────
btnAdd.addEventListener("click", handleAdd);

// Also trigger on Enter in any field
[inputAlias, inputUrl, inputLabel].forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleAdd();
  });
});

async function handleAdd() {
  clearError();

  const alias = inputAlias.value.trim().toLowerCase();
  const url = inputUrl.value.trim();
  const label = inputLabel.value.trim();

  // Validation
  if (!alias) {
    showError("Alias can't be empty.");
    inputAlias.focus();
    return;
  }

  if (!/^[a-z0-9 _-]+$/.test(alias)) {
    showError("Alias can only contain letters, numbers, spaces, - and _");
    inputAlias.focus();
    return;
  }

  if (!url) {
    showError("URL can't be empty.");
    inputUrl.focus();
    return;
  }

  // Auto-prefix https:// if missing
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  try {
    new URL(normalizedUrl);
  } catch {
    showError("That doesn't look like a valid URL.");
    inputUrl.focus();
    return;
  }

  try {
    await addAlias({ alias, url: normalizedUrl, label });

    // Clear form
    inputAlias.value = "";
    inputUrl.value = "";
    inputLabel.value = "";
    inputAlias.focus();

    renderList();
  } catch (err) {
    showError(err.message);
  }
}

// ── Helpers ────────────────────────────────────────────────
function showError(msg) {
  formError.textContent = msg;
}

function clearError() {
  formError.textContent = "";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function urlToLabel(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ── Init ───────────────────────────────────────────────────
renderList();
