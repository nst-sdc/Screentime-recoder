console.log("📡 Background script is running...");

// Fires once when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Extension installed.");
});

let currentTabId = null;
let currentUrl = null;

// Logs tab activity with timestamp
function logActivity(tabId, url) {
  const timestamp = new Date().toISOString();

  const activity = { tabId, url, timestamp };

  chrome.storage.local.get({ activityLog: [] }, (result) => {
    const updatedLog = [...result.activityLog, activity];
    chrome.storage.local.set({ activityLog: updatedLog }, () => {
      console.log("📝 Logged:", activity);
    });
  });
}

// Triggered when user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);

    if (tab.url && tab.url !== currentUrl) {
      currentTabId = activeInfo.tabId;
      currentUrl = tab.url;
      logActivity(currentTabId, currentUrl);
    }
  } catch (error) {
    console.error("⚠️ Error on tab switch:", error);
  }
});

// Triggered when tab content is updated (like navigating to a new page)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    currentTabId = tabId;
    currentUrl = changeInfo.url;
    logActivity(currentTabId, currentUrl);
  }
});

// Triggered when focus changes between Chrome windows
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;

  chrome.windows.get(windowId, { populate: true }, (window) => {
    const activeTab = window.tabs.find((tab) => tab.active);

    if (activeTab && activeTab.id !== currentTabId) {
      currentTabId = activeTab.id;
      currentUrl = activeTab.url;
      logActivity(currentTabId, currentUrl);
    }
  });
});
