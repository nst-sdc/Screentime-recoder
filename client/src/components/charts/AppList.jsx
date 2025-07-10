import React, { useState } from "react";
import { FaChrome, FaSafari, FaEdge, FaFigma, FaMicrosoft } from "react-icons/fa";
import { SiAdobeillustrator, SiMessenger } from "react-icons/si";

const rawApps = [
  { name: "Chrome", minutes: 190, icon: <FaChrome /> },
  { name: "Edge", minutes: 165, icon: <FaEdge /> },
  { name: "Safari", minutes: 140, icon: <FaSafari /> },
  { name: "Chat", minutes: 75, icon: <SiMessenger /> },
  { name: "Window", minutes: 58, icon: <FaMicrosoft /> },
  { name: "Figma", minutes: 42, icon: <FaFigma /> },
  { name: "Office", minutes: 25, icon: <SiAdobeillustrator /> },
];

const totalMinutes = rawApps.reduce((sum, app) => sum + app.minutes, 0);

const processedApps = rawApps
  .map(app => ({
    ...app,
    time: `${Math.floor(app.minutes / 60)} h ${app.minutes % 60} min`,
    percent: ((app.minutes / totalMinutes) * 100).toFixed(1) + '%',
  }))
  .sort((a, b) => b.minutes - a.minutes);

const AppList = () => {
  const [selectedApp, setSelectedApp] = useState("All");

  const filteredApps =
    selectedApp === "All"
      ? processedApps
      : processedApps.filter((app) => app.name === selectedApp);

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="app-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by App:
        </label>
        <select
          id="app-filter"
          value={selectedApp}
          onChange={(e) => setSelectedApp(e.target.value)}
          className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="All">All</option>
          {processedApps.map((app, idx) => (
            <option key={idx} value={app.name}>{app.name}</option>
          ))}
        </select>
      </div>

      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
        {filteredApps.map((app, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center border-b pb-1 border-gray-300 dark:border-gray-600"
          >
            <div className="flex items-center space-x-2">
              <span>{app.icon}</span>
              <span>{app.name}</span>
            </div>
            <div className="text-right">
              <div>{app.time}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{app.percent}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppList;