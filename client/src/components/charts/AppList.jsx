import React from "react";
import { FaChrome, FaSafari, FaEdge, FaFigma, FaMicrosoft } from "react-icons/fa";
import { SiAdobeillustrator, SiMessenger } from "react-icons/si";

const apps = [
  { name: "Figma", time: "4 h 43 min", icon: <FaFigma /> },
  { name: "Safari Browser", time: "1 h 37 min", icon: <FaSafari /> },
  { name: "Chrome", time: "1 h 12 min", icon: <FaChrome /> },
  { name: "Adobe Illustrator", time: "57 min", icon: <SiAdobeillustrator /> },
  { name: "Microsoft Edge", time: "22 min", icon: <FaEdge /> },
  { name: "Office", time: "11 min", icon: <FaMicrosoft /> },
  { name: "Line Messenger", time: "7 min", icon: <SiMessenger /> },
];

const AppList = () => (
  <ul className="space-y-2 text-sm text-gray-700">
    {apps.map((app, idx) => (
      <li key={idx} className="flex justify-between items-center border-b pb-1">
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