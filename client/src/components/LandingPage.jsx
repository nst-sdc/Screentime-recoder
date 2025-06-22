import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-green-50 text-gray-800 dark:bg-whatsDark-bg dark:text-whatsDark-text">
      <header className="p-6 shadow-md flex justify-between items-center">
        <h1 className="text-3xl font-bold">Screentime Recorder</h1>
        <div>
          <Link to="/login" className="mr-4 text-green-600 hover:underline">Login</Link>
          <Link to="/register" className="text-green-600 hover:underline">Sign Up</Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md">
          <h2 className="text-4xl font-semibold mb-4">Track Your Screentime, Stay Productive</h2>
          <p className="mb-6 text-lg">Easily monitor how much time you spend on screens and improve your digital habits.</p>
          <Link to="/register" className="bg-whatsLight-primary dark:bg-whatsDark-secondary text-white px-6 py-3 rounded-lg hover:opacity-90 transition">
            Get Started
          </Link>
        </div>
        <div className="mt-12 max-w-3xl text-left">
          <h3 className="text-2xl font-semibold mb-4 text-green-700">Why Choose Screentime Recorder?</h3>
          <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
            <li>🕒 Track daily and weekly screen time effortlessly</li>
            <li>📊 Get detailed usage analytics</li>
            <li>🎯 Set productivity goals and achieve them</li>
            <li>🌙 Seamless dark mode for late-night usage</li>
            <li>🔒 Your data stays private and secure</li>
          </ul>
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-gray-500">
        © 2025 Screentime Recorder. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;