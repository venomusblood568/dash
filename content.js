(() => {
  if (document.getElementById("cp-host")) return;

  // ── Themes (sourced from themes-bundle.js via window.__DashThemes) ──
  // Never hardcode themes here — themes-bundle.js is the single source of truth.
  const THEMES = (() => {
    const raw = window.__DashThemes?.THEMES || {};
    const out = {};
    for (const [name, t] of Object.entries(raw)) {
      out[name] = {
        "--cp-bg": t.bgItem,
        "--cp-bg-deep": t.bgDeep,
        "--cp-bg-item": t.bgRaised,
        "--cp-border": t.borderMd,
        "--cp-border-sub": t.border,
        "--cp-accent": t.accent,
        "--cp-accent-2": t.accentBright,
        "--cp-accent-3": t.accentAlt,
        "--cp-text": t.text,
        "--cp-text-muted": t.textMuted,
        "--cp-text-dim": t.textDim,
        "--cp-text-ghost": t.textGhost,
        "--cp-caret": t.cursor,
        "--cp-pill-bg": t.pillBg,
        "--cp-pill-border": t.pillBorder,
      };
    }
    return out;
  })();

  // ── Shadow DOM ─────────────────────────────────────────────────
  const host = document.createElement("div");
  host.id = "cp-host";
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });

  const styleLink = document.createElement("link");
  styleLink.rel = "stylesheet";
  styleLink.href = chrome.runtime.getURL("overlay/overlay.css");
  shadow.appendChild(styleLink);

  // ── Markup ─────────────────────────────────────────────────────
  const backdrop = document.createElement("div");
  backdrop.id = "cp-backdrop";
  backdrop.style.display = "none"; // hide until CSS loads to prevent flash
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

  // Reveal backdrop only after stylesheet is ready — prevents the flash
  styleLink.addEventListener("load", () => {
    backdrop.style.display = "";
  });

  // ── Theme helpers ──────────────────────────────────────────────
  const modal = shadow.getElementById("cp-modal");

  function applyThemeVars(name) {
    const t = THEMES[name] || THEMES["void"] || Object.values(THEMES)[0];
    if (!t) return;
    for (const [k, v] of Object.entries(t)) {
      modal.style.setProperty(k, v);
    }
  }

  function applyAndSaveTheme(name) {
    applyThemeVars(name);
    chrome.storage.sync.set({ "dash-theme": name });
    renderFeedback(
      `✓ theme set to <span style="color:var(--cp-accent)">${esc(name)}</span>`,
    );
    input.value = "";
    setTimeout(resetToSearch, 1200);
  }

  chrome.storage.sync.get("dash-theme", ({ "dash-theme": saved }) => {
    applyThemeVars(saved || "void");
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
  ];

  // ── Open / close ───────────────────────────────────────────────
  async function openPalette() {
    isOpen = true;
    backdrop.classList.add("visible");
    input.value = "";
    resetToSearch();
    requestAnimationFrame(() => input.focus());

    // Load and show existing aliases immediately
    const all = await getAliases();
    all.length === 0 ? renderEmpty() : renderAliases(all);
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
      <div id="cp-no-match">no match for "<strong style="color:var(--cp-text-dim)">${esc(query)}</strong>"
        <span style="margin-left:8px;font-size:10px;color:var(--cp-text-ghost)">try /add to create it</span>
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
      results.innerHTML = `<div id="cp-no-match">unknown command</div>`;
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

  function renderThemeList(partial = "") {
    results.innerHTML = "";
    currentItems = [];
    const themeNames = window.__DashThemes?.THEME_ORDER || Object.keys(THEMES);
    const filtered = partial
      ? themeNames.filter((n) => n.startsWith(partial))
      : themeNames;

    const header = document.createElement("div");
    header.className = "cp-list-header";
    header.textContent = partial
      ? `${filtered.length} theme${filtered.length !== 1 ? "s" : ""} matching "${partial}" — ↵ or click to apply`
      : `${themeNames.length} themes — ↵ or click to apply`;
    results.appendChild(header);

    if (filtered.length === 0) {
      const none = document.createElement("div");
      none.id = "cp-no-match";
      none.innerHTML = `no theme matches "<strong style="color:var(--cp-text-dim)">${esc(partial)}</strong>"`;
      results.appendChild(none);
      return;
    }

    filtered.forEach((name, i) => {
      const t = THEMES[name];
      if (!t) return;
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
        <span class="cp-cmd-desc">click or ↵ to apply</span>`;
      el.addEventListener("click", () => applyAndSaveTheme(name));
      results.appendChild(el);
    });

    currentItems = filtered.map((name) => ({ type: "theme", data: { name } }));
    if (filtered.length && selectedIndex === -1) {
      selectedIndex = 0;
      updateSel();
    }
  }

  function renderInfo() {
    results.innerHTML = "";
    currentItems = [];
    const el = document.createElement("div");
    el.className = "cp-info-card";
    el.innerHTML = `
      <div class="cp-info-left">
        <div>
          <div>
            <span class="cp-info-title">Dash</span>
            <span class="cp-info-version">v1.2.0</span>
          </div>
          <div class="cp-info-sub">keyboard-first browser launcher</div>
        </div>
      </div>
      <div class="cp-info-links">
        <a class="cp-info-link" href="https://github.com/venomusblood568/dash" target="_blank">GitHub</a>
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

      if (parts.length === 1) {
        // Special case: /theme alone shows the full theme list
        if (cmdToken === "/theme") {
          renderThemeList();
          return;
        }
        const filtered = COMMANDS.filter((c) => c.cmd.startsWith(cmdToken));
        renderCommandSuggestions(filtered);
        return;
      }

      const matched = COMMANDS.find((c) => c.cmd === cmdToken);

      if (matched?.cmd === "/theme") {
        const partial = parts[1]?.toLowerCase() || "";
        renderThemeList(partial);
        return;
      }

      if (matched) {
        results.innerHTML = `<div class="cp-syntax-hint"><span class="cp-cmd-name">${esc(matched.cmd)}</span><span class="cp-cmd-syntax">${esc(matched.syntax)}</span></div>`;
      } else {
        results.innerHTML = `<div id="cp-no-match">unknown command</div>`;
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

    if (cmd === "/theme") {
      const name = parts[1]?.toLowerCase();
      if (!name) {
        renderThemeList();
        input.value = "";
        return;
      }
      if (!THEMES[name]) {
        renderThemeList();
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

    renderFeedback("unknown command", "error");
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
        } else {
          closePalette();
        }
        break;

      case "Enter": {
        e.preventDefault();
        const val = input.value.trim();
        if (!val) break;

        if (val.startsWith("/")) {
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
