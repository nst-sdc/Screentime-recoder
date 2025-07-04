// popup.js - Extension popup functionality
console.log("🔧 Popup script loaded");

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const statusInfo = document.getElementById("statusInfo");
const loginSection = document.getElementById("loginSection");
const loggedInSection = document.getElementById("loggedInSection");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const debugBtn = document.getElementById("debugBtn");
const debugInfo = document.getElementById("debugInfo");

// Check authentication status
async function checkAuthStatus() {
  try {
    // Get auth status from background script
    const response = await chrome.runtime.sendMessage({
      type: "GET_AUTH_STATUS"
    });

    console.log("Auth status response:", response);

    if (response && response.isAuthenticated) {
      // User is logged in - show logout section, hide login
      statusDot.className = "status-dot active";
      statusText.textContent = "Active & Syncing";
      statusInfo.textContent = "Data is being sent to your dashboard";

      // Hide login section, show logout section
      loginSection.classList.add("hidden");
      loggedInSection.classList.remove("hidden");
    } else {
      // User is not logged in - show login section, hide logout
      statusDot.className = "status-dot inactive";
      statusText.textContent = "Not Syncing";
      statusInfo.textContent = "Login to sync data to your dashboard";

      // Show login section, hide logout section
      loginSection.classList.remove("hidden");
      loggedInSection.classList.add("hidden");
    }

    // Handle specific auth status
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
          // Already handled above
          break;
      }
    }

    // Add debug info about token
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

    // Default to showing login section on error
    loginSection.classList.remove("hidden");
    loggedInSection.classList.add("hidden");
  }
}

// Handle login button click
loginBtn.addEventListener("click", () => {
  // Open the web app login page
  chrome.tabs.create({ url: "https://screentime-recoder.vercel.app/login" });
});

// Handle logout button click
logoutBtn.addEventListener("click", async () => {
  try {
    // Clear authentication via background script
    await chrome.runtime.sendMessage({ type: "CLEAR_AUTH" });

    console.log("🚪 User logged out");

    // Update UI
    checkAuthStatus();
  } catch (error) {
    console.error("Error during logout:", error);
  }
});

// Initialize popup
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
});

// Listen for storage changes (when user logs in via web app)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.token || changes.authStatus)) {
    checkAuthStatus();
  }
});

// Active tabs functionality
const activeTabsBtn = document.getElementById("activeTabsBtn");
const activeTabsInfo = document.getElementById("activeTabsInfo");

activeTabsBtn.addEventListener("click", async () => {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_ACTIVE_TABS"
    });
    const activeTabs = response.activeTabs || [];

    if (activeTabs.length === 0) {
      activeTabsInfo.innerHTML =
        '<div style="color: #2563eb;">No active tabs being tracked</div>';
    } else {
      const html = activeTabs
        .map(
          tab => `
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

// Debug functionality
debugBtn.addEventListener("click", async () => {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_ACTIVITY_LOG"
    });
    const activities = response.activityLog || [];
    const activeTabs = response.activeTabs || [];

    let html = "";

    if (activeTabs.length > 0) {
      html +=
        '<div class="font-semibold text-green-600 mb-2">Currently Active:</div>';
      activeTabs.forEach(tab => {
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
      recent.forEach(activity => {
        const duration = activity.finalDuration
          ? Math.round(activity.finalDuration / 1000)
          : "N/A";
        html += `
          <div class="activity-item">
            <div class="domain">${activity.domain}</div>
            <div class="duration">${duration}s • ${activity.reason ||
          "ended"}</div>
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

// Add a test function to manually set token for debugging
window.setTestToken = async function() {
  const testToken = "test_token_123";
  await chrome.storage.local.set({
    token: testToken,
    authStatus: "active"
  });
  console.log("Test token set");
  checkAuthStatus();
};

// Add function to clear token for testing
window.clearToken = async function() {
  await chrome.storage.local.remove(["token", "authStatus"]);
  console.log("Token cleared");
  checkAuthStatus();
};

// Add function to check storage
window.checkStorage = async function() {
  const data = await chrome.storage.local.get(["token", "authStatus"]);
  console.log("Storage data:", data);
};

// Test button event listeners
const testTokenBtn = document.getElementById("testTokenBtn");
const clearTokenBtn = document.getElementById("clearTokenBtn");

testTokenBtn.addEventListener("click", async () => {
  await window.setTestToken();
});

clearTokenBtn.addEventListener("click", async () => {
  await window.clearToken();
});
