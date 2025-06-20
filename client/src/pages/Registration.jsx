import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePasswordStrength = (password) => {
    return password.length >= 6; // Basic strength check (you can improve it!)
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!validatePasswordStrength(formData.password)) {
      setError("Password must be at least 6 characters");
      return;
    }

    console.log('Registration successful:', formData);
    // Simulate backend + redirect
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-50 dark:from-[#121b22] dark:to-[#121b22] px-6 py-24 relative">

      {/* Logo */}
      <div className="absolute top-6 left-8">
        <h1 className="text-xl font-semibold text-green-700 dark:text-whatsDark-text">
          ScreenRecorder <span className="text-sm text-gray-500">(logo/title yet to be made)</span>
        </h1>
      </div>

      <div className="w-full max-w-7xl h-auto grid grid-cols-1 md:grid-cols-2 gap-14 bg-white dark:bg-[#1f2c33] shadow-2xl rounded-2xl overflow-hidden border border-green-200">

        {/* Left Form */}
        <div className="flex flex-col justify-center px-14 py-12">
          <h2 className="text-4xl font-bold text-green-700 dark:text-whatsDark-text mb-4">Create Account</h2>
          <p className="text-gray-600 dark:text-whatsDark-text text-lg mb-8">
            Register to start tracking your time efficiently.
          </p>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-lg bg-white dark:bg-[#2a3942] text-black dark:text-whatsDark-text focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-lg bg-white dark:bg-[#2a3942] text-black dark:text-whatsDark-text focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-lg bg-white dark:bg-[#2a3942] text-black dark:text-whatsDark-text focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-lg bg-white dark:bg-[#2a3942] text-black dark:text-whatsDark-text focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <button
              type="submit"
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-lg transition duration-300"
            >
              Register
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-600 dark:text-whatsDark-text">
            Already have an account?{' '}
            <span
              className="text-green-600 font-medium cursor-pointer hover:underline"
              onClick={() => navigate('/login')}
            >
              Login
            </span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col items-center justify-center bg-green-100 dark:bg-[#1f2c33] p-12 space-y-6">
          <h2 className="text-2xl font-semibold text-green-800 dark:text-whatsDark-text text-center">
            Join ScreenRecorder today!
          </h2>
          <p className="text-green-700 dark:text-whatsDark-text text-center max-w-sm">
            Stay productive, track your time and tasks, and hit your goals.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
