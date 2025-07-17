window.addEventListener("message", event => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://screentime-recoder.vercel.app",
    "https://screentime-recoder.onrender.com"
  ];

  if (!allowedOrigins.includes(event.origin)) {
    return;
  }

  if (event.data.type === "EXTENSION_AUTH") {
    chrome.runtime.sendMessage(
      {
        type: "SET_TOKEN",
        token: event.data.token
      },
      response => {
        if (response && response.success) {
          window.postMessage(
            {
              type: "EXTENSION_AUTH_SUCCESS",
              extensionId: chrome.runtime.id
            },
            event.origin
          );
        }
      }
    );
  }
});

// Listen for domain blocking messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "BLOCK_DOMAIN") {
    blockCurrentDomain(message.domain, message.blockMessage);
    sendResponse({ success: true });
  } else if (message.type === "CHECK_DOMAIN_BLOCKED") {
    checkIfDomainBlocked(message.domain).then(isBlocked => {
      sendResponse({ isBlocked });
    });
    return true; // Keep the message channel open for async response
  }
});

// Function to block the current domain
function blockCurrentDomain(domain, blockMessage) {
  const currentDomain = window.location.hostname;

  // Check if current domain matches the blocked domain
  if (currentDomain.includes(domain) || domain.includes(currentDomain)) {
    // Create blocking overlay
    const blockOverlay = document.createElement("div");
    blockOverlay.id = "screentime-block-overlay";
    blockOverlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: linear-gradient(135deg, #dc2626, #991b1b) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: center !important;
      color: white !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
      text-align: center !important;
      padding: 20px !important;
      box-sizing: border-box !important;
    `;

    blockOverlay.innerHTML = `
      <div style="max-width: 600px; padding: 40px; background: rgba(0,0,0,0.3); border-radius: 20px; backdrop-filter: blur(10px);">
        <div style="font-size: 80px; margin-bottom: 20px;">🚫</div>
        <h1 style="font-size: 3rem; font-weight: bold; margin: 0 0 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
          Domain Blocked
        </h1>
        <h2 style="font-size: 1.5rem; margin: 0 0 30px 0; color: #fecaca;">
          ${domain}
        </h2>
        <p style="font-size: 1.2rem; line-height: 1.6; margin: 0 0 30px 0; color: #fed7d7;">
          ${blockMessage ||
            "This domain has been blocked based on your time management preferences."}
        </p>
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
          <button id="screentime-close-tab" style="
            background: #ef4444;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          ">
            🚪 Close Tab
          </button>
          <button id="screentime-go-back" style="
            background: #6b7280;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          ">
            ⬅️ Go Back
          </button>
          <button id="screentime-dashboard" style="
            background: #059669;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          ">
            📊 Dashboard
          </button>
        </div>
        <p style="font-size: 0.9rem; margin-top: 30px; color: #fca5a5;">
          ⏰ Blocked at: ${new Date().toLocaleTimeString()}
        </p>
      </div>
    `;

    // Add hover effects
    const style = document.createElement("style");
    style.textContent = `
      #screentime-close-tab:hover { background: #dc2626 !important; transform: translateY(-2px); }
      #screentime-go-back:hover { background: #4b5563 !important; transform: translateY(-2px); }
      #screentime-dashboard:hover { background: #047857 !important; transform: translateY(-2px); }
    `;
    document.head.appendChild(style);

    // Add to page
    document.body.appendChild(blockOverlay);

    // Add event listeners
    document
      .getElementById("screentime-close-tab")
      .addEventListener("click", () => {
        chrome.runtime.sendMessage({ type: "CLOSE_TAB" });
      });

    document
      .getElementById("screentime-go-back")
      .addEventListener("click", () => {
        window.history.back();
      });

    document
      .getElementById("screentime-dashboard")
      .addEventListener("click", () => {
        window.open("http://localhost:5173/dashboard", "_blank");
      });

    // Prevent scrolling on the blocked page
    document.body.style.overflow = "hidden";
  }
}

// Function to check if domain is blocked
async function checkIfDomainBlocked(domain) {
  try {
    const { token } = await chrome.storage.local.get(["token"]);
    if (!token) return false;

    const response = await fetch(
      `http://localhost:3001/api/reminders/check-blocked/${domain}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.isBlocked;
    }
  } catch (error) {
    console.error("Error checking domain block status:", error);
  }
  return false;
}

// Check if current domain is blocked on page load
(async () => {
  const currentDomain = window.location.hostname;
  const isBlocked = await checkIfDomainBlocked(currentDomain);

  if (isBlocked) {
    blockCurrentDomain(
      currentDomain,
      "This domain is currently blocked based on your reminder settings."
    );
  }
})();

const allowedHosts = ["localhost", "screentime-recoder.vercel.app"];
if (allowedHosts.includes(window.location.hostname)) {
  window.postMessage(
    {
      type: "EXTENSION_AVAILABLE",
      extensionId: chrome.runtime.id
    },
    window.location.origin
  );
}
