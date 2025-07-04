console.log("📡 Enhanced Background script is running...");

chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ Extension installed.");
  initializeTracking();
});

// Tab tracking state
let activeTabs = new Map();
let activeTabId = null;
let isWindowFocused = true;
let updateInterval = null;

// Initialize tracking
function initializeTracking() {
  updateInterval = setInterval(updateActiveDurations, 10000);
  
  setInterval(checkForWebAppToken, 5000);
  
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
      console.warn("⛔ No token found. Skipping backend log.");
      return { success: false, reason: "no_token" };
    }

    // Use production backend URL - update this to match your actual Render URL
    const backendUrl = "https://screentime-recoder.onrender.com/api/activity/log";
    
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(activity)
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.warn("🔐 Token expired or invalid. Clearing stored token.");
        await chrome.storage.local.remove(["token"]);
        return { success: false, reason: "auth_failed" };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("📡 Activity sent to backend:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Error sending activity to backend:", error);
    return { success: false, reason: "network_error", error: error.message };
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

  console.log(`🟢 Started tracking tab ${tabId}: ${domain}`);
}

async function updateTabDuration(tabId, additionalTime) {
  const tabData = activeTabs.get(tabId);
  if (!tabData) return;

  tabData.totalDuration += additionalTime;
  tabData.lastUpdate = Date.now();

  if (tabData.totalDuration > 0 && tabData.totalDuration % 60000 < 10000) {
    const { token } = await chrome.storage.local.get(["token"]);
    
    if (token) {
      const activity = {
        sessionId: tabData.sessionId,
        action: 'update',
        duration: tabData.totalDuration
      };
      
      const result = await sendToBackend(activity);
      updateAuthStatus(result);
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
      duration: finalDuration
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
  console.log(`🔴 Ended tracking tab ${tabId}: ${tabData.domain} (${Math.round(finalDuration/1000)}s)`);
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
  if (result.reason === "auth_failed") {
    chrome.storage.local.set({ authStatus: 'failed' });
    console.log("🔐 Authentication failed - token may be invalid");
  } else if (result.reason === "no_token") {
    chrome.storage.local.set({ authStatus: 'no_token' });
    console.log("⚠️ No authentication token found");
  } else if (result.reason === "network_error") {
    chrome.storage.local.set({ authStatus: 'network_error' });
    console.log("🌐 Network error when sending data");
  } else if (result.success) {
    chrome.storage.local.set({ authStatus: 'active' });
    console.log("✅ Successfully sent data to backend");
  }
}

async function checkForWebAppToken() {
  try {
    const tabs = await chrome.tabs.query({});
    const webAppTab = tabs.find(tab => 
      tab.url && (
        tab.url.includes('screentime-recoder.vercel.app') ||
        tab.url.includes('localhost:5173') || 
        tab.url.includes('localhost:3000')
      )
    );

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
            console.log("🔐 Token synced from web app");
          }
        }
      } catch (scriptError) {
        console.warn("⚠️ Script injection failed:", scriptError);
      }
    }
  } catch (error) {
    console.error("❌ Error checking for web app token:", error);
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    await handleTabActivated(activeInfo.tabId, tab.url, tab.title);
  } catch (error) {
    console.error("⚠️ Error on tab switch:", error);
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
    console.error("⚠️ Error on window focus:", error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📨 Received message:", message);

  switch (message.type) {
    case 'SET_TOKEN':
      chrome.storage.local.set({ 
        token: message.token,
        authStatus: 'active'
      }, () => {
        console.log("🔐 Token stored successfully");
        sendResponse({ success: true });
      });
      return true;

    case 'GET_AUTH_STATUS':
      chrome.storage.local.get(['token', 'authStatus'], (result) => {
        sendResponse({ 
          isAuthenticated: !!result.token,
          status: result.authStatus || 'unknown'
        });
      });
      return true;

    case 'CLEAR_AUTH':
      endAllActiveSessions().then(() => {
        chrome.storage.local.remove(['token', 'authStatus'], () => {
          console.log("🚪 Authentication cleared");
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

    default:
      console.warn("Unknown message type:", message.type);
      sendResponse({ success: false, error: "Unknown message type" });
  }
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'https://screentime-recoder.vercel.app',
    'https://screentime-recoder.onrender.com'
  ];

  if (!allowedOrigins.includes(sender.origin)) {
    console.warn("🚫 Rejected message from unauthorized origin:", sender.origin);
    return;
  }

  if (message.type === 'AUTH_SUCCESS') {
    chrome.storage.local.set({ 
      token: message.token,
      authStatus: 'active'
    }, () => {
      console.log("🎉 Authentication success from web app");
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
