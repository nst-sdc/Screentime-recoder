let statusDot, statusText, statusInfo, loginSection, loggedInSection, loginBtn, logoutBtn;

document.addEventListener("DOMContentLoaded", () => {
  statusDot = document.getElementById("statusDot");
  statusText = document.getElementById("statusText");
  statusInfo = document.getElementById("statusInfo");
  loginSection = document.getElementById("loginSection");
  loggedInSection = document.getElementById("loggedInSection");
  loginBtn = document.getElementById("loginBtn");
  logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      chrome.tabs.create({
        url: "http://localhost:5173/login",
      });
      chrome.tabs.create({ url: "https://screentime-recoder.vercel.app/login" });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await chrome.runtime.sendMessage({ type: "CLEAR_AUTH" });
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          if (tabs[0]?.id) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: () => {
                localStorage.removeItem("token");
                window.location.href = "http://localhost:5173/dashboard";
              },
            });
          }
        });

        checkAuthStatus();
      } catch (error) {
        // Silent fail for logout errors
      }
    });
  }

  checkAuthStatus();

  const activeTabsBtn = document.getElementById("activeTabsBtn");
  const activeTabsInfo = document.getElementById("activeTabsInfo");

  if (activeTabsBtn && activeTabsInfo) {
    activeTabsBtn.addEventListener("click", async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          type: "GET_ACTIVE_TABS",
        });
        const activeTabs = response.activeTabs || [];

        if (activeTabs.length === 0) {
          activeTabsInfo.innerHTML =
            '<div style="color: #2563eb;">No active tabs being tracked</div>';
        } else {
          const html = activeTabs
            .map(
              (tab) => `
            <div class="activity-item">
              <div class="domain">${tab.domain}</div>
              <div class="duration">${Math.round(
                tab.currentDuration / 1000
              )}s active</div>
              <div class="title">${tab.title || "No title"}</div>
            </div>
          `
            )
            .join("");
          activeTabsInfo.innerHTML = html;
        }

        activeTabsInfo.classList.toggle("hidden");
      } catch (error) {
        activeTabsInfo.innerHTML =
          '<div style="color: #dc2626;">Error loading active tabs</div>';
        activeTabsInfo.classList.remove("hidden");
      }
    });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && (changes.token || changes.authStatus)) {
      checkAuthStatus();
    }
  });
  
  // Reminders UI bindings
  const remLabel = document.getElementById('remLabel');
  const remInterval = document.getElementById('remInterval');
  const addReminderBtn = document.getElementById('addReminderBtn');
  const remindersList = document.getElementById('remindersList');

  if (addReminderBtn) {
    addReminderBtn.addEventListener('click', async () => {
      const label = remLabel.value.trim() || 'Focus Reminder';
      const interval = Number(remInterval.value) || 25;
      addReminderBtn.disabled = true;
      try {
        const res = await chrome.runtime.sendMessage({ type: 'CREATE_REMINDER', reminder: { label, intervalMin: interval, enabled: true } });
        if (res && res.success) {
          remLabel.value = '';
          remInterval.value = '25';
          loadReminders();
        } else {
          console.warn('Failed to create reminder', res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        addReminderBtn.disabled = false;
      }
    });
  }

  async function loadReminders() {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'GET_REMINDERS' });
      const reminders = (res && res.reminders) || [];
      if (!reminders || reminders.length === 0) {
        remindersList.innerHTML = '<div>No reminders yet</div>';
        return;
      }

      remindersList.innerHTML = reminders.map(r => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #e5e7eb;">
          <div style="flex:1">
            <div class="text-bold">${escapeHtml(r.label)}</div>
            <div class="text-small">Every ${r.intervalMin} minutes</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            <input type="checkbox" data-id="${r.id}" ${r.enabled ? 'checked' : ''} class="rem-toggle" />
            <button data-id="${r.id}" class="btn btn-small btn-danger rem-delete">Delete</button>
          </div>
        </div>
      `).join('');

      // Bind toggles and deletes
      Array.from(document.getElementsByClassName('rem-toggle')).forEach(el => {
        el.addEventListener('change', async (e) => {
          const id = e.target.getAttribute('data-id');
          const enabled = e.target.checked;
          await chrome.runtime.sendMessage({ type: 'TOGGLE_REMINDER', id, enabled });
        });
      });

      Array.from(document.getElementsByClassName('rem-delete')).forEach(el => {
        el.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          if (!confirm('Delete this reminder?')) return;
          await chrome.runtime.sendMessage({ type: 'DELETE_REMINDER', id });
          loadReminders();
        });
      });

    } catch (err) {
      console.error('Failed to load reminders', err);
      remindersList.innerHTML = '<div style="color:#dc2626;">Error loading reminders</div>';
    }
  }

  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);
  }

  // Initial load
  loadReminders();
});

async function checkAuthStatus() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_AUTH_STATUS",
    });
    if (!statusDot || !statusText || !statusInfo || !loginSection || !loggedInSection) {
      return;
    }

    if (response && response.isAuthenticated) {
      statusDot.className = "status-dot active";
      statusText.textContent = "Active & Syncing";
      statusInfo.textContent = "Data is being sent to your dashboard";
      loginSection.classList.add("hidden");
      loggedInSection.classList.remove("hidden");
    } else {
      statusDot.className = "status-dot inactive";
      statusText.textContent = "Not Syncing";
      statusInfo.textContent = "Login to sync data to your dashboard";
      loginSection.classList.remove("hidden");
      loggedInSection.classList.add("hidden");
    }

    if (response && response.status) {
      switch (response.status) {
        case "failed":
          statusDot.className = "status-dot warning";
          statusText.textContent = "Authentication Failed";
          statusInfo.textContent = "Please login again to continue syncing";
          loginSection.classList.remove("hidden");
          loggedInSection.classList.add("hidden");
          break;
        case "no_token":
          statusDot.className = "status-dot inactive";
          statusText.textContent = "Not Logged In";
          statusInfo.textContent = "Click below to login and start syncing";
          loginSection.classList.remove("hidden");
          loggedInSection.classList.add("hidden");
          break;
        case "network_error":
          statusDot.className = "status-dot warning";
          statusText.textContent = "Connection Error";
          statusInfo.textContent = "Unable to connect to server";
          break;
        case "active":
          break;
      }
    }

    const { token } = await chrome.storage.local.get(["token"]);
  } catch (error) {
    if (statusDot && statusText && statusInfo && loginSection && loggedInSection) {
      statusDot.className = "status-dot inactive";
      statusText.textContent = "Error";
      statusInfo.textContent = "Unable to check status - try reloading extension";
      loginSection.classList.remove("hidden");
      loggedInSection.classList.add("hidden");
    }
  }
}