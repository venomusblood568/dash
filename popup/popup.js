// ── Platform shortcut ──────────────────────────────────────────
const isMac = navigator.platform.toUpperCase().includes("MAC");
if (!isMac) {
  document.getElementById("keys").innerHTML = `
    <span class="key">Ctrl</span>
    <span class="key">⇧</span>
    <span class="key">Space</span>
  `;
}

// ── Apply saved theme accent to popup chrome ───────────────────
// We can't import themes.js (popup is not a module context that
// shares the extension's content script globals), so we keep a
// minimal accent-only map here.  Only the accent colour is
// needed — the rest of the popup uses static dark chrome styles.
const ACCENT_MAP = {
  void: "#6c63ff",
  night: "#58a6ff",
  ocean: "#00b4d8",
  amber: "#f59e0b",
  forest: "#22c55e",
  plum: "#c084fc",
  monochrome: "#ffffff",
  toxic: "#00ff88",
  rose: "#ff2d78",
  paper: "#4338ca",
  chalk: "#e11d48",
};

chrome.storage.sync.get("dash-theme", ({ "dash-theme": saved }) => {
  const accent = ACCENT_MAP[saved] || ACCENT_MAP.void;
  document.documentElement.style.setProperty("--accent", accent);
  document.querySelector(".btn-open").style.background = accent;
  document.querySelector(".logo").style.background = accent;
});

// ── Open now ───────────────────────────────────────────────────
document.getElementById("btn-open").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs
      .sendMessage(tab.id, { action: "toggle-palette" })
      .catch(() => {});
  }
  window.close();
});
