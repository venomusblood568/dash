// background.js
// Two responsibilities:
// 1. Keyboard shortcut → toggle palette on active tab
// 2. open-url message → open URL in new tab

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-palette") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab.id, { action: "toggle-palette" }).catch(() => {});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "open-url" && message.url) {
    chrome.tabs.create({ url: message.url });
    sendResponse({ ok: true });
  }
});
