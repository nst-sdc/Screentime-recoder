console.log("📡 Background script is running...");

// Fires once when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Extension installed.");
});

let currentTabId = null;
let currentUrl = null;
let lastTimestamp = Date.now();

// Helper: Send activity data to backend
async function sendToBackend(activity) {
  try {
    const { token } = await chrome.storage.local.get(["token"]);

    if (!token) {
      console.warn("⛔ No token found. Skipping backend log.");
      return;
    }

    const response = await fetch("http://localhost:3000/api/activity/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(activity)
    });

    const result = await response.json();
    console.log("📡 Activity sent to backend:", result);
  } catch (error) {
    console.error("❌ Error sending activity to backend:", error);
  }
}

// Logs tab activity with timestamp + sends to backend
function logActivity(tabId, url) {
  const timestamp = new Date().toISOString();
  const duration = Date.now() - lastTimestamp;
  lastTimestamp = Date.now();

  const activity = { tabId, url, timestamp, duration };

  // Save to chrome storage (for debug/local use)
  chrome.storage.local.get({ activityLog: [] }, (result) => {
    const updatedLog = [...result.activityLog, activity];
    chrome.storage.local.set({ activityLog: updatedLog }, () => {
      console.log("📝 Logged locally:", activity);
    });
  });

  // Send to backend
  sendToBackend(activity);
}

// When user switches tabs
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

// When page updates or changes URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    currentTabId = tabId;
    currentUrl = changeInfo.url;
    logActivity(currentTabId, currentUrl);
  }
});

// When user switches Chrome windows
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
