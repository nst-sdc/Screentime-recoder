import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import apiConfig from "../utils/apiConfig";

const Reminders = () => {
  const { user, token } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTimers, setActiveTimers] = useState(new Map());
  const [notifications, setNotifications] = useState([]);
  const [audioContext, setAudioContext] = useState(null);
  const [blockedDomains, setBlockedDomains] = useState([]);
  const [manualBlockForm, setManualBlockForm] = useState({
    domain: '',
    duration: 3600000 // 1 hour default
  });
  const [form, setForm] = useState({
    type: "alert",
    reminderName: "",
    message: "",
    targetType: "category",
    targetValue: "productivity",
    customCategory: "",
    hours: 0,
    minutes: 0,
    seconds: 0,
    repeatOption: "never",
    customRepeatHours: 0,
    customRepeatMinutes: 0,
    customRepeatSeconds: 0,
    notificationTypes: ["browser"]
  });
  const remindersEndRef = useRef(null);
  const timerRefs = useRef(new Map());

  useEffect(() => {
    if (token) {
      loadReminders();
      loadBlockedDomains();
      initializeAudio();
      requestNotificationPermission();
    }
    
    return () => {
      timerRefs.current.forEach(timerId => clearTimeout(timerId));
      timerRefs.current.clear();
    };
  }, [token]);

  // Initialize audio context for sound notifications
  const initializeAudio = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
    } catch (err) {
      console.warn('Audio context not supported');
    }
  };

  // Request notification permissions
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Clear errors when form changes
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [form]);

  // Update timer display every second
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => new Map(prev));
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  const loadReminders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiConfig.API_URL}/reminders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Check if it's a 404 or server error
        if (response.status === 404) {
          throw new Error('Reminder API endpoint not found. Please check if the server is running.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Please check if the API server is running correctly.");
      }

      const data = await response.json();
      if (data.success) {
        setReminders(data.data);
        
        // Start timers for active reminders
        data.data.forEach(reminder => {
          if (reminder.active) {
            startReminderTimer(reminder);
          }
        });
      } else {
        throw new Error(data.message || 'Failed to load reminders');
      }
      setError(null);
    } catch (err) {
      console.error("Error loading reminders:", err);
      setError(err.message || "Failed to load reminders");
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };
  const loadBlockedDomains = async () => {
    try {
      const response = await fetch(`${apiConfig.API_URL}/reminders/blocked-domains`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Check if it's a 404 or server error
        if (response.status === 404) {
          console.warn('Blocked domains API endpoint not found. This feature may not be available.');
          return;
        } else if (response.status >= 500) {
          console.error('Server error when loading blocked domains');
          return;
        }
        console.error(`HTTP ${response.status}: ${response.statusText}`);
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Server returned non-JSON response for blocked domains");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setBlockedDomains(data.data);
      }
    } catch (err) {
      console.error("Error loading blocked domains:", err);
      // Don't set error for blocked domains as it's not critical
    }
  };

  // Timer management functions
  const startReminderTimer = useCallback((reminder) => {
    if (!reminder || !reminder._id) return;

    const totalMs = (reminder.hours * 3600 + reminder.minutes * 60 + reminder.seconds) * 1000;
    if (totalMs <= 0) return;

    // Clear existing timer if any
    stopReminderTimer(reminder._id);

    const timerId = setTimeout(() => {
      triggerReminder(reminder);
    }, totalMs);

    timerRefs.current.set(reminder._id, timerId);
    
    setActiveTimers(prev => {
      const newTimers = new Map(prev);
      newTimers.set(reminder._id, {
        startTime: Date.now(),
        duration: totalMs,
        reminder: reminder
      });
      return newTimers;
    });
  }, []);

  const stopReminderTimer = useCallback((reminderId) => {
    const timerId = timerRefs.current.get(reminderId);
    if (timerId) {
      clearTimeout(timerId);
      timerRefs.current.delete(reminderId);
    }
    
    setActiveTimers(prev => {
      const newTimers = new Map(prev);
      newTimers.delete(reminderId);
      return newTimers;
    });
  }, []);

  const triggerReminder = useCallback(async (reminder) => {
    // Execute domain blocking if it's a block type
    if (reminder.type === 'block' && reminder.targetValue) {
      const blockingSuccess = await blockDomainAPI(reminder._id, reminder.targetValue);
      // Only show notification if domain blocking was successful
      if (blockingSuccess) {
        showNotification(reminder);
      }
    } else {
      // Show notification for non-blocking reminders
      showNotification(reminder);
    }
    
    // Play sound if enabled
    if (reminder.notificationTypes?.includes('sound')) {
      playNotificationSound();
    }

    // Trigger on server
    try {
      await fetch(`${apiConfig.API_URL}/reminders/${reminder._id}/trigger`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Error triggering reminder on server:', err);
    }

    // Handle repeat logic
    if (reminder.repeatOption && reminder.repeatOption !== 'never') {
      let repeatMs = 0;
      
      switch (reminder.repeatOption) {
        case 'hourly':
          repeatMs = 3600000; // 1 hour
          break;
        case '10min':
          repeatMs = 600000; // 10 minutes
          break;
        case 'custom':
          repeatMs = (reminder.customRepeatHours * 3600 + 
                     reminder.customRepeatMinutes * 60 + 
                     reminder.customRepeatSeconds) * 1000;
          break;
      }

      if (repeatMs > 0) {
        const timerId = setTimeout(() => {
          triggerReminder(reminder);
        }, repeatMs);
        timerRefs.current.set(`${reminder._id}_repeat`, timerId);
      }
    }
  }, [audioContext, token]);

  const blockDomainAPI = async (reminderId, domain) => {
    try {
      const response = await fetch(`${apiConfig.API_URL}/reminders/${reminderId}/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domain })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if the blocking was successful based on the response
        if (data.success) {
          loadBlockedDomains(); // Refresh blocked domains list
          
          // Send message to content script to block domain
          if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
              chrome.tabs.sendMessage(tabs[0].id, {
                type: "BLOCK_DOMAIN",
                domain: domain,
                message: `Access to ${domain} has been blocked based on your time preferences.`
              });
            });
          }
          return true; // Domain blocking was successful
        } else {
          console.error('Domain blocking failed:', data.message);
          return false; // Domain blocking failed
        }
      } else {
        console.error('Failed to block domain:', response.status, response.statusText);
        return false; // Domain blocking failed
      }
    } catch (err) {
      console.error('Error blocking domain:', err);
      return false; // Domain blocking failed
    }
  };

  // Manual domain blocking function
  const blockDomainManually = async (domain, duration = 3600000) => {
    try {
      const response = await fetch(`${apiConfig.API_URL}/reminders/block-domain`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          domain,
          duration,
          type: 'manual'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          loadBlockedDomains(); // Refresh blocked domains list
          
          // Send message to content script to block domain
          if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
              if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: "BLOCK_DOMAIN",
                  domain: domain,
                  message: `Access to ${domain} has been blocked manually.`
                });
              }
            });
          }
          
          // Show success notification
          const notification = {
            id: Date.now().toString(),
            reminder: {
              type: 'block',
              reminderName: 'Manual Block',
              message: `${domain} has been blocked successfully`,
              targetValue: domain
            },
            timestamp: new Date().toLocaleTimeString()
          };
          
          setNotifications(prev => [...prev, notification]);
          
          // Auto-dismiss after 5 seconds
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
          }, 5000);
          
          return true;
        } else {
          console.error('Manual domain blocking failed:', data.message);
          return false;
        }
      } else {
        console.error('Failed to block domain manually:', response.status, response.statusText);
        return false;
      }
    } catch (err) {
      console.error('Error blocking domain manually:', err);
      return false;
    }
  };

  // Unblock domain function
  const unblockDomain = async (domain) => {
    try {
      const response = await fetch(`${apiConfig.API_URL}/reminders/unblock-domain`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domain })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          loadBlockedDomains(); // Refresh blocked domains list
          
          // Send message to content script to unblock domain
          if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
              if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: "UNBLOCK_DOMAIN",
                  domain: domain,
                  message: `Access to ${domain} has been restored.`
                });
              }
            });
          }
          
          return true;
        } else {
          console.error('Domain unblocking failed:', data.message);
          return false;
        }
      } else {
        console.error('Failed to unblock domain:', response.status, response.statusText);
        return false;
      }
    } catch (err) {
      console.error('Error unblocking domain:', err);
      return false;
    }
  };

  const showNotification = useCallback((reminder) => {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notificationTitle = reminder.type === 'block' 
        ? `Domain Blocked: ${reminder.targetValue}`
        : reminder.reminderName || 'Reminder';
      
      new Notification(notificationTitle, {
        body: reminder.message,
        tag: reminder._id,
        requireInteraction: true
      });
    }

    // In-app notification
    const notification = {
      id: Date.now().toString(),
      reminder: reminder,
      timestamp: new Date().toLocaleTimeString()
    };

    setNotifications(prev => [...prev, notification]);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 10000);
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioContext) {
      try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (err) {
        console.warn('Failed to play notification sound:', err);
      }
    }
  }, [audioContext]);

  // Get current website domain
  const getCurrentDomain = () => {
    if (typeof window !== 'undefined') {
      return window.location.hostname;
    }
    return '';
  };

  // Block current website
  const blockCurrentWebsite = async (duration = 3600000) => {
    const currentDomain = getCurrentDomain();
    if (currentDomain) {
      const success = await blockDomainManually(currentDomain, duration);
      if (success) {
        // Show additional confirmation since this affects the current site
        if (window.confirm(`${currentDomain} has been blocked. You will be redirected away from this site in 3 seconds.`)) {
          setTimeout(() => {
            window.location.href = 'about:blank';
          }, 3000);
        }
      }
    }
  };

  const dismissNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.message.trim()) {
      setError("Please enter a reminder message");
      return;
    }

    if (form.hours === 0 && form.minutes === 0 && form.seconds === 0) {
      setError("Please set a time duration for the reminder");
      return;
    }

    // Validate target value for specific types
    if (form.type === "block" && !form.targetValue.trim()) {
      setError("Please enter a domain to block");
      return;
    }

    if (form.type === "alert" && form.targetType === "domain" && !form.targetValue.trim()) {
      setError("Please enter a domain for the alert");
      return;
    }

    if (form.type === "custom" && form.targetType === "domain" && !form.targetValue.trim()) {
      setError("Please enter a domain for the custom reminder");
      return;
    }

    // Validate custom repeat interval
    if (form.repeatOption === "custom" && 
        form.customRepeatHours === 0 && 
        form.customRepeatMinutes === 0 && 
        form.customRepeatSeconds === 0) {
      setError("Please set a custom repeat interval");
      return;
    }

    // Validate custom category
    if (form.type !== "block" && form.targetType === "category" && form.targetValue === "custom" && !form.customCategory?.trim()) {
      setError("Please enter a custom category name");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Prepare form data
      const formData = { ...form };
      
      // If custom category is selected, use the custom category value
      if (form.targetType === "category" && form.targetValue === "custom" && form.customCategory?.trim()) {
        formData.targetValue = form.customCategory.trim();
      }
      
      const response = await fetch(`${apiConfig.API_URL}/reminders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        // Check if it's a 404 or server error
        if (response.status === 404) {
          throw new Error('Reminder API endpoint not found. Please check if the server is running.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Please check if the API server is running correctly.");
      }

      const data = await response.json();
      if (data.success) {
        // Reload reminders
        await loadReminders();
        
        // Reset form
        setForm({
          type: "alert",
          reminderName: "",
          message: "",
          targetType: "category",
          targetValue: "productivity",
          customCategory: "",
          hours: 0,
          minutes: 0,
          seconds: 0,
          repeatOption: "never",
          customRepeatHours: 0,
          customRepeatMinutes: 0,
          customRepeatSeconds: 0,
          notificationTypes: ["browser"]
        });
        setError(null);
      }
    } catch (err) {
      console.error("Error creating reminder:", err);
      setError("Failed to create reminder. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id) => {
    if (!id) {
      setError("Invalid reminder ID");
      return;
    }

    try {
      const response = await fetch(`${apiConfig.API_URL}/reminders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Check if it's a 404 or server error
        if (response.status === 404) {
          throw new Error('Reminder not found or API endpoint not available.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      // Stop the timer for this reminder
      stopReminderTimer(id);
      
      // Reload reminders
      await loadReminders();
      setError(null);
    } catch (err) {
      console.error("Error deleting reminder:", err);
      setError("Failed to delete reminder. Please try again.");
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      const updated = new Set(form.notificationTypes);
      if (checked) {
        updated.add(value);
      } else {
        updated.delete(value);
      }
      setForm({ ...form, notificationTypes: Array.from(updated) });
    } else if (name === "targetType") {
      setForm({
        ...form,
        targetType: value,
        targetValue: value === "category" ? "productivity" : "",
        customCategory: ""
      });
    } else if (name === "type") {
      // Reset target fields when changing type
      setForm({
        ...form,
        type: value,
        targetType: value === "block" ? "domain" : "category",
        targetValue: value === "block" ? "" : "productivity",
        customCategory: "",
        repeatOption: value === "alert" ? form.repeatOption : "never"
      });
    } else if (name === "targetValue" && value === "custom") {
      // When custom category is selected, clear customCategory field
      setForm({ ...form, [name]: value, customCategory: "" });
    } else {
      // Handle number inputs
      let processedValue = value;
      if (["hours", "minutes", "seconds", "customRepeatHours", "customRepeatMinutes", "customRepeatSeconds"].includes(name)) {
        processedValue = Math.max(0, parseInt(value) || 0);
      }
      
      setForm({ ...form, [name]: processedValue });
    }
  };
  const getTypeIcon = (type) => {
    switch (type) {
      case "alert": return "Alert";
      case "block": return "Block";
      case "custom": return "Custom";
      default: return "Note";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "alert": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "block": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "custom": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please Login</h2>
          <p className="text-gray-600 dark:text-gray-300">You need to be logged in to access reminders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Smart Reminder & Domain Blocker
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Set time-based reminders and automatically block distracting domains
          </p>
          <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-xl">
            <p className="font-semibold">Active Timer System</p>
            <p className="text-sm">
              Active Timers: {activeTimers.size} | Total Reminders: {reminders.length} | Blocked Domains: {blockedDomains.length}
            </p>
          </div>
          
          {/* Quick Domain Blocking Actions */}
          <div className="mt-4 p-4 bg-orange-100 border border-orange-400 text-orange-700 rounded-xl">
            <p className="font-semibold mb-2">Quick Domain Blocking</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => blockCurrentWebsite(1800000)} // 30 minutes
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded-full transition-colors duration-200"
              >
                Block Current Site (30min)
              </button>
              <button
                onClick={() => blockDomainManually('youtube.com', 3600000)} // 1 hour
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full transition-colors duration-200"
              >
                Block YouTube (1hr)
              </button>
              <button
                onClick={() => blockDomainManually('facebook.com', 3600000)} // 1 hour
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full transition-colors duration-200"
              >
                Block Facebook (1hr)
              </button>
              <button
                onClick={() => blockDomainManually('twitter.com', 3600000)} // 1 hour
                className="bg-sky-500 hover:bg-sky-600 text-white text-xs px-3 py-1 rounded-full transition-colors duration-200"
              >
                Block Twitter (1hr)
              </button>
            </div>
          </div>
          
          {/* Active Notifications */}
          {notifications.length > 0 && (
            <div className="mt-4 space-y-2">
              {notifications.map((notification) => (
                <div key={notification.id} className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-xl flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-semibold">
                      {getTypeIcon(notification.reminder.type)} {notification.reminder.reminderName || "Reminder"}
                    </p>
                    <p className="text-sm">{notification.reminder.message} • {notification.timestamp}</p>
                  </div>
                  <button
                    onClick={() => dismissNotification(notification.id)}
                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="order-2 xl:order-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200 dark:border-emerald-700 p-6 sm:p-8 sticky top-4">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                  +
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Reminder</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Display */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
                    <div className="flex">
                      <div className="py-1">
                        <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold">Error</p>
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reminder Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Reminder Type
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm"
                  >
                    <option value="alert">Alert Reminder</option>
                    <option value="block">Domain Blocker</option>
                    <option value="custom">Custom Reminder</option>
                  </select>
                </div>

                {/* Reminder Name */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Reminder Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="reminderName"
                    value={form.reminderName}
                    onChange={handleChange}
                    className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm"
                    placeholder="e.g. Study Break, Exercise Time, etc."
                  />
                </div>

                {/* Reminder Message */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Reminder Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm resize-none"
                    placeholder="Enter your reminder message..."
                  />
                </div>

                {/* Target Type Selection */}
                {form.type !== "block" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      Target Type
                    </label>
                    <select
                      name="targetType"
                      value={form.targetType}
                      onChange={handleChange}
                      className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm"
                    >
                      <option value="category">Category</option>
                      <option value="domain">Domain</option>
                    </select>
                  </div>
                )}

                {/* Target Value */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Target {form.type === "block" ? "Domain" : form.targetType === "domain" ? "Domain" : "Category"}
                  </label>
                  
                  {/* Category Selection */}
                  {form.type !== "block" && form.targetType === "category" ? (
                    <select
                      name="targetValue"
                      value={form.targetValue}
                      onChange={handleChange}
                      className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm"
                    >
                      <option value="productivity">Productivity</option>
                      <option value="work">Work</option>
                      <option value="study">Study</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="custom">Custom</option>
                    </select>
                  ) : (
                    /* Domain Input */
                    <input
                      type="text"
                      name="targetValue"
                      value={form.targetValue}
                      onChange={handleChange}
                      className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm"
                      placeholder={
                        form.type === "block" 
                          ? "e.g. youtube.com" 
                          : form.targetType === "domain" 
                            ? "e.g. facebook.com" 
                            : "e.g. productivity"
                      }
                    />
                  )}
                  
                  {/* Custom Category Input */}
                  {form.type !== "block" && form.targetType === "category" && form.targetValue === "custom" && (
                    <input
                      type="text"
                      name="customCategory"
                      value={form.customCategory || ""}
                      onChange={handleChange}
                      className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm mt-3"
                      placeholder="Enter custom category name..."
                    />
                  )}
                </div>

                {/* Time Duration */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Time Duration
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hours</label>
                      <input
                        type="number"
                        name="hours"
                        value={form.hours}
                        onChange={handleChange}
                        min="0"
                        max="23"
                        className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Minutes</label>
                      <input
                        type="number"
                        name="minutes"
                        value={form.minutes}
                        onChange={handleChange}
                        min="0"
                        max="59"
                        className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Seconds</label>
                      <input
                        type="number"
                        name="seconds"
                        value={form.seconds}
                        onChange={handleChange}
                        min="0"
                        max="59"
                        className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Repeat Option */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Repeat Option
                  </label>
                  <select
                    name="repeatOption"
                    value={form.repeatOption}
                    onChange={handleChange}
                    className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm"
                  >
                    <option value="never">Never</option>
                    <option value="10min">Every 10 minutes</option>
                    <option value="hourly">Every hour</option>
                    <option value="custom">Custom interval</option>
                  </select>
                </div>

                {/* Custom Repeat Duration */}
                {form.repeatOption === "custom" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      Custom Repeat Interval
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hours</label>
                        <input
                          type="number"
                          name="customRepeatHours"
                          value={form.customRepeatHours}
                          onChange={handleChange}
                          min="0"
                          max="23"
                          className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Minutes</label>
                        <input
                          type="number"
                          name="customRepeatMinutes"
                          value={form.customRepeatMinutes}
                          onChange={handleChange}
                          min="0"
                          max="59"
                          className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Seconds</label>
                        <input
                          type="number"
                          name="customRepeatSeconds"
                          value={form.customRepeatSeconds}
                          onChange={handleChange}
                          min="0"
                          max="59"
                          className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Create {form.type === "block" ? "Blocker" : "Reminder"}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Reminders List */}
          <div className="order-1 xl:order-2">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200 dark:border-emerald-700 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                    ☐
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Reminders</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {reminders.length} reminder{reminders.length !== 1 ? 's' : ''} configured
                    </p>
                  </div>
                </div>
                
                {/* Management buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={loadReminders}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-emerald-600 disabled:opacity-50"
                    title="Refresh reminders"
                  >
                    <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-12">
                    <svg className="animate-spin h-12 w-12 text-emerald-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">Loading reminders...</p>
                  </div>
                ) : reminders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">○</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No reminders yet</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                      Create your first reminder or domain blocker to get started!
                    </p>
                  </div>
                ) : (
                  reminders.map((reminder) => {
                    const timerInfo = activeTimers.get(reminder._id);
                    const timeRemaining = timerInfo ? 
                      Math.max(0, timerInfo.duration - (Date.now() - timerInfo.startTime)) : 0;
                    const isActive = timeRemaining > 0;
                    
                    return (
                      <div
                        key={reminder._id}
                        className={`bg-white dark:bg-slate-700 rounded-xl shadow-md border ${
                          isActive ? 'border-green-300 dark:border-green-600' : 'border-gray-200 dark:border-slate-600'
                        } p-4 hover:shadow-lg transition-shadow duration-200`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-lg mr-2">{getTypeIcon(reminder.type)}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(reminder.type)}`}>
                                {reminder.type.toUpperCase()}
                              </span>
                              {isActive && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium animate-pulse">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {reminder.reminderName || reminder.message || "Untitled Reminder"}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                              {reminder.message || "No message"}
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                                {reminder.hours || 0}h {reminder.minutes || 0}m {reminder.seconds || 0}s
                              </span>
                              <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                                {reminder.targetType === "domain" ? "Domain" : "Category"}: {reminder.targetValue || "General"}
                              </span>
                              {reminder.repeatOption && reminder.repeatOption !== "never" && (
                                <span className="bg-purple-100 dark:bg-purple-600 px-2 py-1 rounded-full text-purple-800 dark:text-purple-200">
                                  Repeat: {reminder.repeatOption === "10min" ? "10min" : 
                                          reminder.repeatOption === "hourly" ? "1h" : 
                                          reminder.repeatOption === "custom" ? 
                                          `${reminder.customRepeatHours || 0}h ${reminder.customRepeatMinutes || 0}m ${reminder.customRepeatSeconds || 0}s` : 
                                          reminder.repeatOption}
                                </span>
                              )}
                              {isActive && (
                                <span className="bg-blue-100 dark:bg-blue-600 px-2 py-1 rounded-full text-blue-800 dark:text-blue-200">
                                  {Math.floor(timeRemaining / 3600000)}h {Math.floor((timeRemaining % 3600000) / 60000)}m {Math.floor((timeRemaining % 60000) / 1000)}s left
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col gap-2">
                            {isActive ? (
                              <button
                                onClick={() => stopReminderTimer(reminder._id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors duration-200"
                                title="Stop Timer"
                              >
                                ⏹
                              </button>
                            ) : (
                              <button
                                onClick={() => startReminderTimer(reminder)}
                                className="text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-full transition-colors duration-200"
                                title="Start Timer"
                              >
                                ▶
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(reminder._id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors duration-200"
                              title="Delete Reminder"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div ref={remindersEndRef} />
            </div>
          </div>
        </div>

        {/* Manual Domain Blocking Section */}
        <div className="mt-8">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl shadow-xl border border-orange-200 dark:border-orange-700 p-6">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                🚫
              </div>
              <div>
                <h3 className="text-2xl font-bold text-orange-800 dark:text-orange-300">Manual Domain Blocking</h3>
                <p className="text-orange-600 dark:text-orange-400 text-sm">
                  Block domains instantly without setting up a reminder
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">
                  Domain to Block
                </label>
                <input
                  type="text"
                  placeholder="e.g. youtube.com, facebook.com"
                  value={manualBlockForm.domain}
                  onChange={(e) => setManualBlockForm({...manualBlockForm, domain: e.target.value})}
                  className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-orange-200 dark:border-orange-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-200 shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const domain = manualBlockForm.domain.trim();
                      if (domain) {
                        blockDomainManually(domain, manualBlockForm.duration);
                        setManualBlockForm({...manualBlockForm, domain: ''});
                      }
                    }
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">
                  Block Duration
                </label>
                <select
                  value={manualBlockForm.duration}
                  onChange={(e) => setManualBlockForm({...manualBlockForm, duration: parseInt(e.target.value)})}
                  className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-orange-200 dark:border-orange-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-200 shadow-sm"
                >
                  <option value="900000">15 minutes</option>
                  <option value="1800000">30 minutes</option>
                  <option value="3600000">1 hour</option>
                  <option value="7200000">2 hours</option>
                  <option value="14400000">4 hours</option>
                  <option value="86400000">24 hours</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const domain = manualBlockForm.domain.trim();
                  if (domain) {
                    blockDomainManually(domain, manualBlockForm.duration);
                    setManualBlockForm({...manualBlockForm, domain: ''});
                  }
                }}
                disabled={!manualBlockForm.domain.trim()}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none transition-all duration-200 flex items-center space-x-2"
              >
                <span>🚫</span>
                <span>Block Domain Now</span>
              </button>
              
              <button
                onClick={() => blockCurrentWebsite(manualBlockForm.duration)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <span>🌐</span>
                <span>Block Current Website</span>
              </button>
            </div>
          </div>
        </div>

        {/* Blocked Domains Section */}
        {blockedDomains.length > 0 && (
          <div className="mt-8">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-xl border border-red-200 dark:border-red-700 p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white text-lg font-bold mr-3">
                  ×
                </div>
                <h3 className="text-xl font-bold text-red-800 dark:text-red-300">Currently Blocked Domains</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blockedDomains.map((block, index) => (
                  <div key={index} className="bg-white dark:bg-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-red-800 dark:text-red-300">{block.domain}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${block.isActive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                          {block.isActive ? 'BLOCKED' : 'EXPIRED'}
                        </span>
                        {block.isActive && (
                          <button
                            onClick={() => unblockDomain(block.domain)}
                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-full transition-colors duration-200"
                            title="Unblock domain"
                          >
                            Unblock
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Blocked: {new Date(block.blockedAt).toLocaleString()}
                    </p>
                    {block.blockedUntil && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Until: {new Date(block.blockedUntil).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reminders;
