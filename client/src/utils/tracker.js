let startTime = null;
let sessionId = null;
let active = true;
let intervalId = null;
let totalTracked = 0;

export function trackTimeOnDomain(domainName) {
  console.log("Tracking started for:", domainName);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("No token found in localStorage");
    return () => {};
  }

  startTime = new Date();
  sessionId = `${domainName}-${startTime.getTime()}`;
  let lastActivity = Date.now();

  const updateActivity = () => {
    lastActivity = Date.now();
  };

  window.addEventListener('mousemove', updateActivity);
  window.addEventListener('keydown', updateActivity);

  document.addEventListener("visibilitychange", () => {
    active = !document.hidden;
    console.log(`Tab visibility changed: ${active ? "Visible" : "Hidden"}`);
  });

  intervalId = setInterval(() => {
    const now = Date.now();

    if (active && now - lastActivity < 60000) {
      totalTracked += 30;
      console.log("Sending 30s update for:", domainName);

      const trackingData = {
        url: `https://${domainName}`,
        domain: domainName,
        duration: 30 * 1000, // duration in ms
        startTime,
        sessionId,
        tabId: 1,
        title: document.title || domainName,
        action: "update",
        isActive: true,
        idleTime: 0
      };

      fetch(`${API_BASE_URL}/domain/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(trackingData)
      })
        .then(async res => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
          }
          return res.json();
        })
        .then(data => console.log("Tracking data sent:", data))
        .catch(err => {
          console.error("Error sending tracking data:", err);
          if (err.message.includes('401')) {
            console.warn("Authentication failed - token may be expired");
          }
        });
    } else if (!active) {
      console.log("Tab inactive, skipping tracking update");
    } else {
      console.log("User idle for >1min, skipping tracking update");
    }
  }, 30000);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener("mousemove", updateActivity);
    window.removeEventListener("keydown", updateActivity);

    const endTime = new Date();
    const timeSpentSec = Math.floor((endTime - startTime) / 1000);
    const remainingTime = timeSpentSec - totalTracked;

    console.log("Cleanup:", `${timeSpentSec}s spent, ${remainingTime}s left`);

    // Send final tracking data with proper authorization
    if (remainingTime > 0) {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      fetch(`${API_BASE_URL}/domain/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          url: `https://${domainName}`,
          domain: domainName,
          duration: remainingTime * 1000, // Convert to ms
          startTime,
          sessionId,
          tabId: 1,
          title: document.title,
          action: "cleanup",
          isActive: false,
          idleTime: 0
        })
      })
      .then(res => res.json())
      .then(data => console.log("Final tracking data sent:", data))
      .catch(err => console.error("Error sending final time data:", err));
    }
    startTime = null;
    sessionId = null;
    totalTracked = 0;
    active = true;
    };
}
