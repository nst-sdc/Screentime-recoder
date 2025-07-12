console.log("Content script injected into webpage");

// Listen for authentication messages from the web app
window.addEventListener("message", event => {
  // Only accept messages from localhost (your web app)
  if (
    event.origin !== "http://localhost:5173" &&
    event.origin !== "http://localhost:3000"
  ) {
    return;
  }

  if (event.data.type === "EXTENSION_AUTH") {
    console.log("🔐 Received auth token from web app");

    // Send token to background script
    chrome.runtime.sendMessage(
      {
        type: "SET_TOKEN",
        token: event.data.token
      },
      response => {
        if (response && response.success) {
          console.log("✅ Token stored successfully in extension");

          // Notify web app that extension is authenticated
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

// Notify web app that extension is available
if (window.location.hostname === "localhost") {
  window.postMessage(
    {
      type: "EXTENSION_AVAILABLE",
      extensionId: chrome.runtime.id
    },
    window.location.origin
  );
}
