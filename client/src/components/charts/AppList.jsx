import React from "react";
import { FaChrome, FaSafari, FaEdge, FaFigma, FaMicrosoft } from "react-icons/fa";
import { SiAdobeillustrator, SiMessenger } from "react-icons/si";

const apps = [
  { name: "Chrome", time: "3 h 10 min", icon: <FaChrome /> },
  { name: "Edge", time: "2 h 45 min", icon: <FaEdge /> },
  { name: "Safari", time: "2 h 20 min", icon: <FaSafari /> },
  { name: "Chat", time: "1 h 15 min", icon: <SiMessenger /> },
  { name: "Window", time: "58 min", icon: <FaMicrosoft /> },
  { name: "Figma", time: "42 min", icon: <FaFigma /> },
  { name: "Office", time: "25 min", icon: <SiAdobeillustrator /> },
];

const AppList = () => (
  <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
    {apps.map((app, idx) => (
      <li key={idx} className="flex justify-between items-center border-b pb-1 border-gray-300 dark:border-gray-600">
        <div className="flex items-center space-x-2">
          <span>{app.icon}</span>
          <span>{app.name}</span>
        </div>
        <span>{app.time}</span>
      </li>
    ))}
  </ul>
);

export default AppList;