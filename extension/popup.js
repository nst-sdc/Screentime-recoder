const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const statusInfo = document.getElementById("statusInfo");
const loginSection = document.getElementById("loginSection");
const loggedInSection = document.getElementById("loggedInSection");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const debugBtn = document.getElementById("debugBtn");
const debugInfo = document.getElementById("debugInfo");

async function checkAuthStatus() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_AUTH_STATUS",
    });

    console.log("Auth status response:", response);

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
    if (token) {
      console.log("Token found:", token.substring(0, 20) + "...");
    } else {
      console.log("No token found in storage");
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
    statusDot.className = "status-dot inactive";
    statusText.textContent = "Error";
    statusInfo.textContent = "Unable to check status - try reloading extension";
    loginSection.classList.remove("hidden");
    loggedInSection.classList.add("hidden");
  }
}
loginBtn.addEventListener("click", () => {
  chrome.tabs.create({
    url: "http://localhost:5173/login",
  });
  chrome.tabs.create({ url: "https://screentime-recoder.vercel.app/login" });
});

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
    console.error("Error during logout:", error);
  }
});

// Init
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
});

// Sync status on storage change
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.token || changes.authStatus)) {
    checkAuthStatus();
  }
});

// Active Tabs
const activeTabsBtn = document.getElementById("activeTabsBtn");
const activeTabsInfo = document.getElementById("activeTabsInfo");

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
    console.error("Error getting active tabs:", error);
    activeTabsInfo.innerHTML =
      '<div style="color: #dc2626;">Error loading active tabs</div>';
    activeTabsInfo.classList.remove("hidden");
  }
});

// Debug Panel
debugBtn.addEventListener("click", async () => {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_ACTIVITY_LOG",
    });
    const activities = response.activityLog || [];
    const activeTabs = response.activeTabs || [];

    let html = "";

    if (activeTabs.length > 0) {
      html +=
        '<div class="font-semibold text-green-600 mb-2">Currently Active:</div>';
      activeTabs.forEach((tab) => {
        html += `
        <div class="activity-item">
          <div class="domain">${tab.domain}</div>
          <div style="color: #10b981; font-size: 11px;">${Math.round(
          tab.currentDuration / 1000
        )}s</div>
        </div>
      `;
      });
    }

    if (activities.length === 0) {
      html +=
        '<div style="color: #dc2626; font-size: 12px;">No activities logged yet</div>';
    } else {
      html +=
        '<div style="font-weight: 600; color: #6b7280; margin-top: 8px; margin-bottom: 8px; font-size: 12px;">Recent History:</div>';
      const recent = activities.slice(-5);
      recent.forEach((activity) => {
        const duration = activity.finalDuration
          ? Math.round(activity.finalDuration / 1000)
          : "N/A";
        html += `
        <div class="activity-item">
          <div class="domain">${activity.domain}</div>
          <div class="duration">${duration}s • ${activity.reason || "ended"}</div>
        </div>
      `;
      });
    }

    debugInfo.innerHTML = html;
    debugInfo.classList.toggle("hidden");
  } catch (error) {
    console.error("Error getting debug info:", error);
    debugInfo.innerHTML =
      '<div style="color: #dc2626; font-size: 12px;">Error loading debug info</div>';
    debugInfo.classList.remove("hidden");
  }
});
