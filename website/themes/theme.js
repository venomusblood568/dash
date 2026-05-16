/**
 * themes.js — Single source of truth for Dash themes
 *
 * Used by BOTH the website (generates CSS vars on [data-theme])
 * and the extension overlay (injects vars into shadow DOM modal).
 *
 * ─── How to use ───────────────────────────────────────────────
 *
 * WEBSITE  (script.js)
 *   import { applyThemeToElement } from './themes.js';
 *   applyThemeToElement(document.documentElement, 'void');
 *   // or call generateThemeCSS() once and write it to themes.css
 *
 * EXTENSION  (overlay.js)
 *   import { applyThemeToElement, THEMES } from './themes.js';
 *   applyThemeToElement(modal, 'default');
 *
 * ─── Variable mapping ─────────────────────────────────────────
 *
 * Website vars   →  Extension vars (both resolved from the same token)
 * --bg              --cp-bg
 * --bg2             --cp-bg-deep
 * --bg3             --cp-bg          (modal surface)
 * --bg4             --cp-bg-item
 * --border          --cp-border-sub
 * --border-md       --cp-border
 * --text            --cp-text
 * --text2           --cp-text-muted
 * --text3           --cp-text-dim
 * --accent          --cp-accent
 * --accent-dim      --cp-pill-bg (approximated)
 * --accent-bright   --cp-accent-2
 * --green           --cp-accent-3
 * --cursor          --cp-caret
 * --kbd-bg          --cp-pill-bg
 * --kbd-bdr         --cp-pill-border
 * --shadow          (website only — not needed in shadow DOM)
 * --scan            (website only — scanline texture)
 */

// ─── THEME DEFINITIONS ────────────────────────────────────────
// Each theme is one object. Keys are the canonical design tokens.
// generateThemeCSS() maps them to website CSS vars.
// applyThemeToElement() maps them to extension CP vars.

export const THEMES = {
  // ── Dark themes ──────────────────────────────────────────────

  void: {
    bg: "#0d0d0f",
    bgDeep: "#0a0a0b",
    bgSurface: "#121214",
    bgItem: "#18181b",
    bgRaised: "#222227",
    border: "rgba(255,255,255,0.07)",
    borderMd: "rgba(255,255,255,0.13)",
    text: "#f0f0f0",
    textMuted: "#888894",
    textDim: "#444452",
    textGhost: "#2e2e36",
    accent: "#6c63ff",
    accentDim: "rgba(108,99,255,0.14)",
    accentBright: "#8b85ff",
    accentAlt: "#3ddcac",
    cursor: "#6c63ff",
    kbdBg: "#1e1e22",
    kbdBorder: "rgba(255,255,255,0.13)",
    shadow: "rgba(0,0,0,0.45)",
    scan: "rgba(108,99,255,0.03)",
    pillBg: "rgba(108,99,255,0.14)",
    pillBorder: "rgba(108,99,255,0.28)",
  },

  night: {
    bg: "#0d1117",
    bgDeep: "#090d12",
    bgSurface: "#12181f",
    bgItem: "#171e27",
    bgRaised: "#1e2733",
    border: "rgba(255,255,255,0.07)",
    borderMd: "rgba(255,255,255,0.12)",
    text: "#e8edf3",
    textMuted: "#6e8099",
    textDim: "#374559",
    textGhost: "#1c2733",
    accent: "#58a6ff",
    accentDim: "rgba(88,166,255,0.12)",
    accentBright: "#79b8ff",
    accentAlt: "#3ddcac",
    cursor: "#58a6ff",
    kbdBg: "#1c2733",
    kbdBorder: "rgba(255,255,255,0.10)",
    shadow: "rgba(0,0,0,0.50)",
    scan: "rgba(88,166,255,0.02)",
    pillBg: "rgba(88,166,255,0.12)",
    pillBorder: "rgba(88,166,255,0.25)",
  },

  ocean: {
    bg: "#050e1a",
    bgDeep: "#030710",
    bgSurface: "#060c18",
    bgItem: "#0e1c2e",
    bgRaised: "#14253c",
    border: "rgba(100,180,255,0.08)",
    borderMd: "rgba(100,180,255,0.15)",
    text: "#d0e8ff",
    textMuted: "#4d7a9e",
    textDim: "#1e3a54",
    textGhost: "#0e2540",
    accent: "#00b4d8",
    accentDim: "rgba(0,180,216,0.12)",
    accentBright: "#48cae4",
    accentAlt: "#80ccff",
    cursor: "#00b4d8",
    kbdBg: "#0e1c2e",
    kbdBorder: "rgba(100,180,255,0.12)",
    shadow: "rgba(0,10,30,0.60)",
    scan: "rgba(0,180,216,0.02)",
    pillBg: "rgba(0,180,216,0.12)",
    pillBorder: "rgba(0,180,216,0.25)",
  },

  amber: {
    bg: "#110e00",
    bgDeep: "#090500",
    bgSurface: "#181300",
    bgItem: "#1f1800",
    bgRaised: "#2a2000",
    border: "rgba(255,195,0,0.07)",
    borderMd: "rgba(255,195,0,0.13)",
    text: "#ffd060",
    textMuted: "#7a5e10",
    textDim: "#3a2c05",
    textGhost: "#1e1400",
    accent: "#f59e0b",
    accentDim: "rgba(245,158,11,0.13)",
    accentBright: "#fbbf24",
    accentAlt: "#ff9060",
    cursor: "#f59e0b",
    kbdBg: "#1f1800",
    kbdBorder: "rgba(255,195,0,0.13)",
    shadow: "rgba(0,0,0,0.50)",
    scan: "rgba(245,158,11,0.02)",
    pillBg: "rgba(245,158,11,0.13)",
    pillBorder: "rgba(245,158,11,0.28)",
  },

  forest: {
    bg: "#030f06",
    bgDeep: "#020a04",
    bgSurface: "#071409",
    bgItem: "#0a1a0c",
    bgRaised: "#122212",
    border: "rgba(80,200,100,0.07)",
    borderMd: "rgba(80,200,100,0.13)",
    text: "#c8f0cc",
    textMuted: "#3d7a46",
    textDim: "#1a3a1c",
    textGhost: "#0c1e0e",
    accent: "#22c55e",
    accentDim: "rgba(34,197,94,0.12)",
    accentBright: "#4ade80",
    accentAlt: "#a0ffd8",
    cursor: "#22c55e",
    kbdBg: "#0a1a0c",
    kbdBorder: "rgba(80,200,100,0.12)",
    shadow: "rgba(0,0,0,0.50)",
    scan: "rgba(34,197,94,0.02)",
    pillBg: "rgba(34,197,94,0.12)",
    pillBorder: "rgba(34,197,94,0.25)",
  },

  plum: {
    bg: "#0c0010",
    bgDeep: "#070009",
    bgSurface: "#110016",
    bgItem: "#16001e",
    bgRaised: "#1e0028",
    border: "rgba(200,100,255,0.07)",
    borderMd: "rgba(200,100,255,0.13)",
    text: "#e8ccff",
    textMuted: "#6a3a8a",
    textDim: "#2e1040",
    textGhost: "#180824",
    accent: "#c084fc",
    accentDim: "rgba(192,132,252,0.13)",
    accentBright: "#d8b4fe",
    accentAlt: "#ff6fff",
    cursor: "#c084fc",
    kbdBg: "#16001e",
    kbdBorder: "rgba(200,100,255,0.12)",
    shadow: "rgba(0,0,0,0.55)",
    scan: "rgba(192,132,252,0.02)",
    pillBg: "rgba(192,132,252,0.13)",
    pillBorder: "rgba(192,132,252,0.28)",
  },

  monochrome: {
    bg: "#080808",
    bgDeep: "#050505",
    bgSurface: "#0c0c0c",
    bgItem: "#111111",
    bgRaised: "#161616",
    border: "rgba(255,255,255,0.06)",
    borderMd: "rgba(255,255,255,0.12)",
    text: "#f0f0f0",
    textMuted: "#909090",
    textDim: "#2e2e2e",
    textGhost: "#1a1a1a",
    accent: "#ffffff",
    accentDim: "rgba(255,255,255,0.08)",
    accentBright: "#aaaaaa",
    accentAlt: "#686868",
    cursor: "#ffffff",
    kbdBg: "#161616",
    kbdBorder: "rgba(255,255,255,0.10)",
    shadow: "rgba(0,0,0,0.60)",
    scan: "rgba(255,255,255,0.01)",
    pillBg: "rgba(255,255,255,0.08)",
    pillBorder: "rgba(255,255,255,0.18)",
  },

  toxic: {
    bg: "#060e0c",
    bgDeep: "#040a07",
    bgSurface: "#091410",
    bgItem: "#0c1a14",
    bgRaised: "#112018",
    border: "rgba(0,255,136,0.07)",
    borderMd: "rgba(0,255,136,0.14)",
    text: "#f0fff8",
    textMuted: "#3d9970",
    textDim: "#1a4030",
    textGhost: "#0e2a20",
    accent: "#00ff88",
    accentDim: "rgba(0,255,136,0.12)",
    accentBright: "#00d4ff",
    accentAlt: "#a0ffd8",
    cursor: "#00ff88",
    kbdBg: "#0c2018",
    kbdBorder: "rgba(0,255,136,0.14)",
    shadow: "rgba(0,0,0,0.55)",
    scan: "rgba(0,255,136,0.02)",
    pillBg: "rgba(0,255,136,0.12)",
    pillBorder: "rgba(0,255,136,0.25)",
  },

  rose: {
    bg: "#0e060c",
    bgDeep: "#090408",
    bgSurface: "#120710",
    bgItem: "#180b16",
    bgRaised: "#200e1c",
    border: "rgba(255,45,120,0.07)",
    borderMd: "rgba(255,45,120,0.14)",
    text: "#fff0f8",
    textMuted: "#c060a0",
    textDim: "#3a1830",
    textGhost: "#220e1c",
    accent: "#ff2d78",
    accentDim: "rgba(255,45,120,0.13)",
    accentBright: "#cc00ff",
    accentAlt: "#ff90c0",
    cursor: "#ff2d78",
    kbdBg: "#1e0e18",
    kbdBorder: "rgba(255,45,120,0.14)",
    shadow: "rgba(0,0,0,0.55)",
    scan: "rgba(255,45,120,0.02)",
    pillBg: "rgba(255,45,120,0.13)",
    pillBorder: "rgba(255,45,120,0.28)",
  },

  // ── Light themes ─────────────────────────────────────────────

  paper: {
    bg: "#fafaf8",
    bgDeep: "#f8f8f6",
    bgSurface: "#f4f4f1",
    bgItem: "#ebebeb",
    bgRaised: "#e0e0db",
    border: "rgba(0,0,0,0.07)",
    borderMd: "rgba(0,0,0,0.13)",
    text: "#111111",
    textMuted: "#5a5a68",
    textDim: "#aaaaae",
    textGhost: "#d0d0d4",
    accent: "#4338ca",
    accentDim: "rgba(67,56,202,0.08)",
    accentBright: "#3730a3",
    accentAlt: "#6fb3ff",
    cursor: "#4338ca",
    kbdBg: "#e8e8e4",
    kbdBorder: "rgba(0,0,0,0.13)",
    shadow: "rgba(0,0,0,0.08)",
    scan: "rgba(0,0,0,0.00)",
    pillBg: "rgba(67,56,202,0.08)",
    pillBorder: "rgba(67,56,202,0.20)",
  },

  chalk: {
    bg: "#fefefe",
    bgDeep: "#fafafa",
    bgSurface: "#f8f8f7",
    bgItem: "#f0f0ee",
    bgRaised: "#e6e6e3",
    border: "rgba(0,0,0,0.06)",
    borderMd: "rgba(0,0,0,0.11)",
    text: "#1a1a1a",
    textMuted: "#666668",
    textDim: "#b0b0b4",
    textGhost: "#d8d8dc",
    accent: "#e11d48",
    accentDim: "rgba(225,29,72,0.08)",
    accentBright: "#f43f5e",
    accentAlt: "#ff90c0",
    cursor: "#e11d48",
    kbdBg: "#e8e8e5",
    kbdBorder: "rgba(0,0,0,0.12)",
    shadow: "rgba(0,0,0,0.07)",
    scan: "rgba(0,0,0,0.00)",
    pillBg: "rgba(225,29,72,0.08)",
    pillBorder: "rgba(225,29,72,0.20)",
  },
};

// ─── DEFAULT / ALIAS ─────────────────────────────────────────
// The extension's old "default" theme maps to "void"
THEMES["default"] = THEMES.void;

// Ordered list for UI pickers and cycling
export const THEME_ORDER = [
  "void",
  "night",
  "ocean",
  "amber",
  "forest",
  "plum",
  "monochrome",
  "toxic",
  "rose",
  "paper",
  "chalk",
];

// ─── WEBSITE: apply via CSS custom properties on an element ──
/**
 * applyThemeToWebsite(themeName)
 * Sets all --var names on <html> that style.css already references.
 * Call this instead of setAttribute('data-theme', ...) if you want
 * JS-only theme switching, OR keep using data-theme + themes.css below.
 */
export function applyThemeToWebsite(themeName) {
  const t = THEMES[themeName] || THEMES.void;
  const root = document.documentElement;
  root.setAttribute("data-theme", themeName);

  const map = websiteVarMap(t);
  for (const [k, v] of Object.entries(map)) {
    root.style.setProperty(k, v);
  }
}

function websiteVarMap(t) {
  return {
    "--bg": t.bg,
    "--bg2": t.bgSurface,
    "--bg3": t.bgItem,
    "--bg4": t.bgRaised,
    "--border": t.border,
    "--border-md": t.borderMd,
    "--text": t.text,
    "--text2": t.textMuted,
    "--text3": t.textDim,
    "--accent": t.accent,
    "--accent-dim": t.accentDim,
    "--accent-bright": t.accentBright,
    "--green": t.accentAlt,
    "--kbd-bg": t.kbdBg,
    "--kbd-bdr": t.kbdBorder,
    "--cursor": t.cursor,
    "--shadow": t.shadow,
    "--scan": t.scan,
  };
}

// ─── EXTENSION: apply vars into a shadow DOM element ─────────
/**
 * applyThemeToExtension(modalElement, themeName)
 * Injects all --cp-* vars that overlay.css references
 * directly onto the shadow modal element.
 */
export function applyThemeToExtension(element, themeName) {
  const t = THEMES[themeName] || THEMES.void;
  const map = extensionVarMap(t);
  for (const [k, v] of Object.entries(map)) {
    element.style.setProperty(k, v);
  }
}

function extensionVarMap(t) {
  return {
    "--cp-bg": t.bgItem, // modal surface
    "--cp-bg-deep": t.bgDeep,
    "--cp-bg-item": t.bgRaised, // hover rows
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

// ─── CSS GENERATOR (run once to write themes.css) ────────────
/**
 * generateThemeCSS()
 * Returns the full CSS string for all themes.
 * Run this in Node.js and pipe to themes.css:
 *
 *   node -e "import('./themes.js').then(m => process.stdout.write(m.generateThemeCSS()))" > themes.css
 *
 * Then in your HTML: <link rel="stylesheet" href="themes.css">
 */
export function generateThemeCSS() {
  const lines = [
    "/* AUTO-GENERATED — do not edit. Edit themes.js instead. */",
    "/* Run: node -e \"import('./themes.js').then(m=>process.stdout.write(m.generateThemeCSS()))\" > themes.css */",
    "",
  ];

  for (const [name, t] of Object.entries(THEMES)) {
    if (name === "default") continue; // skip alias
    const selector =
      name === "void" ? ':root, [data-theme="void"]' : `[data-theme="${name}"]`;
    const vars = websiteVarMap(t);
    lines.push(`${selector} {`);
    for (const [k, v] of Object.entries(vars)) {
      lines.push(`  ${k}: ${v};`);
    }
    lines.push("}");
    lines.push("");
  }

  return lines.join("\n");
}

// ─── CONVENIENCE: get raw token object ───────────────────────
export function getTheme(name) {
  return THEMES[name] || THEMES.void;
}
