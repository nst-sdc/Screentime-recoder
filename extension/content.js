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
  // Forward reminder control messages from web app to background
  else if (event.data && event.data.type && event.data.type.startsWith('EXTENSION_REMINDER_')) {
    // Map web message types to background message types
    const map = {
      'EXTENSION_REMINDER_CREATE': 'CREATE_REMINDER',
      'EXTENSION_REMINDER_DELETE': 'DELETE_REMINDER',
      'EXTENSION_REMINDER_TOGGLE': 'TOGGLE_REMINDER',
      'EXTENSION_REMINDER_GET': 'GET_REMINDERS'
    };

    const requestId = event.data.requestId || `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const bgType = map[event.data.type];
    if (!bgType) {
      // unsupported
      try { window.postMessage({ type: `${event.data.type}_RESPONSE`, requestId, response: { success: false, error: 'unsupported_type' } }, event.origin); } catch (e) {}
      return;
    }

    const payload = event.data.payload || {};
    // build message expected by background
    let message = {};
    switch (bgType) {
      case 'CREATE_REMINDER':
        message = { type: bgType, reminder: payload.reminder };
        break;
      case 'DELETE_REMINDER':
        message = { type: bgType, id: payload.id };
        break;
      case 'TOGGLE_REMINDER':
        message = { type: bgType, id: payload.id, enabled: !!payload.enabled };
        break;
      case 'GET_REMINDERS':
        message = { type: bgType };
        break;
      default:
        message = { type: bgType };
    }

    chrome.runtime.sendMessage(message, (response) => {
      try {
        window.postMessage({ type: `${event.data.type}_RESPONSE`, requestId, response }, event.origin);
      } catch (e) {
        // ignore
      }
    });
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
