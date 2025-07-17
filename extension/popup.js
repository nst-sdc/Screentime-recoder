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