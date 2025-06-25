import React from "react";
import BarChart from "../components/charts/BarChart";
import AppList from "../components/charts/AppList";

const StatCard = ({ title, value, color }) => (
  <div className={`p-4 rounded-xl shadow-md text-white ${color}`}>
    <h4 className="text-sm">{title}</h4>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-800 dark:bg-gray-900 dark:text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Usage Yesterday, 24 June</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400">7 h 34 min</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Main usage chart area */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-xl shadow-md p-4 dark:bg-gray-800">
          <h2 className="text-md font-semibold mb-2">Screen Time Overview</h2>
          <BarChart
            data={[
              { category: "Productivity", minutes: 163, color: "#4caf50" },
              { category: "Communication", minutes: 81, color: "#00bcd4" },
              { category: "Creativity", minutes: 152, color: "#9c27b0" },
              { category: "Others", minutes: 41, color: "#ffeb3b" },
            ]}
          />
          <div className="flex justify-around text-sm text-gray-600 dark:text-gray-300 mt-4">
            <div>🟦 Productivity</div>
            <div>🟩 Communication</div>
            <div>🟪 Creativity</div>
            <div>🟨 Others</div>
          </div>
        </div>

        {/* Stat cards */}
        <StatCard title="Time At Work" value="2 h 43 min" color="bg-blue-500" />
        <StatCard title="Creativity" value="2 h 32 min" color="bg-purple-500" />
        <StatCard title="Communication" value="1 h 21 min" color="bg-cyan-400" />
        <StatCard title="Productivity" value="1 h 21 min" color="bg-pink-400" />
        <StatCard title="Others" value="41 min" color="bg-green-400" />

        {/* Additional charts area */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white rounded-xl shadow-md p-4 dark:bg-gray-800">
          <h2 className="text-md font-semibold mb-2">Applications</h2>
          <div className="h-48 overflow-y-auto">
            <AppList />
          </div>
        </div>

        {/* <div className="bg-white rounded-xl shadow-md p-4"> */}
          {/* <h2 className="text-md font-semibold mb-2">Sales By Referrer</h2>
          <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
            [ Donut Chart Placeholder ]
          </div> */}
        {/* </div> */}

        {/* <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="text-md font-semibold mb-2">Web Statistics</h2>
          <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
            [ Line Chart Placeholder ]
          </div> */}
        {/* </div> */}

        {/* <div className="bg-white rounded-xl shadow-md p-4"> */}
          {/* <h2 className="text-md font-semibold mb-2">Costs</h2> */}
          {/* <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center text-gray-400"> */}
            {/* [ Bar Chart Placeholder ] */}
          {/* </div> */}
        {/* </div> */}
      </div>

      <footer className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2025 Screentime Recorder. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;