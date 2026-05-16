import { THEME_ORDER, applyThemeToWebsite } from "../themes/theme.js";

/* ── DATA ── */
const ALIASES = [
  { alias: "gh", name: "GitHub", url: "https://github.com" },
  { alias: "yt", name: "YouTube", url: "https://youtube.com" },
  { alias: "gm", name: "Gmail", url: "https://mail.google.com" },
  { alias: "fig", name: "Figma", url: "https://figma.com" },
  { alias: "tw", name: "Twitter", url: "https://twitter.com" },
  { alias: "lk", name: "LinkedIn", url: "https://linkedin.com" },
  { alias: "rd", name: "Reddit", url: "https://reddit.com" },
  { alias: "nt", name: "Notion", url: "https://notion.so" },
];

const BUILTIN_CMDS = [
  {
    alias: "/themes",
    name: "Go to Themes",
    action: () => {
      closeCmd();
      navTo("#themes");
    },
  },
  {
    alias: "/install",
    name: "Go to Install",
    action: () => {
      closeCmd();
      navTo("#install");
    },
  },
  {
    alias: "/docs",
    name: "Go to Docs",
    action: () => {
      closeCmd();
      navTo("#philosophy");
    },
  },
  {
    alias: "/setup",
    name: "Go to Commands",
    action: () => {
      closeCmd();
      navTo("#setup");
    },
  },
];

/* ── THEME STATE ── */
let themeIdx = 0; // index into THEME_ORDER

/**
 * applyTheme(name, swatchEl?)
 * Single entry-point for all theme changes on the website.
 * Delegates colour work to applyThemeToWebsite() from themes.js.
 */
function applyTheme(name, el) {
  applyThemeToWebsite(name); // sets data-theme + all CSS vars
  themeIdx = THEME_ORDER.indexOf(name);
  if (themeIdx === -1) themeIdx = 0;

  document
    .querySelectorAll(".swatch")
    .forEach((s) => s.classList.remove("active"));
  const target =
    el || document.querySelector(`.swatch[data-theme-id="${name}"]`);
  if (target) target.classList.add("active");
}

// Wire up swatch buttons via event delegation (avoids window exposure with type="module")
document.addEventListener("click", (e) => {
  const swatch = e.target.closest(".swatch[data-theme-id]");
  if (swatch) applyTheme(swatch.dataset.themeId, swatch);
});

/* ── SMOOTH NAV ── */
function navTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

/* ── TOAST ── */
const toast = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}

/* ── COMMAND PALETTE ── */
const overlay = document.getElementById("cmd-overlay");
const cmdInput = document.getElementById("cmd-input");
const cmdResults = document.getElementById("cmd-results");
let focusedIdx = -1;
let filteredItems = [];

function openCmd(prefill = "") {
  overlay.classList.add("open");
  cmdInput.value = prefill;
  cmdInput.focus();
  renderResults(prefill);
}

function closeCmd() {
  overlay.classList.remove("open");
  cmdInput.value = "";
  focusedIdx = -1;
}

function renderResults(query) {
  query = query.toLowerCase().trim();
  filteredItems = [];

  if (query.startsWith("/")) {
    BUILTIN_CMDS.forEach((c) => {
      if (c.alias.includes(query) || c.name.toLowerCase().includes(query))
        filteredItems.push({ ...c, isCmd: true });
    });
  }

  ALIASES.forEach((a) => {
    if (
      !query ||
      a.alias.includes(query) ||
      a.name.toLowerCase().includes(query) ||
      a.url.includes(query)
    )
      filteredItems.push({ ...a, isCmd: false });
  });

  if (!query) {
    BUILTIN_CMDS.forEach((c) => filteredItems.push({ ...c, isCmd: true }));
  }

  focusedIdx = filteredItems.length ? 0 : -1;
  cmdResults.innerHTML = "";

  if (!filteredItems.length) {
    cmdResults.innerHTML = `<div style="padding:.75rem 1rem;font-family:'JetBrains Mono',monospace;font-size:.75rem;color:var(--text3);">no matches for "${query}"</div>`;
    return;
  }

  filteredItems.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "cmd-result" + (i === 0 ? " focused" : "");
    row.setAttribute("role", "option");
    row.innerHTML = `
      <div class="cmd-result-alias">${item.alias}</div>
      <div class="cmd-result-name">${item.name}</div>
      ${item.isCmd ? "" : `<div class="cmd-result-url">${item.url.replace("https://", "")}</div>`}
      <div class="cmd-enter">↵</div>
    `;
    row.addEventListener("click", () => executeItem(item));
    row.addEventListener("mouseenter", () => setFocus(i));
    cmdResults.appendChild(row);
  });
}

function setFocus(idx) {
  const rows = cmdResults.querySelectorAll(".cmd-result");
  rows.forEach((r) => r.classList.remove("focused"));
  focusedIdx = idx;
  if (rows[idx]) rows[idx].classList.add("focused");
}

function executeItem(item) {
  if (item.isCmd) {
    item.action();
  } else {
    showToast(`→ ${item.name}`);
    closeCmd();
    // In real extension: window.location.href = item.url;
  }
}

/* ── CMD INPUT EVENTS ── */
cmdInput.addEventListener("input", (e) => renderResults(e.target.value));

cmdInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setFocus(Math.min(focusedIdx + 1, filteredItems.length - 1));
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setFocus(Math.max(focusedIdx - 1, 0));
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (focusedIdx >= 0) executeItem(filteredItems[focusedIdx]);
  } else if (e.key === "Escape") {
    closeCmd();
  }
});

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeCmd();
});
document
  .getElementById("navInvokeBtn")
  .addEventListener("click", () => openCmd());

/* ── GLOBAL KEYBOARD SHORTCUTS ── */
document.addEventListener(
  "keydown",
  (e) => {
    if (e.ctrlKey && e.key === " ") {
      e.preventDefault();
      overlay.classList.contains("open") ? closeCmd() : openCmd();
    }
  },
  true,
);

document.addEventListener("keydown", (e) => {
  const tag = e.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  if (e.key === "/") {
    e.preventDefault();
    openCmd("/");
  } else if (e.key === "t" || e.key === "T") {
    themeIdx = (themeIdx + 1) % THEME_ORDER.length;
    applyTheme(THEME_ORDER[themeIdx]);
    showToast(`theme: ${THEME_ORDER[themeIdx]}`);
  } else if (e.key === "j") {
    window.scrollBy({ top: 120, behavior: "smooth" });
  } else if (e.key === "k") {
    window.scrollBy({ top: -120, behavior: "smooth" });
  } else if (e.key === "g") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (e.key === "Escape") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

/* ── HERO DEMO ANIMATION ── */
const sequences = [
  { chars: "gh", alias: "gh" },
  { chars: "yt", alias: "yt" },
  { chars: "gm", alias: "gm" },
];
let seqIdx = 0;
let charIdx = 0;
const palField = document.getElementById("palField");
const palRows = document.querySelectorAll(".pal-row");

function getRow(alias) {
  return document.querySelector(`.pal-row[data-alias="${alias}"]`);
}

function typeNext() {
  const seq = sequences[seqIdx];
  if (charIdx < seq.chars.length) {
    palField.value = seq.chars.slice(0, charIdx + 1);
    palRows.forEach((r) => r.classList.remove("active"));
    getRow(seq.alias)?.classList.add("active");
    charIdx++;
    setTimeout(typeNext, 130);
  } else {
    setTimeout(() => {
      palField.value = "";
      palRows.forEach((r) => r.classList.remove("active"));
      palRows[0].classList.add("active");
      charIdx = 0;
      seqIdx = (seqIdx + 1) % sequences.length;
      setTimeout(typeNext, 900);
    }, 1300);
  }
}
setTimeout(typeNext, 1200);

/* ── FIRST VISIT HINT ── */
setTimeout(() => {
  showToast("tip: press / to invoke palette · t to cycle themes");
}, 2500);
