import React, { useEffect, useState } from "react";
import axios from "axios";
import BarChart from "../components/charts/BarChart";
import AppList from "../components/charts/AppList";
import { trackTimeOnDomain } from "../utils/tracker"; 
import { DateRange } from "react-date-range";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

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
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [logs, setLogs] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("All");

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  const filteredLogs = logs.filter((entry) => {
    const entryDate = new Date(entry.startTime);
    return (
      entryDate >= dateRange[0].startDate &&
      entryDate <= dateRange[0].endDate
    );
  });

  // Domain Groups for dropdown
  const domainGroups = {
    Productivity: ["Notion", "Slack", "Google Docs"],
    Entertainment: ["YouTube", "Netflix", "Spotify"],
    Social: ["Instagram", "Facebook", "Twitter"],
  };

  const domainFilteredLogs = selectedDomain === "All"
    ? filteredLogs
    : filteredLogs.filter((entry) => entry.appName === selectedDomain);

  const categoryMap = {
    Productivity: "#4caf50",
    Communication: "#00bcd4",
    Creativity: "#9c27b0",
    Others: "#ffeb3b",
  };

  const categoryTotals = {};

  domainFilteredLogs.forEach((entry) => {
    const category = entry.category || "Others";
    const minutes = entry.duration ? entry.duration / 60000 : 0;
    if (!categoryTotals[category]) {
      categoryTotals[category] = { category, minutes: 0, color: categoryMap[category] || "#ccc" };
    }
    categoryTotals[category].minutes += minutes;
  });

  const chartData = Object.values(categoryTotals);

  useEffect(() => {
    const stopTracking = trackTimeOnDomain("Dashboard");

    axios
      .get("http://localhost:3000/api/domain")
      .then((res) => {
        const data = res.data;
        setLogs(data);
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

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Select Date Range</h2>
        <DateRange
          editableDateInputs={true}
          onChange={handleSelect}
          moveRangeOnFirstSelection={false}
          ranges={dateRange}
          className="rounded-lg shadow-md"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by Domain
        </label>
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="p-2 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="All">All</option>
          {Object.entries(domainGroups).map(([groupName, domains]) => (
            <optgroup key={groupName} label={groupName}>
              {domains.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Bar Chart */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="text-md font-semibold mb-2">Screen Time Overview</h2>
          <BarChart data={chartData} />
          <div className="flex justify-around text-sm text-gray-600 dark:text-gray-400 mt-4">
            <div>🟩 Productivity</div>
            <div>🟦 Communication</div>
            <div>🟪 Creativity</div>
            <div>🟨 Others</div>
          </div>
        </div>

        {/* Stats */}
        <StatCard
          title="Time At Work"
          value={
            categoryTotals["Productivity"]
              ? formatDuration(categoryTotals["Productivity"].minutes * 60000)
              : "0 h 0 min"
          }
          color="bg-blue-500"
        />
        <StatCard
          title="Creativity"
          value={
            categoryTotals["Creativity"]
              ? formatDuration(categoryTotals["Creativity"].minutes * 60000)
              : "0 h 0 min"
          }
          color="bg-purple-500"
        />
        <StatCard
          title="Communication"
          value={
            categoryTotals["Communication"]
              ? formatDuration(categoryTotals["Communication"].minutes * 60000)
              : "0 h 0 min"
          }
          color="bg-cyan-400"
        />
        <StatCard
          title="Productivity"
          value={
            categoryTotals["Productivity"]
              ? formatDuration(categoryTotals["Productivity"].minutes * 60000)
              : "0 h 0 min"
          }
          color="bg-pink-400"
        />
        <StatCard
          title="Others"
          value={
            categoryTotals["Others"]
              ? formatDuration(categoryTotals["Others"].minutes * 60000)
              : "0 h 0 min"
          }
          color="bg-green-400"
        />

        {/* App List */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="text-md font-semibold mb-2">Applications</h2>
          <div className="h-48 overflow-y-auto">
            <AppList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;