import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({
    type: "alert",
    reminderName: "",
    message: "",
    targetType: "category",
    targetValue: "productivity",
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
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/reminders/user`, {
        withCredentials: true
      });
      setReminders(res.data);
    } catch (err) {
      console.error("Error fetching reminders:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      const updated = new Set(form.notificationTypes);
      checked ? updated.add(value) : updated.delete(value);
      setForm({ ...form, notificationTypes: Array.from(updated) });
    } else if (name === "targetType") {
      setForm({
        ...form,
        targetType: value,
        targetValue: value === "category" ? "productivity" : ""
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/reminders/add`, form, {
        withCredentials: true
      });
      setReminders((prev) => [...prev, res.data.reminder]);
      setForm({
        type: "alert",
        reminderName: "",
        message: "",
        targetType: "category",
        targetValue: "productivity",
        hours: 0,
        minutes: 0,
        seconds: 0,
        repeatOption: "never",
        customRepeatHours: 0,
        customRepeatMinutes: 0,
        customRepeatSeconds: 0,
        notificationTypes: ["browser"]
      });
    } catch (err) {
      console.error("Error creating reminder:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/reminders/${id}`, {
        withCredentials: true
      });
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Error deleting reminder:", err);
    }
  };

  const renderTargetInputs = () => {
    if (form.type === "alert") {
      return (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            🎯 Target
          </label>
          <select
            name="targetType"
            value={form.targetType}
            onChange={handleChange}
            className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm"
          >
            <option value="category">Category</option>
            <option value="domain">Other Domain</option>
          </select>

          {form.targetType === "category" ? (
            <select
              name="targetValue"
              value={form.targetValue}
              onChange={handleChange}
              className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm"
            >
              <option value="productivity">📊 Productivity</option>
              <option value="creativity">🎨 Creativity</option>
              <option value="communication">💬 Communication</option>
              <option value="others">🔧 Others</option>
            </select>
          ) : (
            <input
              type="text"
              name="targetValue"
              value={form.targetValue}
              onChange={handleChange}
              className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm"
              placeholder="e.g. youtube.com"
            />
          )}
        </div>
      );
    } else if (form.type === "block") {
      return (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            🚫 Domain to block
          </label>
          <input
            type="text"
            name="targetValue"
            value={form.targetValue}
            onChange={handleChange}
            className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm"
            placeholder="e.g. facebook.com"
          />
        </div>
      );
    }
    return null;
  };

  const renderRepeatOptions = () => {
    if (form.type === "alert") {
      return (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            🔄 Repeat (after main alert)
          </label>
          <select
            name="repeatOption"
            value={form.repeatOption}
            onChange={handleChange}
            className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm"
          >
            <option value="never">Never</option>
            <option value="hourly">Every Hour</option>
            <option value="10min">Every 10 Minutes</option>
            <option value="custom">Custom</option>
          </select>
          {form.repeatOption === "custom" && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hours</label>
                <input
                  type="number"
                  name="customRepeatHours"
                  value={form.customRepeatHours}
                  onChange={handleChange}
                  placeholder="00"
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
                  placeholder="00"
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
                  placeholder="00"
                  className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm text-center"
                />
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderTimeInput = () => {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          ⏰ Time to trigger {form.type === "block" ? "block" : "alert"}
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Hours</label>
            <input
              type="number"
              name="hours"
              value={form.hours}
              onChange={handleChange}
              placeholder="00"
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
              placeholder="00"
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
              placeholder="00"
              className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm text-center"
            />
          </div>
        </div>
      </div>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "alert": return "🔔";
      case "block": return "🚫";
      case "custom": return "⚡";
      default: return "📝";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
             Smart Reminder Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Set up intelligent reminders to boost your productivity
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="order-2 xl:order-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200 dark:border-emerald-700 p-6 sm:p-8 sticky top-4">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                  ➕
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Reminder</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reminder Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    📋 Reminder Type
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm"
                  >
                    <option value="alert">🔔 Alert</option>
                    <option value="block">🚫 Block</option>
                    <option value="custom">⚡ Custom</option>
                  </select>
                </div>

                {/* Custom Reminder Name */}
                {form.type === "custom" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      🏷️ Reminder Name
                    </label>
                    <input
                      type="text"
                      name="reminderName"
                      value={form.reminderName}
                      onChange={handleChange}
                      className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm"
                      placeholder="e.g. Take a walk"
                    />
                  </div>
                )}

                {/* Reminder Message */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    💬 Reminder Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-3 bg-white text-gray-900 dark:bg-slate-800 dark:text-white rounded-xl border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 shadow-sm resize-none"
                    placeholder="e.g. Take a break and stretch your legs!"
                  />
                </div>

                {renderTargetInputs()}

                {renderTimeInput()}

                {renderRepeatOptions()}

                {/* Notification Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    🔊 Notification Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 cursor-pointer hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors">
                      <input
                        type="checkbox"
                        value="browser"
                        checked={form.notificationTypes.includes("browser")}
                        onChange={handleChange}
                        className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        🌐 Browser
                      </span>
                    </label>
                    <label className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 cursor-pointer hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors">
                      <input
                        type="checkbox"
                        value="sound"
                        checked={form.notificationTypes.includes("sound")}
                        onChange={handleChange}
                        className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                        🔔 Sound
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>✨</span>
                  <span>Create Reminder</span>
                </button>
              </form>
            </div>
          </div>

          {/* Reminders List */}
          <div className="order-1 xl:order-2">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-emerald-200 dark:border-emerald-700 p-6 sm:p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                  📋
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Reminders</h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {reminders.length} reminder{reminders.length !== 1 ? 's' : ''} configured
                  </p>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reminders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No reminders yet</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                      Create your first reminder to get started!
                    </p>
                  </div>
                ) : (
                  reminders.map((reminder) => (
                    <div
                      key={reminder._id}
                      className="bg-white dark:bg-slate-700 rounded-xl shadow-md border border-gray-200 dark:border-slate-600 p-4 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-lg mr-2">{getTypeIcon(reminder.type)}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(reminder.type)}`}>
                              {reminder.type.toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {reminder.reminderName || "Reminder"}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                            {reminder.message}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                              ⏰ {reminder.hours}h {reminder.minutes}m {reminder.seconds}s
                            </span>
                            {reminder.repeatOption === "custom" && (
                              <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                                🔄 {reminder.customRepeatHours}h {reminder.customRepeatMinutes}m {reminder.customRepeatSeconds}s
                              </span>
                            )}
                            {reminder.repeatOption !== "never" && reminder.repeatOption !== "custom" && (
                              <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                                🔄 {reminder.repeatOption}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(reminder._id)}
                          className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div ref={remindersEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminders;