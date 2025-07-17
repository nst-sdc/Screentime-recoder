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
