importScripts('config.js');

// Helper functions
function getAllowedOrigins() {
  return EXTENSION_CONFIG.FRONTEND_URLS || [];
}

async function getBackendUrl() {
  return `${EXTENSION_CONFIG.API_URL}/api/activity`;
}

function isValidBackendUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
  initializeTracking();
});

// Tab tracking state
let activeTabs = new Map();
let activeTabId = null;
let isWindowFocused = true;
let updateInterval = null;

// Initialize tracking
function initializeTracking() {
  updateInterval = setInterval(updateActiveDurations, 30000);
  setInterval(checkForWebAppToken, 60000);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      handleTabActivated(tabs[0].id, tabs[0].url, tabs[0].title);
    }
  });
}

function generateSessionId(userId, tabId, url) {
  return `${userId || 'guest'}_${tabId}_${Date.now()}_${btoa(url).slice(0, 10)}`;
}

async function sendToBackend(activity) {
  try {
    const { token } = await chrome.storage.local.get(["token"]);

    if (!token) {
      console.log("No token available for backend communication");
      return { reason: "no_token" };
    }

    // Enhanced activity validation
    if (
      !activity ||
      typeof activity !== "object" ||
      !activity.sessionId ||
      !activity.action
    ) {
      console.warn("Skipping invalid activity (missing required fields):", activity);
      return { reason: "invalid_activity" };
    }

    // URL validation - only required for certain actions
    if (activity.action === 'start' || activity.action === 'visit') {
      if (!activity.url || typeof activity.url !== "string") {
        console.warn("Skipping activity with missing URL:", activity);
        return { reason: "missing_url" };
      }

      // Validate URL format
      try {
        new URL(activity.url);
        if (!activity.url.startsWith("http")) {
          console.warn("Skipping non-HTTP URL:", activity.url);
          return { reason: "invalid_url_protocol" };
        }
      } catch (urlError) {
        console.warn("Skipping activity with invalid URL:", activity.url);
        return { reason: "invalid_url_format" };
      }
    } else if (activity.action === 'update' || activity.action === 'end') {
      if (activity.url && typeof activity.url === "string") {
        try {
          new URL(activity.url);
          if (!activity.url.startsWith("http")) {
            console.warn("Invalid URL protocol for update/end action:", activity.url);
            delete activity.url;
          }
        } catch (urlError) {
          console.warn("Invalid URL format for update/end action:", activity.url);
          delete activity.url;
        }
      }
    }

    // Get secure backend URL
    const backendUrl = await getBackendUrl();
    
    // Validate backend URL security
    if (!isValidBackendUrl(backendUrl)) {
      console.error("Backend URL failed security validation:", backendUrl);
      return { reason: "invalid_backend_url" };
    }
    
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(activity),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn(`Backend returned ${response.status}:`, errorData);
      
      if (response.status === 401) {
        return { reason: "auth_failed" };
      }
      return { reason: "backend_error", status: response.status };
    }

    const result = await response.json();
    console.log("Activity sent to backend:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Network error:", error);
    return { reason: "network_error", error: error.message };
  }
}

async function startTabTracking(tabId, url, title) {
  if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return;
  }

  let domain = '';
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    console.warn('Invalid URL:', url);
    return;
  }

  const { token } = await chrome.storage.local.get(["token"]);
  const sessionId = generateSessionId(token ? 'user' : 'guest', tabId, url);
  const startTime = Date.now();

  const tabData = {
    url,
    domain,
    title,
    sessionId,
    startTime,
    lastUpdate: startTime,
    totalDuration: 0
  };

  activeTabs.set(tabId, tabData);

  if (token) {
    const activity = {
      tabId,
      url,
      sessionId,
      action: 'start',
      title,
      duration: 0
    };

    const result = await sendToBackend(activity);
    updateAuthStatus(result);
  }

  console.log(`Started tracking tab ${tabId}: ${domain}`);
}

async function updateTabDuration(tabId, additionalTime) {
  const tabData = activeTabs.get(tabId);
  if (!tabData || additionalTime <= 0) return;

  tabData.totalDuration += additionalTime;
  tabData.lastUpdate = Date.now();

  if (tabData.totalDuration > 0 && tabData.totalDuration % 60000 < 10000) {
    const { token } = await chrome.storage.local.get(["token"]);

    if (token) {
      const activity = {
        sessionId: tabData.sessionId,
        action: 'update',
        duration: tabData.totalDuration,
        url: tabData.url,
        domain: tabData.domain,
        title: tabData.title
      };

      const result = await sendToBackend(activity);
      if (result) {
        updateAuthStatus(result);
      }
    }
  }
}

async function endTabTracking(tabId, reason = 'close') {
  const tabData = activeTabs.get(tabId);
  if (!tabData) return;

  const endTime = Date.now();
  const finalDuration = tabData.totalDuration + (endTime - tabData.lastUpdate);

  const { token } = await chrome.storage.local.get(["token"]);
  if (token) {
    const activity = {
      sessionId: tabData.sessionId,
      action: 'end',
      endTime: new Date(endTime).toISOString(),
      duration: finalDuration,
      url: tabData.url,
      domain: tabData.domain,
      title: tabData.title
    };

    const result = await sendToBackend(activity);
    updateAuthStatus(result);
  }

  chrome.storage.local.get({ activityLog: [] }, (result) => {
    const logEntry = {
      ...tabData,
      endTime,
      finalDuration,
      reason
    };

    const updatedLog = [...result.activityLog.slice(-99), logEntry];
    chrome.storage.local.set({ activityLog: updatedLog });
  });

  activeTabs.delete(tabId);
  console.log(`Ended tracking tab ${tabId}: ${tabData.domain} (${Math.round(finalDuration / 1000)}s)`);
}

async function handleTabActivated(newTabId, url, title) {
  if (activeTabId && activeTabId !== newTabId) {
    await updateTabDuration(activeTabId, Date.now() - (activeTabs.get(activeTabId)?.lastUpdate || Date.now()));
  }

  activeTabId = newTabId;

  if (!activeTabs.has(newTabId) && url) {
    await startTabTracking(newTabId, url, title);
  } else if (activeTabs.has(newTabId)) {
    const tabData = activeTabs.get(newTabId);
    tabData.lastUpdate = Date.now();
  }
}

async function updateActiveDurations() {
  const now = Date.now();

  for (const [tabId, tabData] of activeTabs.entries()) {
    if (tabId === activeTabId && isWindowFocused) {
      const timeDiff = now - tabData.lastUpdate;
      await updateTabDuration(tabId, timeDiff);
    }
  }
}

function updateAuthStatus(result) {
  if (!result) return;
  
  if (result.reason === "auth_failed") {
    chrome.storage.local.set({ authStatus: 'failed' });
    console.log("Authentication failed - token may be invalid");
  } else if (result.reason === "no_token") {
    chrome.storage.local.set({ authStatus: 'no_token' });
    console.log("No authentication token found");
  } else if (result.reason === "network_error") {
    chrome.storage.local.set({ authStatus: 'network_error' });
    console.log("Network error when sending data");
  } else if (result.success) {
    chrome.storage.local.set({ authStatus: 'active' });
    console.log("Successfully sent data to backend");
  }
}

async function checkForWebAppToken() {
  try {
    const tabs = await chrome.tabs.query({});
    const webAppTab = tabs.find(tab => {
      if (!tab.url) return false;
      
      try {
        const tabUrl = new URL(tab.url);
        return EXTENSION_CONFIG.FRONTEND_URLS.some(allowedUrl => {
          const allowedUrlObj = new URL(allowedUrl);
          return tabUrl.hostname === allowedUrlObj.hostname && 
                 (tabUrl.port === allowedUrlObj.port || 
                  (!tabUrl.port && !allowedUrlObj.port));
        });
      } catch (error) {
        return false;
      }
    });

    if (webAppTab) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: webAppTab.id },
          func: () => localStorage.getItem('token')
        });

        const token = results[0]?.result;
        if (token) {
          const { token: currentToken } = await chrome.storage.local.get(['token']);

          if (token !== currentToken) {
            await chrome.storage.local.set({ 
              token: token,
              authStatus: 'active'
            });
            console.log("Token synced from web app");
          }
        }
      } catch (scriptError) {
        console.warn("Script injection failed:", scriptError);
      }
    }
  } catch (error) {
    console.error("Error checking for web app token:", error);
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await handleTabActivated(activeInfo.tabId, tab.url, tab.title);
  } catch (error) {
    console.error("Error on tab switch:", error);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    if (activeTabs.has(tabId)) {
      await endTabTracking(tabId, 'navigation');
    }

    if (tab.active) {
      await handleTabActivated(tabId, changeInfo.url, tab.title);
    }
  }
  if (changeInfo.title && activeTabs.has(tabId)) {
    activeTabs.get(tabId).title = changeInfo.title;
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await endTabTracking(tabId, 'close');
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    isWindowFocused = false;
    return;
  }

  isWindowFocused = true;

  try {
    const window = await chrome.windows.get(windowId, { populate: true });
    const activeTab = window.tabs.find((tab) => tab.active);

    if (activeTab) {
      await handleTabActivated(activeTab.id, activeTab.url, activeTab.title);
    }
  } catch (error) {
    console.error("Error on window focus:", error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background script received message:", message);

  switch (message.type) {
    case 'SET_TOKEN':
      console.log("Storing auth token");
      chrome.storage.local.set({
        token: message.token,
        authStatus: 'authenticated'
      }, () => {
        console.log("Token stored successfully");
        sendResponse({ success: true });
      });
      return true;

    case 'GET_AUTH_STATUS':
      chrome.storage.local.get(['token', 'authStatus'], (result) => {
        console.log("Auth status requested:", result);
        sendResponse({
          isAuthenticated: !!result.token,
          status: result.authStatus || 'unknown'
        });
      });
      return true;

    case 'CLEAR_AUTH':
      console.log("Clearing auth");
      endAllActiveSessions().then(() => {
        chrome.storage.local.remove(['token', 'authStatus'], () => {
          console.log("Authentication cleared");
          sendResponse({ success: true });
        });
      });
      return true;

    case 'GET_ACTIVITY_LOG':
      chrome.storage.local.get(['activityLog'], (result) => {
        const activities = result.activityLog || [];
        const currentTabs = Array.from(activeTabs.entries()).map(([tabId, data]) => ({
          ...data,
          tabId,
          isActive: true,
          currentDuration: data.totalDuration + (Date.now() - data.lastUpdate)
        }));

        sendResponse({
          activityLog: activities,
          activeTabs: currentTabs
        });
      });
      return true;

    case 'GET_ACTIVE_TABS':
      const currentTabs = Array.from(activeTabs.entries()).map(([tabId, data]) => ({
        ...data,
        tabId,
        currentDuration: data.totalDuration + (Date.now() - data.lastUpdate)
      }));
      sendResponse({ activeTabs: currentTabs });
      return true;

    case 'CLOSE_TAB':
      if (sender.tab?.id) {
        chrome.tabs.remove(sender.tab.id);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'No tab ID' });
      }
      return true;

    default:
      console.warn("Unknown message type:", message.type);
      sendResponse({ success: false, error: "Unknown message type" });
  }
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  const allowedOrigins = getAllowedOrigins();

  if (!allowedOrigins.includes(sender.origin)) {
    console.warn("Rejected message from unauthorized origin:", sender.origin);
    return;
  }

  if (message.type === 'AUTH_SUCCESS') {
    chrome.storage.local.set({
      token: message.token,
      authStatus: 'active'
    }, () => {
      console.log("Authentication success from web app");
      sendResponse({ success: true });
    });
    return true;
  }
});

async function endAllActiveSessions() {
  const promises = Array.from(activeTabs.keys()).map(tabId =>
    endTabTracking(tabId, 'logout')
  );
  await Promise.all(promises);
}

self.addEventListener('beforeunload', () => {
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  endAllActiveSessions();
});
