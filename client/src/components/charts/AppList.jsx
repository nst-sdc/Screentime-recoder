import React from "react";
import { FaChrome, FaSafari, FaEdge, FaFigma, FaMicrosoft } from "react-icons/fa";
import { SiAdobeillustrator, SiMessenger } from "react-icons/si";

const iconMap = {
  Chrome: <FaChrome />,
  Edge: <FaEdge />,
  Safari: <FaSafari />,
  Chat: <SiMessenger />,
  Window: <FaMicrosoft />,
  Figma: <FaFigma />,
  Office: <SiAdobeillustrator />
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
            <span>{iconMap[app.name] || "🌀"}</span>
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
