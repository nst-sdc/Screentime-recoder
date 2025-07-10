import React, { useEffect, useState } from "react";
import axios from "axios";
import BarChart from "../components/charts/BarChart";
import AppList from "../components/charts/AppList";
import { trackTimeOnDomain } from "../utils/tracker"; 
import { trackTimeOnDomain } from "../utils/tracker";

const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
};

const StatCard = ({ title, value, color }) => (
  <div className={`p-4 rounded-xl shadow-md text-white ${color}`}>
    <h4 className="text-sm">{title}</h4>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [apps, setApps] = useState([]);
  const [totalTabs, setTotalTabs] = useState(0);

  // Summary data from backend (e.g., /api/activity/summary)
  const fetchSummary = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.warn("No token found");
      return;
    }

    try {
      const res = await axios.get("http://localhost:3000/api/activity/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSummary(res.data.data || []);
      const total = res.data.data.reduce(
        (sum, item) => sum + (item.totalDuration || 0),
        0
      );
      setTotalDuration(total);
    } catch (err) {
      console.error("Error fetching activity summary:", err);
    }
  };

  // Live activity from extension (e.g., /api/activity/active)
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
      setTotalTabs(activityData.length);
    } catch (err) {
      console.error("❌ Error fetching live activity data:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found");
      return;
    }

    const fetchSummary = () => {
      axios
        .get("http://localhost:3000/api/activity/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setSummary(res.data.data || []);
          const total = res.data.data.reduce(
            (sum, item) => sum + (item.totalDuration || 0),
            0
          );
          setTotalDuration(total);
        })
        .catch((err) => {
          console.error("Error fetching activity summary:", err);
        });
    };

    fetchSummary(); // Initial load
    const intervalId = setInterval(fetchSummary, 30000); // Every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const chartData = summary.map((item) => ({
    category: item._id || "Unknown",
    minutes: Math.round((item.totalDuration || 0) / 60000),
    color: "#4caf50", // Customize if needed
  }));
    const stopTracking = trackTimeOnDomain("Dashboard");

    axios
      .get("http://localhost:3000/api/domain")
      .then((res) => {
        const data = res.data;
        if (data.length > 0) {
          const lastEntry = data[data.length - 1];
          setStartTime(lastEntry.startTime);
          setEndTime(lastEntry.endTime);
          setDuration(lastEntry.duration);
        }
      })
      .catch((err) => console.error("Error fetching domain logs:", err));

    return () => stopTracking();
    fetchSummary();
    fetchLiveActivity();
    const interval = setInterval(fetchLiveActivity, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const chartData = summary.map((item) => ({
    category: item._id || "Unknown",
    minutes: Math.round((item.totalDuration || 0) / 60000),
    color: "#4caf50",
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Dashboard Usage</h1>
        <p className="text-md text-gray-600 dark:text-gray-300">
          Total Tracked Time: {formatDuration(totalDuration)}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Chart Section */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="text-md font-semibold mb-2">Top Websites</h2>
          {chartData.length > 0 ? (
            <>
              <BarChart data={chartData} />
              <div className="text-sm mt-4 text-gray-600 dark:text-gray-400">
                {chartData.map((d) => (
                  <div key={d.category}>
                    🟩 {d.category}: {d.minutes} min
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>No activity found. Make sure tracking is working.</p>
          )}
        </div>

        {/* Stat Cards */}
        {/* Summary Stats */}
        <StatCard
          title="Time At Work"
          value={formatDuration(totalDuration)}
          color="bg-blue-500"
        />
        <StatCard
          title="Productivity"
          value="Coming soon"
          color="bg-green-500"
        />
        <StatCard
          title="Communication"
          value="Coming soon"
          color="bg-cyan-500"
        />
        <StatCard title="Others" value="Coming soon" color="bg-purple-500" />
          <h2 className="text-md font-semibold mb-2">Screen Time Overview</h2>
        <StatCard title="Productivity" value="Coming soon" color="bg-green-500" />
        <StatCard title="Communication" value="Coming soon" color="bg-cyan-500" />
        <StatCard title="Others" value="Coming soon" color="bg-purple-500" />

        {/* Summary App List */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="text-md font-semibold mb-2">Recent Activity</h2>
          <div className="h-48 overflow-y-auto">
            <AppList data={summary} />
          </div>
        </div>

        {/* Live Activity Apps */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="text-md font-semibold mb-2">Live Activity (Last 30s)</h2>
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

      {/* Applications List */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
        <h2 className="text-md font-semibold mb-2">Applications</h2>
        <div className="h-60 overflow-y-auto">
          <AppList apps={apps} />
        </div>
      </div>

      {/* Reminders */}
      <div
        className="col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-all cursor-pointer mt-6"
        onClick={() => (window.location.href = "/reminders")}
      >
        <h2 className="text-md font-semibold mb-2">⏰ Reminders</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Set break alerts, usage limits, and custom reminders.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
