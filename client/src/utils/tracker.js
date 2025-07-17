let startTime = null;
let sessionId = null;
let active = true;
let intervalId = null;
let totalTracked = 0;

export function trackTimeOnDomain(domainName) {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const token = localStorage.getItem("token");

  if (!token) {
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
  });

  intervalId = setInterval(() => {
    const now = Date.now();

    if (active && now - lastActivity < 60000) {
      totalTracked += 30;

      const trackingData = {
        url: `https://${domainName}`,
        domain: domainName,
        duration: 30 * 1000,
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
        body: JSON.stringify(trackingData)        })
        .then(async res => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
          }
          return res.json();
        })
        .then(data => {
          // Tracking data sent successfully
        })
        .catch(err => {
          // Silent fail for tracking errors
        });
    }
  }, 30000);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener("mousemove", updateActivity);
    window.removeEventListener("keydown", updateActivity);

    const endTime = new Date();
    const timeSpentSec = Math.floor((endTime - startTime) / 1000);
    const remainingTime = timeSpentSec - totalTracked;

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
          duration: remainingTime * 1000,
          startTime,
          sessionId,
          tabId: 1,
          title: document.title,
          action: "end",
          isActive: false,
          idleTime: 0
        })
      })
      .then(res => res.json())
      .then(data => {
        // Final tracking data sent successfully
      })
      .catch(err => {
        // Silent fail for final tracking
      });
    }
    startTime = null;
    sessionId = null;
    totalTracked = 0;
    active = true;
    };
}
