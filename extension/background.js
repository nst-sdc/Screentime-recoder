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

    // Reminder management messages
    case 'GET_REMINDERS':
      chrome.storage.local.get({ reminders: [] }, (result) => {
        sendResponse({ reminders: result.reminders || [] });
      });
      return true;

    case 'CREATE_REMINDER':
      (async () => {
        try {
          const rem = message.reminder;
          if (!rem || !rem.intervalMin) {
            sendResponse({ success: false, error: 'invalid_reminder' });
            return;
          }

          const id = `r_${Date.now()}`;
          const newRem = Object.assign({
            id,
            label: rem.label || 'Reminder',
            intervalMin: Number(rem.intervalMin) || 25,
            enabled: rem.enabled === undefined ? true : !!rem.enabled,
            nextTrigger: Date.now() + (Number(rem.intervalMin) || 25) * 60000
          }, rem);

          const { reminders = [] } = await new Promise((resolve) =>
            chrome.storage.local.get({ reminders: [] }, resolve)
          );

          const updated = [newRem, ...reminders];
          chrome.storage.local.set({ reminders: updated }, () => {
            scheduleReminder(newRem);
            // play a short confirmation sound so user knows reminder is set
            try {
              playReminderSound(600);
            } catch (e) {
              console.warn('Could not play confirmation sound', e);
            }
            try {
              chrome.notifications.create(`reminder_created_${id}`, {
                type: 'basic',
                title: 'Reminder set',
                message: `Will remind every ${newRem.intervalMin} minute(s): ${newRem.label}`
              }, () => {});
            } catch (nerr) {
              console.warn('Could not create creation notification', nerr);
            }
            sendResponse({ success: true, reminder: newRem });
          });
        } catch (err) {
          console.error('CREATE_REMINDER error', err);
          sendResponse({ success: false, error: err && err.message });
        }
      })();
      return true;

    case 'DELETE_REMINDER':
      (async () => {
        try {
          const id = message.id;
          const { reminders = [] } = await new Promise((resolve) =>
            chrome.storage.local.get({ reminders: [] }, resolve)
          );
          const updated = reminders.filter(r => r.id !== id);
          chrome.storage.local.set({ reminders: updated }, () => {
            chrome.alarms.clear(`reminder_${id}`);
            // close any open popup window for this reminder
            try { closeReminderWindow(id); } catch (e) {}
            sendResponse({ success: true });
          });
        } catch (err) {
          sendResponse({ success: false, error: err && err.message });
        }
      })();
      return true;

    case 'TOGGLE_REMINDER':
      (async () => {
        try {
          const id = message.id;
          const { reminders = [] } = await new Promise((resolve) =>
            chrome.storage.local.get({ reminders: [] }, resolve)
          );
          const updated = reminders.map(r => {
            if (r.id === id) {
              const newR = Object.assign({}, r, { enabled: !!message.enabled });
              if (newR.enabled) {
                newR.nextTrigger = Date.now() + (newR.intervalMin || 25) * 60000;
                scheduleReminder(newR);
                try { closeReminderWindow(id); } catch (e) {}
              } else {
                chrome.alarms.clear(`reminder_${id}`);
                try { closeReminderWindow(id); } catch (e) {}
              }
              return newR;
            }
            return r;
          });
          chrome.storage.local.set({ reminders: updated }, () => sendResponse({ success: true }));
        } catch (err) {
          sendResponse({ success: false, error: err && err.message });
        }
      })();
      return true;

    case 'DISMISS_REMINDER':
      try {
        const id = message.id;
        try { chrome.action.setBadgeText({ text: '' }); } catch (e) {}
        try { closeReminderWindow(id); } catch (e) {}
        sendResponse({ success: true });
      } catch (e) {
        sendResponse({ success: false, error: e && e.message });
      }
      return true;

    case 'SNOOZE_REMINDER':
      (async () => {
        try {
          const id = message.id;
          const mins = Number(message.minutes) || 5;
          const { reminders = [] } = await new Promise((resolve) => chrome.storage.local.get({ reminders: [] }, resolve));
          const updated = reminders.map(r => {
            if (r.id === id) {
              const nr = Object.assign({}, r, { nextTrigger: Date.now() + mins * 60000 });
              scheduleReminder(nr);
              return nr;
            }
            return r;
          });
          chrome.storage.local.set({ reminders: updated }, () => {
            try { closeReminderWindow(id); } catch (e) {}
            sendResponse({ success: true });
          });
        } catch (err) {
          sendResponse({ success: false, error: err && err.message });
        }
      })();
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

// ---------------- Reminders scheduling and notifications ----------------

// Offscreen audio helpers
async function ensureOffscreenDocument() {
  try {
    if (!chrome.offscreen || !chrome.offscreen.hasDocument) return false;
    const has = await chrome.offscreen.hasDocument();
    if (!has) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Play reminder sounds for user notifications.'
      });
    }
    return true;
  } catch (err) {
    console.warn('Offscreen document not available:', err);
    return false;
  }
}

async function playReminderSound(durationMs = 1200) {
  try {
    const hasOffscreen = await ensureOffscreenDocument();
    if (hasOffscreen) {
      chrome.runtime.sendMessage({ type: 'PLAY_SOUND', duration: durationMs });
      // schedule close after audio should have finished
      setTimeout(() => {
        try {
          if (chrome.offscreen && chrome.offscreen.hasDocument) {
            chrome.offscreen.hasDocument().then((has) => {
              if (has && chrome.offscreen.closeDocument) {
                chrome.offscreen.closeDocument();
              }
            }).catch(() => {});
          }
        } catch (e) {
          // ignore
        }
      }, durationMs + 500);
    } else {
      // Fallback: create a short notification so the user sees something
      try {
        chrome.notifications.create(`notif_fallback_${Date.now()}`, {
          type: 'basic',
          title: 'Reminder',
          message: 'Reminder — check focus',
        }, () => {});
      } catch (e) {
        console.warn('Fallback notification failed', e);
      }
    }
  } catch (err) {
    console.error('playReminderSound error', err);
  }
}

// Map to track popup windows opened for reminders
const reminderWindows = new Map();

function openReminderWindow(reminder) {
  try {
    // If a window for this reminder already exists, focus it
    if (reminderWindows.has(reminder.id)) {
      const existingId = reminderWindows.get(reminder.id);
      try { chrome.windows.update(existingId, { focused: true }); } catch (e) {}
      return;
    }

    const url = chrome.runtime.getURL(`reminder_popup.html?id=${encodeURIComponent(reminder.id)}&label=${encodeURIComponent(reminder.label)}`);
    chrome.windows.create({ url, type: 'popup', focused: true, width: 360, height: 220 }, (win) => {
      if (win && win.id) {
        reminderWindows.set(reminder.id, win.id);
      }
    });
  } catch (err) {
    console.warn('openReminderWindow failed', err);
  }
}

function closeReminderWindow(reminderId) {
  try {
    const winId = reminderWindows.get(reminderId);
    if (winId) {
      chrome.windows.remove(winId, () => {
        // ignore errors
      });
      reminderWindows.delete(reminderId);
    }
  } catch (err) {
    // ignore
  }
}

function scheduleReminder(reminder) {
  if (!reminder || !reminder.id) return;
  if (!reminder.enabled) {
    chrome.alarms.clear(`reminder_${reminder.id}`);
    return;
  }

  const now = Date.now();
  let delayMin = 0;
  if (reminder.nextTrigger && Number(reminder.nextTrigger) > now) {
    delayMin = Math.max(0.1, (Number(reminder.nextTrigger) - now) / 60000);
  } else {
    delayMin = Math.max(0.1, Number(reminder.intervalMin) || 25);
  }

  try {
    chrome.alarms.create(`reminder_${reminder.id}`, {
      delayInMinutes: delayMin,
      periodInMinutes: Number(reminder.intervalMin) || 25
    });
    console.log(`Scheduled reminder ${reminder.id} in ${delayMin}m repeating ${reminder.intervalMin}m`);
    try { chrome.notifications.create(`reminder_scheduled_${reminder.id}`, { type: 'basic', title: 'Reminder scheduled', message: `${reminder.label} every ${reminder.intervalMin}m` }, () => {}); } catch(e){}
  } catch (err) {
    console.error('Failed to schedule alarm', err);
  }
}

async function loadAndScheduleAllReminders() {
  chrome.storage.local.get({ reminders: [] }, (result) => {
    const reminders = result.reminders || [];
    reminders.forEach(r => {
      if (r.enabled) scheduleReminder(r);
    });
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm fired:', alarm && alarm.name);
  try {
    if (!alarm || !alarm.name) return;
    if (alarm.name.startsWith('reminder_')) {
      const id = alarm.name.replace('reminder_', '');
      chrome.storage.local.get({ reminders: [] }, (result) => {
        const rem = (result.reminders || []).find(r => r.id === id);
        if (!rem) return;

        // Create notification
        const title = rem.label || 'Study Reminder';
        const message = `Time for: ${rem.label || 'break/work'} — next in ${rem.intervalMin} minutes`;
        const options = {
          type: 'basic',
          title,
          message,
          requireInteraction: true,
          silent: false
        };

        try {
          const notifId = `notif_${id}_${Date.now()}`;
          chrome.notifications.create(notifId, options, () => {});
          // set a visible badge on the extension icon to draw attention
          try { chrome.action.setBadgeText({ text: '!' }); chrome.action.setBadgeBackgroundColor({ color: '#dc2626' }); } catch (e) {}
        } catch (nerr) {
          console.warn('Notification error', nerr);
        }

        // Open a visible popup window (strong attention) and play sound there
        try {
          openReminderWindow(rem);
        } catch (e) {
          console.warn('Could not open reminder window', e);
        }

        // Play reminder sound (attempt offscreen WebAudio)
        try {
          playReminderSound(1400);
        } catch (e) {
          console.warn('Could not play reminder sound', e);
        }

        // Update nextTrigger in storage
        const updated = (result.reminders || []).map(r => {
          if (r.id === id) {
            return Object.assign({}, r, { nextTrigger: Date.now() + (Number(r.intervalMin) || 25) * 60000 });
          }
          return r;
        });
        chrome.storage.local.set({ reminders: updated });
      });
    }
  } catch (err) {
    console.error('Alarm handler error', err);
  }
});

// Clear badge when notification clicked or cleared
chrome.notifications.onClicked.addListener((notificationId) => {
  try { chrome.action.setBadgeText({ text: '' }); } catch (e) {}
  // Close any reminder windows and focus active tab
  try {
    for (const [rid, winId] of reminderWindows.entries()) {
      try { chrome.windows.remove(winId); } catch (e) {}
      reminderWindows.delete(rid);
    }
  } catch (e) {}
  // optionally focus the active tab so user sees something
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0] && tabs[0].id) {
      try { chrome.windows.update(tabs[0].windowId, { focused: true }); } catch (e) {}
      try { chrome.tabs.update(tabs[0].id, { active: true }); } catch (e) {}
    }
  });
});

chrome.notifications.onClosed.addListener((notificationId, byUser) => {
  try { chrome.action.setBadgeText({ text: '' }); } catch (e) {}
});

// Clean up reminderWindows map if a window is removed directly
chrome.windows.onRemoved.addListener((windowId) => {
  try {
    for (const [rid, winId] of reminderWindows.entries()) {
      if (winId === windowId) {
        reminderWindows.delete(rid);
      }
    }
  } catch (e) {
    // ignore
  }
});

// Ensure reminders are scheduled on startup/installed
chrome.runtime.onInstalled.addListener(() => {
  loadAndScheduleAllReminders();
});

// Also attempt to schedule when service worker starts
loadAndScheduleAllReminders();

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
