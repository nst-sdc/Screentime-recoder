import React, { useEffect, useState } from "react";
import axios from "axios";
import BarChart from "../components/charts/BarChart";
import AppList from "../components/charts/AppList";
import { trackTimeOnDomain } from "../utils/tracker";

// Helper to format time
const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

// Helper to format duration
const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
};

// Reusable card
const StatCard = ({ title, value, color }) => (
  <div className={`p-4 rounded-xl shadow-md text-white ${color}`}>
    <h4 className="text-sm">{title}</h4>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const Dashboard = () => {
  const [apps, setApps] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [totalTabs, setTotalTabs] = useState(0);

  const fetchLiveActivity = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/activity/active", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const activityData = res.data.data || [];

      const total = activityData.reduce(
        (sum, curr) => sum + (curr.duration || 0),
        0
      );

      setApps(activityData);
      setTotalDuration(total);
      setTotalTabs(activityData.length);
    } catch (err) {
      console.error("❌ Error fetching live activity data:", err);
    }
  };

  useEffect(() => {
    const stopTracking = trackTimeOnDomain("Dashboard");

    fetchLiveActivity();
    const interval = setInterval(fetchLiveActivity, 30000);

    return () => {
      stopTracking();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Dashboard Usage</h1>
        <p className="text-md text-gray-600 dark:text-gray-300">
          Duration: {formatDuration(totalDuration)}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="text-md font-semibold mb-2">Screen Time Overview</h2>
          <BarChart
            data={
              apps.map((app) => ({
                category: app.domain || app.url || app.title || "Unknown",
                minutes: Math.floor((app.duration || 0) / 60000),
                color: "#4caf50",
              })) || []
            }
          />
          <div className="flex justify-around text-sm text-gray-600 dark:text-gray-400 mt-4">
            <div>🟩 Websites/Apps</div>
          </div>
        </div>

        <StatCard
          title="Total Active Time"
          value={formatDuration(totalDuration)}
          color="bg-blue-500"
        />
        <StatCard title="Active Tabs" value={totalTabs} color="bg-purple-500" />
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <h2 className="text-md font-semibold mb-2">Applications</h2>
        <div className="h-60 overflow-y-auto">
          <AppList apps={apps} />
        </div>

        {/* Reminders Card */}
        <div
          className="col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-all cursor-pointer mt-6"
          onClick={() => window.location.href = "/reminders"}
        >
          <h2 className="text-md font-semibold mb-2">⏰ Reminders</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Set break alerts, usage limits, and custom reminders.
          </p>
        </div>
      </div>

      <footer className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2025 Screentime Recorder. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;
