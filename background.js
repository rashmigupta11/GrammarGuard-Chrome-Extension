chrome.runtime.onInstalled.addListener(() => {
  console.log("GrammarGuard Installed");
  chrome.storage.local.set({ enabled: true });
});