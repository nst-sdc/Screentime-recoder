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
          <Link
            to="/register"
            className="mt-10 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition"
          >
            Get Started
          </Link>
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
        <Link
          to="/register"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium transition"
        >
          Create Free Account
        </Link>
      </div>

      <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2025 Screentime Recorder.
      </footer>
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
