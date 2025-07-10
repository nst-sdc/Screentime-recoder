import React from "react";
import {
  FaChrome,
  FaSafari,
  FaEdge,
  FaFigma,
  FaMicrosoft,
} from "react-icons/fa";
import {
  SiAdobeillustrator,
  SiMessenger,
} from "react-icons/si";

const iconMapA = {
  "chatgpt.com": <FaMicrosoft />,
  "github.com": <FaChrome />,
  "localhost": <FaSafari />,
  "cloud.mongodb.com": <FaFigma />,
  "accounts.google.com": <SiMessenger />,
};

const formatDuration = (ms) => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} h ${minutes} min`;
};

export const AppListA = ({ data = [] }) => {
  if (data.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No activity data available.
      </p>
    );
  }

  return (
    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
      {data.map((item, idx) => {
        const name = item._id || "Unknown";
        const duration = formatDuration(item.totalDuration || 0);
        const icon = iconMapA[name] || <FaChrome />;

        return (
          <li
            key={idx}
            className="flex justify-between items-center border-b pb-1 border-gray-300 dark:border-gray-600"
          >
            <div className="flex items-center space-x-2">
              <span>{icon}</span>
              <span>{name}</span>
            </div>
            <span>{duration}</span>
          </li>
        );
      })}
    </ul>
  );
};

const iconMapB = {
  Chrome: <FaChrome />,
  Edge: <FaEdge />,
  Safari: <FaSafari />,
  Chat: <SiMessenger />,
  Window: <FaMicrosoft />,
  Figma: <FaFigma />,
  Office: <SiAdobeillustrator />,
};

const AppList = ({ apps }) => (
  <ul className="space-y-2 text-sm text-gray-200">
    {apps && apps.length > 0 ? (
      apps.map((app, idx) => (
        <li
          key={idx}
          className="flex justify-between items-center border-b pb-1 border-gray-600"
        >
          <div className="flex items-center space-x-2">
            <span>{iconMapB[app.name] || "🌀"}</span>
            <span className="truncate max-w-xs">{app.url || app.name}</span>
          </div>
          <span>{Math.floor((app.duration || 0) / 60)} min</span>
        </li>
      ))
    ) : (
      <li>No application data available</li>
    )}
  </ul>
);

export default AppList;

