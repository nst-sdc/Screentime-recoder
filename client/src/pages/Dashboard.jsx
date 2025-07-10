import React, { useEffect, useState } from "react";
import axios from "axios";
import BarChart from "../components/charts/BarChart";
import AppList from "../components/charts/AppList";
import { trackTimeOnDomain } from "../utils/tracker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const StatCard = ({ title, value, color }) => (
  <div className={`p-4 rounded-xl shadow-md text-white ${color}`}>
    <h4 className="text-sm">{title}</h4>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDuration = (ms) => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} h ${minutes} min`;
};

const Dashboard = () => {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [duration, setDuration] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Dashboard Usage</h1>
        <p className="text-md text-gray-600 dark:text-gray-300">
          Start: {startTime ? formatTime(startTime) : "Loading..."} — End:{" "}
          {endTime ? formatTime(endTime) : "Loading..."}
        </p>
        <p className="text-md text-gray-600 dark:text-gray-300">
          Duration: {duration ? formatDuration(duration) : "Loading..."}
        </p>
      </header>

      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Date Range:
        </label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
          className="border px-2 py-1 rounded text-sm"
        />
        <span className="text-gray-500">to</span>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="End Date"
          className="border px-2 py-1 rounded text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Active Days" value="6 / 7" color="bg-indigo-500" />
        <StatCard title="Total Usage" value="7 h 34 min" color="bg-blue-500" />
        <StatCard title="Avg. Time" value="1 h 15 min" color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Bar Chart */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="text-md font-semibold mb-2">Screen Time Overview</h2>
          <BarChart
            data={[
              { category: "Productivity", minutes: 163, color: "#4caf50" },
              { category: "Communication", minutes: 81, color: "#00bcd4" },
              { category: "Creativity", minutes: 152, color: "#9c27b0" },
              { category: "Others", minutes: 41, color: "#ffeb3b" },
            ]}
          />
          <div className="flex justify-around text-sm text-gray-600 dark:text-gray-400 mt-4">
            <div>🟩 Productivity</div>
            <div>🟦 Communication</div>
            <div>🟪 Creativity</div>
            <div>🟨 Others</div>
          </div>
        </div>

        {/* App List */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="text-md font-semibold mb-2">Applications</h2>
          <div className="h-48 overflow-y-auto">
            <AppList />
          </div>
        </div>
      </div>

      <footer className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2025 Screentime Recorder. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;
