import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-green-50 text-gray-800">
      <header className="p-6 shadow-md flex justify-between items-center">
        <h1 className="text-3xl font-bold">Screentime Recorder</h1>
        <div>
          <Link to="/login" className="mr-4 text-green-600 hover:underline">Login</Link>
          <Link to="/register" className="text-green-600 hover:underline">Sign Up</Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="bg-white p-8 rounded shadow-md">
          <h2 className="text-4xl font-semibold mb-4">Track Your Screentime, Stay Productive</h2>
          <p className="mb-6 text-lg">Easily monitor how much time you spend on screens and improve your digital habits.</p>
          <Link to="/register" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
            Get Started
          </Link>
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-gray-500">
        © 2025 Screentime Recorder. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;