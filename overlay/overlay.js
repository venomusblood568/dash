(() => {
  if (document.getElementById("cp-host")) return;

  // ── Themes ─────────────────────────────────────────────────────
  const THEMES = {
    default: {
      "--cp-bg": "#0e0e0f",
      "--cp-bg-deep": "#0a0a0b",
      "--cp-bg-item": "#0f0f12",
      "--cp-border": "#2a2a2e",
      "--cp-border-sub": "#131316",
      "--cp-accent": "#7b6cff",
      "--cp-accent-2": "#ff6fff",
      "--cp-accent-3": "#6fb3ff",
      "--cp-text": "#f0f0f0",
      "--cp-text-muted": "#d0d0d8",
      "--cp-text-dim": "#3a3a46",
      "--cp-text-ghost": "#2e2e36",
      "--cp-caret": "#7b6cff",
      "--cp-pill-bg": "#1e1a3a",
      "--cp-pill-border": "#2e2860",
    },
    monochrome: {
      "--cp-bg": "#080808",
      "--cp-bg-deep": "#050505",
      "--cp-bg-item": "#0c0c0c",
      "--cp-border": "#1f1f1f",
      "--cp-border-sub": "#141414",
      "--cp-accent": "#ffffff",
      "--cp-accent-2": "#aaaaaa",
      "--cp-accent-3": "#686868",
      "--cp-text": "#f0f0f0",
      "--cp-text-muted": "#d0d0d0",
      "--cp-text-dim": "#2e2e2e",
      "--cp-text-ghost": "#222222",
      "--cp-caret": "#ffffff",
      "--cp-pill-bg": "#161616",
      "--cp-pill-border": "#2a2a2a",
    },
    toxic: {
      "--cp-bg": "#060e0c",
      "--cp-bg-deep": "#040a07",
      "--cp-bg-item": "#091410",
      "--cp-border": "#0d2a20",
      "--cp-border-sub": "#0b1c14",
      "--cp-accent": "#00ff88",
      "--cp-accent-2": "#00d4ff",
      "--cp-accent-3": "#a0ffd8",
      "--cp-text": "#f0fff8",
      "--cp-text-muted": "#a0ffd8",
      "--cp-text-dim": "#1a4030",
      "--cp-text-ghost": "#0e2a20",
      "--cp-caret": "#00ff88",
      "--cp-pill-bg": "#0c2018",
      "--cp-pill-border": "#143828",
    },
    rose: {
      "--cp-bg": "#0e060c",
      "--cp-bg-deep": "#090408",
      "--cp-bg-item": "#120710",
      "--cp-border": "#2a1020",
      "--cp-border-sub": "#180c14",
      "--cp-accent": "#ff2d78",
      "--cp-accent-2": "#cc00ff",
      "--cp-accent-3": "#ff90c0",
      "--cp-text": "#fff0f8",
      "--cp-text-muted": "#ffc0e0",
      "--cp-text-dim": "#3a1830",
      "--cp-text-ghost": "#220e1c",
      "--cp-caret": "#ff2d78",
      "--cp-pill-bg": "#1e0e18",
      "--cp-pill-border": "#351828",
    },
    ocean: {
      "--cp-bg": "#04090f",
      "--cp-bg-deep": "#030710",
      "--cp-bg-item": "#060c18",
      "--cp-border": "#0a1e35",
      "--cp-border-sub": "#081520",
      "--cp-accent": "#1a8fff",
      "--cp-accent-2": "#00d4c8",
      "--cp-accent-3": "#80ccff",
      "--cp-text": "#f0f8ff",
      "--cp-text-muted": "#c0e0ff",
      "--cp-text-dim": "#0e2a45",
      "--cp-text-ghost": "#081830",
      "--cp-caret": "#1a8fff",
      "--cp-pill-bg": "#0a1828",
      "--cp-pill-border": "#122840",
    },
    amber: {
      "--cp-bg": "#0e0804",
      "--cp-bg-deep": "#090502",
      "--cp-bg-item": "#120a04",
      "--cp-border": "#2a1408",
      "--cp-border-sub": "#1a0e06",
      "--cp-accent": "#ff5500",
      "--cp-accent-2": "#ffaa00",
      "--cp-accent-3": "#ff9060",
      "--cp-text": "#fff8f0",
      "--cp-text-muted": "#ffd0a0",
      "--cp-text-dim": "#4a2810",
      "--cp-text-ghost": "#2a1208",
      "--cp-caret": "#ff5500",
      "--cp-pill-bg": "#1e1008",
      "--cp-pill-border": "#381e10",
    },
  };

  // ── Shadow DOM ─────────────────────────────────────────────────
  const host = document.createElement("div");
  host.id = "cp-host";
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  // ── Theme engine ───────────────────────────────────────────────
  // Apply vars directly as inline style on the modal element (highest specificity,
  // no selector-matching issues inside shadow DOM).
  function applyTheme(name) {
    const t = THEMES[name] || THEMES.default;
    // modal may not exist yet — store for after markup is inserted
    applyTheme._pending = t;
    const modal = shadow.getElementById("cp-modal");
    if (modal) _applyThemeVars(modal, t);
  }

  function _applyThemeVars(modal, t) {
    for (const [k, v] of Object.entries(t)) {
      modal.style.setProperty(k, v);
    }
  }

  // ── CSS ────────────────────────────────────────────────────────
  const styleLink = document.createElement("link");
  styleLink.rel = "stylesheet";
  styleLink.href = chrome.runtime.getURL("overlay/overlay.css");
  shadow.appendChild(styleLink);

  // ── Markup ─────────────────────────────────────────────────────
  const backdrop = document.createElement("div");
  backdrop.id = "cp-backdrop";
  backdrop.innerHTML = `
    <div id="cp-modal">
      <div id="cp-input-row">
        <svg id="cp-icon" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="5.5" stroke="#f0f0f0" stroke-width="1.5"/>
          <line x1="12.5" y1="12.5" x2="16" y2="16" stroke="#f0f0f0" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <div id="cp-mode-pill" style="display:none">
          <span id="cp-mode-label">cmd</span>
        </div>
        <input
          id="cp-input"
          type="text"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="type an alias or / for commands..."
        />
      </div>
      <div id="cp-results"></div>
      <div id="cp-footer">
        <div id="cp-footer-keys">
          <span class="cp-footer-key"><span class="cp-key-badge">↵</span> open</span>
          <span class="cp-footer-key"><span class="cp-key-badge">↑↓</span> navigate</span>
          <span class="cp-footer-key"><span class="cp-key-badge">ESC</span> close</span>
        </div>
      </div>
    </div>
  `;
  shadow.appendChild(backdrop);

  // ── Apply saved theme now that modal exists ────────────────────
  const modal = shadow.getElementById("cp-modal");
  chrome.storage.sync.get("dash-theme", ({ "dash-theme": saved }) => {
    const t = THEMES[saved] || THEMES.default;
    _applyThemeVars(modal, t);
  });

  // ── Refs ───────────────────────────────────────────────────────
  const input = shadow.getElementById("cp-input");
  const results = shadow.getElementById("cp-results");
  const modePill = shadow.getElementById("cp-mode-pill");
  const footerKeys = shadow.getElementById("cp-footer-keys");

  // ── State ──────────────────────────────────────────────────────
  let isOpen = false;
  let selectedIndex = -1;
  let currentItems = [];
  let mode = "search";

  // ── Slash commands registry ────────────────────────────────────
  const COMMANDS = [
    {
      cmd: "/add",
      syntax: "/add <alias> <url> [label]",
      desc: "add a new alias",
    },
    { cmd: "/list", syntax: "/list", desc: "view all aliases" },
    { cmd: "/delete", syntax: "/delete <alias>", desc: "remove an alias" },
    { cmd: "/theme", syntax: "/theme <name>", desc: "switch color theme" },
    { cmd: "/info", syntax: "/info", desc: "about Dash" },
    { cmd: "/help", syntax: "/help", desc: "show all commands" },
  ];

  // ── Open / close ───────────────────────────────────────────────
  function openPalette() {
    isOpen = true;
    backdrop.classList.add("visible");
    input.value = "";
    resetToSearch();
    requestAnimationFrame(() => input.focus());
  }

  function closePalette() {
    isOpen = false;
    backdrop.classList.remove("visible");
    input.blur();
  }

  function resetToSearch() {
    mode = "search";
    selectedIndex = -1;
    currentItems = [];
    modePill.style.display = "none";
    input.placeholder = "type an alias or / for commands...";
    setFooterSearch();
    renderEmpty();
  }

  // ── Footer helpers ─────────────────────────────────────────────
  function setFooterSearch() {
    footerKeys.innerHTML = `
      <span class="cp-footer-key"><span class="cp-key-badge">↵</span> open</span>
      <span class="cp-footer-key"><span class="cp-key-badge">↑↓</span> navigate</span>
      <span class="cp-footer-key"><span class="cp-key-badge">ESC</span> close</span>
    `;
  }

  function setFooterCommand() {
    footerKeys.innerHTML = `
      <span class="cp-footer-key"><span class="cp-key-badge">↵</span> run</span>
      <span class="cp-footer-key"><span class="cp-key-badge">tab</span> complete</span>
      <span class="cp-footer-key"><span class="cp-key-badge">ESC</span> cancel</span>
    `;
  }

  // ── Renderers ──────────────────────────────────────────────────
  function renderEmpty() {
    results.innerHTML = `
      <div id="cp-empty">
        <div id="cp-empty-title">No aliases yet.</div>
        <div id="cp-empty-hint">e.g.&nbsp;&nbsp;gh → github.com</div>
      </div>`;
  }

  function renderNoMatch(query) {
    results.innerHTML = `
      <div id="cp-no-match">no match for "<strong style="color:#4a4a5e">${esc(query)}</strong>"
        <span style="margin-left:8px;font-size:10px;color:#2e2e3a">try /add to create it</span>
      </div>`;
  }

  function renderAliases(aliases) {
    results.innerHTML = "";
    currentItems = aliases.map((a) => ({ type: "alias", data: a }));
    aliases.forEach((a, i) => {
      const el = document.createElement("div");
      el.className = "cp-item" + (i === selectedIndex ? " selected" : "");
      const label = a.label || urlToLabel(a.url);
      const url = a.url.replace(/^https?:\/\//, "");
      el.innerHTML = `
        <span class="cp-item-alias">${esc(a.alias)}</span>
        <span class="cp-item-label">${esc(label)}</span>
        <span class="cp-item-url">${esc(url)}</span>
        <span class="cp-item-arrow">↵</span>`;
      el.addEventListener("click", () => openUrl(a.url));
      results.appendChild(el);
    });
    if (aliases.length && selectedIndex === -1) {
      selectedIndex = 0;
      updateSel();
    }
  }

  function renderCommandSuggestions(filtered) {
    results.innerHTML = "";
    currentItems = filtered.map((c) => ({ type: "command", data: c }));
    if (filtered.length === 0) {
      results.innerHTML = `<div id="cp-no-match">unknown command — try <span style="color:var(--cp-accent)">/help</span></div>`;
      return;
    }
    filtered.forEach((c, i) => {
      const el = document.createElement("div");
      el.className =
        "cp-item cp-item-command" + (i === selectedIndex ? " selected" : "");
      el.innerHTML = `
        <span class="cp-cmd-name">${esc(c.cmd)}</span>
        <span class="cp-cmd-syntax">${esc(c.syntax)}</span>
        <span class="cp-cmd-desc">${esc(c.desc)}</span>`;
      el.addEventListener("click", () => {
        input.value = c.cmd + " ";
        input.focus();
        handleInput();
      });
      results.appendChild(el);
    });
    if (filtered.length && selectedIndex === -1) {
      selectedIndex = 0;
      updateSel();
    }
  }

  function renderFeedback(msg, type = "success") {
    const color =
      type === "error"
        ? "#ff5e5e"
        : type === "info"
          ? "var(--cp-accent)"
          : "#4ade80";
    results.innerHTML = `<div class="cp-feedback" style="color:${color}">${msg}</div>`;
    currentItems = [];
  }

  function renderListView(aliases) {
    results.innerHTML = "";
    currentItems = [];
    if (aliases.length === 0) {
      results.innerHTML = `<div id="cp-empty"><div id="cp-empty-title">No aliases saved.</div><div id="cp-empty-hint">Use /add to create one.</div></div>`;
      return;
    }
    const header = document.createElement("div");
    header.className = "cp-list-header";
    header.textContent = `${aliases.length} alias${aliases.length !== 1 ? "es" : ""} — use /delete <alias> to remove`;
    results.appendChild(header);
    aliases.forEach((a) => {
      const el = document.createElement("div");
      el.className = "cp-item cp-item-readonly";
      const label = a.label || urlToLabel(a.url);
      const url = a.url.replace(/^https?:\/\//, "");
      el.innerHTML = `
        <span class="cp-item-alias">${esc(a.alias)}</span>
        <span class="cp-item-label">${esc(label)}</span>
        <span class="cp-item-url">${esc(url)}</span>`;
      results.appendChild(el);
    });
  }

  function renderHelp() {
    results.innerHTML = "";
    currentItems = [];
    const header = document.createElement("div");
    header.className = "cp-list-header";
    header.textContent = "available commands";
    results.appendChild(header);
    COMMANDS.forEach((c) => {
      const el = document.createElement("div");
      el.className = "cp-item cp-item-command cp-item-readonly";
      el.innerHTML = `
        <span class="cp-cmd-name">${esc(c.cmd)}</span>
        <span class="cp-cmd-syntax">${esc(c.syntax)}</span>
        <span class="cp-cmd-desc">${esc(c.desc)}</span>`;
      results.appendChild(el);
    });
  }

  // ── Theme list renderer — supports optional filtering ──────────
  function renderThemeList(partial = "") {
    results.innerHTML = "";
    currentItems = [];

    const themeNames = Object.keys(THEMES);
    const filtered = partial
      ? themeNames.filter((n) => n.startsWith(partial))
      : themeNames;

    const header = document.createElement("div");
    header.className = "cp-list-header";
    header.textContent = partial
      ? `${filtered.length} theme${filtered.length !== 1 ? "s" : ""} matching "${partial}" — ↵ or click to apply`
      : `${themeNames.length} themes available — ↵ or click to apply`;
    results.appendChild(header);

    if (filtered.length === 0) {
      const none = document.createElement("div");
      none.id = "cp-no-match";
      none.innerHTML = `no theme matches "<strong style="color:#4a4a5e">${esc(partial)}</strong>"`;
      results.appendChild(none);
      return;
    }

    filtered.forEach((name, i) => {
      const t = THEMES[name];
      const el = document.createElement("div");
      el.className = "cp-item" + (i === selectedIndex ? " selected" : "");
      el.innerHTML = `
        <span class="cp-cmd-name" style="color:${t["--cp-accent"]}">${esc(name)}</span>
        <span class="cp-cmd-syntax">
          <span style="display:inline-flex;gap:5px;align-items:center;">
            <span style="width:10px;height:10px;border-radius:50%;background:${t["--cp-accent"]};display:inline-block;"></span>
            <span style="width:10px;height:10px;border-radius:50%;background:${t["--cp-accent-2"]};display:inline-block;"></span>
            <span style="width:10px;height:10px;border-radius:50%;background:${t["--cp-accent-3"]};display:inline-block;"></span>
          </span>
        </span>
        <span class="cp-cmd-desc" style="color:${t["--cp-text-dim"]}">click or ↵ to apply</span>`;

      el.addEventListener("click", () => applyAndSaveTheme(name));
      results.appendChild(el);
    });

    currentItems = filtered.map((name) => ({ type: "theme", data: { name } }));
    if (filtered.length && selectedIndex === -1) {
      selectedIndex = 0;
      updateSel();
    }
  }

  function applyAndSaveTheme(name) {
    _applyThemeVars(modal, THEMES[name] || THEMES.default);
    chrome.storage.sync.set({ "dash-theme": name });
    renderFeedback(
      `✓ theme set to <span style="color:var(--cp-accent)">${esc(name)}</span>`,
    );
    input.value = "";
    setTimeout(resetToSearch, 1200);
  }

  function renderInfo() {
    results.innerHTML = "";
    currentItems = [];
    const el = document.createElement("div");
    el.className = "cp-info-card";
    el.innerHTML = `
      <div class="cp-info-title">Dash <span class="cp-info-version">v1.0.0</span></div>
      <div class="cp-info-sub">Keyboard-first browser launcher</div>
      <div class="cp-info-divider"></div>
      <div class="cp-info-row">Built by <span class="cp-info-author">Sam</span></div>
      <div class="cp-info-links">
        <a class="cp-info-link" href="https://github.com/venomusblood568" target="_blank">GitHub</a>
        <a class="cp-info-link" href="https://gourav-duck.vercel.app/" target="_blank">Portfolio</a>
      </div>`;
    results.appendChild(el);
  }

  // ── Input handler ──────────────────────────────────────────────
  input.addEventListener("input", handleInput);

  async function handleInput() {
    const val = input.value;
    const query = val.trim();
    selectedIndex = -1;

    if (query.startsWith("/")) {
      mode = "command";
      modePill.style.display = "inline-flex";
      setFooterCommand();

      const parts = query.split(/\s+/);
      const cmdToken = parts[0].toLowerCase();

      // Still typing the command name — show matching suggestions
      if (parts.length === 1) {
        const filtered = COMMANDS.filter((c) => c.cmd.startsWith(cmdToken));
        renderCommandSuggestions(filtered);
        return;
      }

      // Command name is complete; handle argument context
      const matched = COMMANDS.find((c) => c.cmd === cmdToken);

      if (matched?.cmd === "/theme") {
        // Always show live-filtered theme list while user types the name
        const partial = parts[1]?.toLowerCase() || "";
        renderThemeList(partial);
        return;
      }

      if (matched) {
        results.innerHTML = `<div class="cp-syntax-hint"><span class="cp-cmd-name">${esc(matched.cmd)}</span><span class="cp-cmd-syntax">${esc(matched.syntax)}</span></div>`;
      } else {
        results.innerHTML = `<div id="cp-no-match">unknown command — try <span style="color:var(--cp-accent)">/help</span></div>`;
      }
      currentItems = [];
      return;
    }

    mode = "search";
    modePill.style.display = "none";
    setFooterSearch();

    if (!query) {
      const all = await getAliases();
      all.length === 0 ? renderEmpty() : renderAliases(all);
      return;
    }

    const matches = await findMatches(query);
    matches.length === 0 ? renderNoMatch(query) : renderAliases(matches);
  }

  // ── Command executor ───────────────────────────────────────────
  async function executeCommand(raw) {
    const parts = raw.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();

    if (cmd === "/add") {
      const alias = parts[1];
      const url = parts[2];
      const label = parts.slice(3).join(" ");
      if (!alias || !url) {
        renderFeedback(
          "usage: /add &lt;alias&gt; &lt;url&gt; [label]",
          "error",
        );
        return;
      }
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
      try {
        await addAlias({ alias, url: normalizedUrl, label });
        renderFeedback(
          `✓ <span style="color:var(--cp-accent)">${esc(alias)}</span> → ${esc(normalizedUrl.replace(/^https?:\/\//, ""))} saved`,
        );
        input.value = "";
        setTimeout(resetToSearch, 1400);
      } catch (e) {
        renderFeedback(e.message, "error");
      }
      return;
    }

    if (cmd === "/delete") {
      const alias = parts[1];
      if (!alias) {
        renderFeedback("usage: /delete &lt;alias&gt;", "error");
        return;
      }
      const all = await getAliases();
      const exists = all.find((a) => a.alias === alias.toLowerCase());
      if (!exists) {
        renderFeedback(`"${esc(alias)}" not found`, "error");
        return;
      }
      await deleteAlias(alias.toLowerCase());
      renderFeedback(
        `✓ <span style="color:var(--cp-accent)">${esc(alias)}</span> deleted`,
      );
      input.value = "";
      setTimeout(resetToSearch, 1400);
      return;
    }

    if (cmd === "/list") {
      const all = await getAliases();
      renderListView(all);
      input.value = "";
      return;
    }

    if (cmd === "/help") {
      renderHelp();
      input.value = "";
      return;
    }

    if (cmd === "/theme") {
      const name = parts[1]?.toLowerCase();
      if (!name) {
        // No name — show full picker
        renderThemeList();
        input.value = "";
        return;
      }
      if (!THEMES[name]) {
        const available = Object.keys(THEMES).join(" · ");
        renderFeedback(
          `unknown theme. available: <span style="color:var(--cp-accent)">${available}</span>`,
          "error",
        );
        return;
      }
      applyAndSaveTheme(name);
      return;
    }

    if (cmd === "/info") {
      renderInfo();
      input.value = "";
      return;
    }

    renderFeedback("unknown command — try /help", "error");
  }

  // ── Keyboard handler ───────────────────────────────────────────
  input.addEventListener("keydown", async (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        if (mode === "command") {
          input.value = "";
          resetToSearch();
        } else closePalette();
        break;

      case "Enter": {
        e.preventDefault();
        const val = input.value.trim();
        if (!val) break;

        if (val.startsWith("/")) {
          // If a theme item is selected, apply it directly
          if (currentItems[selectedIndex]?.type === "theme") {
            applyAndSaveTheme(currentItems[selectedIndex].data.name);
            break;
          }
          await executeCommand(val);
          break;
        }

        if (
          selectedIndex >= 0 &&
          currentItems[selectedIndex]?.type === "alias"
        ) {
          openUrl(currentItems[selectedIndex].data.url);
        } else {
          const exact = await findExactMatch(val);
          if (exact) openUrl(exact.url);
          else if (currentItems[0]?.type === "alias")
            openUrl(currentItems[0].data.url);
        }
        break;
      }

      case "Tab":
        if (
          mode === "command" &&
          currentItems[selectedIndex]?.type === "command"
        ) {
          e.preventDefault();
          input.value = currentItems[selectedIndex].data.cmd + " ";
          handleInput();
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!currentItems.length) break;
        selectedIndex = Math.min(selectedIndex + 1, currentItems.length - 1);
        updateSel();
        scrollSel();
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!currentItems.length) break;
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSel();
        scrollSel();
        break;
    }
  });

  // ── Backdrop click ─────────────────────────────────────────────
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closePalette();
  });

  // ── Helpers ────────────────────────────────────────────────────
  function openUrl(url) {
    closePalette();
    const target = url.startsWith("http") ? url : `https://${url}`;
    chrome.runtime.sendMessage({ action: "open-url", url: target });
  }

  function updateSel() {
    results.querySelectorAll(".cp-item").forEach((el, i) => {
      el.classList.toggle("selected", i === selectedIndex);
    });
  }

  function scrollSel() {
    const items = results.querySelectorAll(".cp-item");
    if (items[selectedIndex])
      items[selectedIndex].scrollIntoView({ block: "nearest" });
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function urlToLabel(url) {
    try {
      return new URL(
        url.startsWith("http") ? url : `https://${url}`,
      ).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  }

  input.addEventListener("blur", () => {
    if (isOpen) requestAnimationFrame(() => input.focus());
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "toggle-palette")
      isOpen ? closePalette() : openPalette();
  });
})();
