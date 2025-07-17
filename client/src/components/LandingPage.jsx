import React from "react";
import { Link } from "react-router-dom";
import bgVideo from "../assets/final.mp4";
import {
  FaClock,
  FaChartLine,
  FaBullseye,
  FaMoon,
  FaLock,
  FaEye,
  FaLaptopCode
} from "react-icons/fa";

const features = [
  {
    icon: <FaClock className="text-green-500 text-2xl" />,
    title: "Track Time Automatically",
    description:
      "Monitor your screen usage with detailed analytics and insights."
  },
  {
    icon: <FaChartLine className="text-pink-500 text-2xl" />,
    title: "Visual Analytics",
    description: "See detailed breakdowns and daily/weekly usage graphs."
  },
  {
    icon: <FaBullseye className="text-yellow-500 text-2xl" />,
    title: "Productivity Goals",
    description: "Set screen time limits and stay focused."
  },
  {
    icon: <FaMoon className="text-purple-500 text-2xl" />,
    title: "Dark Mode Ready",
    description: "Use comfortably at night with dark theme support."
  },
  {
    icon: <FaLock className="text-green-600 text-2xl" />,
    title: "Private & Secure",
    description: "Your activity data stays on your device, always encrypted."
  }
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-50 dark:from-[#121b22] dark:to-[#121b22] text-gray-900 dark:text-white px-6 py-12 transition-colors duration-300">
      <div className="relative w-full py-16 px-6 overflow-hidden rounded-md">
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10" />

        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover brightness-50 z-0"
        >
          <source src={bgVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent animate-pulse">
            Reclaim Your Screentime
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-100 max-w-2xl mx-auto">
            Screentime Recorder helps you understand and improve your digital
            habits — with live analytics, goal tracking, and full privacy.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition"
            >
              Get Started
            </Link>
            <a
              href="/extension.zip"
              download="screentime-recorder-extension.zip"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition flex items-center gap-2"
            >
              <FaLaptopCode className="text-lg" />
              Download Extension
            </a>
          </div>
        </div>
      </div>

      <section className="py-20 px-8 bg-white/10 dark:bg-white/5 mt-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          What Screentime Recorder Does ?
        </h2>
        <div className="max-w-4xl mx-auto relative border-l-4 border-green-400 dark:border-green-500 pl-6 space-y-12">
          <FeatureItem
            icon={<FaEye />}
            title="Monitors Your Activity"
            desc="Tracks every tab and URL you visit with detailed logging."
          />
          <FeatureItem
            icon={<FaChartLine />}
            title="Visualizes Usage"
            desc="Smart dashboard helps you see patterns and productivity dips."
          />
          <FeatureItem
            icon={<FaLaptopCode />}
            title="Chrome Extension"
            desc="Auto-syncs your browser activity with a backend database."
          />
          <FeatureItem
            icon={<FaLock />}
            title="Private by Design"
            desc="Data is stored securely. You control what’s tracked."
          />
        </div>
      </section>

      {/* Extension Download Section */}
      <section className="py-16 px-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 mt-16 rounded-2xl">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-full">
              <FaLaptopCode className="text-4xl text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Install Chrome Extension
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Download our Chrome extension to automatically track your browsing
            activity. Simple installation, instant sync with your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/extension.zip"
              download="screentime-recorder-extension.zip"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition flex items-center gap-3 text-lg"
            >
              <FaLaptopCode className="text-xl" />
              Download Extension
            </a>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Compatible with Chrome & Edge
            </div>
          </div>
          <div className="mt-8 bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 text-left max-w-2xl mx-auto">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Installation Steps:
            </h4>
            <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>1. Download the extension zip file</li>
              <li>2. Open Chrome and go to chrome://extensions/</li>
              <li>3. Enable "Developer mode" (top right)</li>
              <li>4. Click "Load unpacked" and select the extracted folder</li>
              <li>5. Sign in to start tracking your activity</li>
            </ol>
          </div>
        </div>
      </section>

      {/* cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {features.map((feature, idx) =>
          <div
            key={idx}
            className="bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 rounded-xl p-6 text-left shadow hover:scale-[1.02] transition"
          >
            <div>
              {feature.icon}
            </div>
            <h3 className="mt-3 text-xl font-semibold text-gray-800 dark:text-white">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
              {feature.description}
            </p>
          </div>
        )}
      </div>

      <div className="text-center mt-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to be more mindful?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Join hundreds taking control of their screen time today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/register"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium transition"
          >
            Create Free Account
          </Link>
          <a
            href="/extension.zip"
            download="screentime-recorder-extension.zip"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition flex items-center gap-2"
          >
            <FaLaptopCode />
            Get Extension
          </a>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }) =>
  <div className="flex items-start space-x-4">
    <div className="mt-1 text-green-500 dark:text-green-400">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-gray-700 dark:text-gray-300">
        {desc}
      </p>
    </div>
  </div>;

export default LandingPage;
