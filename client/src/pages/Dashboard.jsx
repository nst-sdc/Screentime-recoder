import React, { useEffect, useState } from "react";
import axios from "axios";
import ActivityHeatmap from "../components/charts/ActivityHeatmap";
import AppList from "../components/charts/AppList";
import { trackTimeOnDomain } from "../utils/tracker";
import CategoryChart from "../components/charts/CategoryChart";
import ProductivityTrendChart from "../components/charts/ProductivityTrendChart";
import SunburstChart from "../components/charts/SunburstChart";
import { trackTimeOnDomain } from "../utils/tracker";
import dashboardService from "../services/dashboardService";

const formatDuration = ms => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} h ${minutes} min`;
};

const domainToCategory = {
  "youtube.com": "Entertainment",
  "netflix.com": "Entertainment",
  "github.com": "Work",
  "cloud.mongodb.com": "Work",
  "localhost": "Work",
  "stackoverflow.com": "Work",
  "mail.google.com": "Communication",
  "gmail.com": "Communication",
  "meet.google.com": "Communication",
  "accounts.google.com": "Communication",
  "discord.com": "Social",
  "twitter.com": "Social",
  "facebook.com": "Social",
  "linkedin.com": "Work",
  "stackoverflow.com": "Work",
  "mail.google.com": "Communication",
  "gmail.com": "Communication",
  "discord.com": "Social",
  "twitter.com": "Social",
  "facebook.com": "Social",
  "linkedin.com": "Work"
};

const Dashboard = () => {
  const [summary, setSummary] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [timeRange, setTimeRange] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transform raw activity data for enhanced components
  const transformActivityData = rawData => {
    if (!Array.isArray(rawData)) return [];

    return rawData.map((item, index) => {
      // Ensure productivity is a valid number
      const rawProductivity =
        item.avgProductivityScore || item.productivity || 5;
      const productivity =
        typeof rawProductivity === "number"
          ? Math.min(10, Math.max(0, rawProductivity))
          : Math.min(10, Math.max(0, parseFloat(rawProductivity) || 5));

      return {
        id: item._id || `item-${index}`,
        domain: item._id || item.domain || "Unknown",
        totalDuration: Math.max(0, item.totalDuration || item.duration || 0),
        duration: Math.max(0, item.totalDuration || item.duration || 0),
        sessions: Math.max(1, item.sessionCount || item.sessions || 1),
        productivity,
        lastVisit: item.lastVisit || item.updatedAt || new Date(),
        categoryName: domainToCategory[item._id] || "Other"
      };
    });
  };

  // Transform category data for charts
  const transformCategoryData = rawData => {
    if (!Array.isArray(rawData)) return [];

    const categoryMap = {};
    let total = 0;

    rawData.forEach(item => {
      const category = domainToCategory[item._id] || "Other";
      const duration = item.totalDuration || 0;

      if (!categoryMap[category]) {
        categoryMap[category] = {
          category,
          minutes: 0,
          totalDuration: 0,
          sessions: 0,
          domains: new Set(),
          productivity: []
        };
      }

      categoryMap[category].minutes += Math.round(duration / 60000);
      categoryMap[category].totalDuration += duration;
      categoryMap[category].sessions += item.sessionCount || 1;
      categoryMap[category].domains.add(item._id);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found");
      return;
    }

    const stopTracking = trackTimeOnDomain("Dashboard");

    const fetchSummary = () => {
      axios
        .get("http://localhost:3000/api/activity/summary", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const data = res.data.data || [];
          setSummary(data);
          const total = data.reduce((sum, item) => sum + (item.totalDuration || 0), 0);
          setTotalDuration(total);
        })
        .catch((err) => console.error("Error fetching activity summary:", err));
      // Safely handle productivity values
      const productivityValue = item.avgProductivityScore || 5;
      const validProductivity =
        typeof productivityValue === "number"
          ? Math.min(10, Math.max(0, productivityValue))
          : Math.min(10, Math.max(0, parseFloat(productivityValue) || 5));

      categoryMap[category].productivity.push(validProductivity);
      total += duration;
    });

    return Object.values(categoryMap).map(cat => ({
      ...cat,
      domains: cat.domains.size,
      avgProductivity:
        cat.productivity.length > 0
          ? parseFloat(
              (cat.productivity.reduce((a, b) => a + b, 0) /
                cat.productivity.length).toFixed(1)
            )
          : 5.0,
      color: getCategoryColor(cat.category)
    }));
  };

  // Get category color mapping
  const getCategoryColor = category => {
    const colorMap = {
      Entertainment: "#EF4444",
      Work: "#10B981",
      Communication: "#3B82F6",
      Social: "#F59E0B",
      Other: "#6B7280"
    };
    return colorMap[category] || "#6B7280";
  };

  useEffect(
    () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      const stopTracking = trackTimeOnDomain("Dashboard");

      const fetchSummary = async () => {
        try {
          setLoading(true);
          setError(null);

          const response = await dashboardService.getActivitySummary(timeRange);

          if (response && response.data) {
            const rawData = response.data;
            const transformedSummary = transformActivityData(rawData);
            const transformedCategories = transformCategoryData(rawData);

            setSummary(transformedSummary);
            setCategorySummary(transformedCategories);

            const total = rawData.reduce(
              (sum, item) => sum + (item.totalDuration || 0),
              0
            );
            setTotalDuration(total);
          } else {
            const directResponse = await axios.get(
              "http://localhost:3000/api/activity/summary",
              {
                headers: { Authorization: `Bearer ${token}` },
                params: { timeRange }
              }
            );

            const rawData = directResponse.data.data || [];
            const transformedSummary = transformActivityData(rawData);
            const transformedCategories = transformCategoryData(rawData);
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000);

    return () => {
      clearInterval(interval);
      stopTracking();
    };
  }, []);

  // Group durations by category
  const groupedByCategory = summary.reduce((acc, item) => {
    const domain = item._id || "Unknown";
    const category = domainToCategory[domain] || "Others";
    const duration = item.totalDuration || 0;
    acc[category] = (acc[category] || 0) + duration;
    return acc;
  }, {});

  const chartData = Object.entries(groupedByCategory)
    .filter(([_, duration]) => duration > 0)
    .map(([category, duration]) => ({
      category,
      minutes: Math.round(duration / 60000),
      color: "#4caf50",
    }));
=======
            setSummary(transformedSummary);
            setCategorySummary(transformedCategories);

            const total = rawData.reduce(
              (sum, item) => sum + (item.totalDuration || 0),
              0
            );
            setTotalDuration(total);
          }
        } catch (err) {
          console.error("Error fetching dashboard data:", err);
          setError("Failed to load dashboard data");
          setSummary([]);
          setCategorySummary([]);
          setTotalDuration(0);
        } finally {
          setLoading(false);
        }
      };

      fetchSummary();

      return () => {
        stopTracking();
      };
    },
    [timeRange]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4 w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i =>
              <div
                key={i}
                className="h-64 bg-gray-300 dark:bg-gray-700 rounded-lg"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1">Dashboard Usage</h1>
            <p className="text-md text-gray-600 dark:text-gray-300">
              Total Tracked Time: {formatDuration(totalDuration)}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Bar Chart */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="text-md font-semibold mb-2">Usage by Category</h2>
          {chartData.length > 0 ? (
            <>
              <BarChart data={chartData} rotateLabels />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Chart */}
        <CategoryChart timeRange={timeRange} />

        {/* Productivity Trends */}
        <ProductivityTrendChart timeRange={timeRange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sunburst Hierarchy Chart */}
        <SunburstChart timeRange={timeRange} />

        {/* Traditional Bar Chart for comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <ActivityHeatmap timeRange={timeRange} />
        </div>
      </div>
        {/* Stat Cards */}
        <StatCard title="Time At Work" value={formatDuration(totalDuration)} color="bg-blue-500" />
        <StatCard title="Productivity" value="Coming soon" color="bg-green-500" />
        <StatCard title="Communication" value="Coming soon" color="bg-cyan-500" />
        <StatCard title="Others" value="Coming soon" color="bg-purple-500" />

        {/* App List */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="text-md font-semibold mb-2">
            Recent Activity Summary
          </h2>
          <div className="h-48 overflow-y-auto">
            <AppList
              data={summary}
              showProductivity={true}
              maxItems={8}
              sortBy="duration"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
