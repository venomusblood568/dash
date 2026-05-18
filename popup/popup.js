// Show Win shortcut on non-Mac
const isMac = navigator.platform.toUpperCase().includes("MAC");
if (!isMac) {
  document.getElementById("keys").innerHTML = `
    <span class="key">Ctrl</span>
    <span class="key">⇧</span>
    <span class="key">Space</span>
  `;
}

// Open now button — sends toggle message to active tab then closes popup
document.getElementById("btn-open").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs
      .sendMessage(tab.id, { action: "toggle-palette" })
      .catch(() => {});
  }
  window.close();
});
