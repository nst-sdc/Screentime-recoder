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

// Optional icon mapping
const iconMap = {
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

const AppList = ({ data = [] }) => {
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
        const icon = iconMap[name] || <FaChrome />;

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

export default AppList;

