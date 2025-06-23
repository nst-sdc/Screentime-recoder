import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // backend/JWT integration here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-50 dark:from-[#121b22] dark:to-[#121b22] px-6 py-24 relative">
      {/* Logo Top Left */}
      <div className="absolute top-6 left-8">
        <h1 className="text-xl font-semibold text-green-700 dark:text-whatsDark-text">
          ScreenRecorder{" "}
          <span className="text-sm text-gray-500">
            (logo/title yet to be made)
          </span>
        </h1>
      </div>

      <div className="w-full max-w-7xl h-[620px] grid grid-cols-1 md:grid-cols-2 gap-14 bg-white dark:bg-[#1f2c33] shadow-2xl rounded-2xl overflow-hidden border border-green-200">
        {/* Left Side: Login Form */}
        <div className="flex flex-col justify-center px-14 py-12">
          <h2 className="text-4xl font-bold text-green-700 dark:text-whatsDark-text mb-4">
            Welcome Back
          </h2>
          <p className="text-gray-600 dark:text-whatsDark-text text-lg mb-8">
            Login to manage your time and tasks efficiently.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-lg bg-white text-black dark:bg-[#2a3942] dark:text-whatsDark-text focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-lg bg-white text-black dark:bg-[#2a3942] dark:text-whatsDark-text focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="text-right text-sm">
              <a href="#" className="text-green-600 hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg rounded-lg transition duration-300"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-600 dark:text-whatsDark-text">
            Don’t have an account?{" "}
            <span
              className="text-green-600 font-medium cursor-pointer hover:underline"
              onClick={() => navigate("/register")}
            >
              Register Now
            </span>
          </div>
        </div>

        {/* Right Side: Image Placeholder */}
        <div className="flex flex-col items-center justify-center bg-green-100 dark:bg-[#1f2c33] p-12 space-y-6">
          <img
            src=""
            alt="Login page image yet to be decided"
            className="w-80 h-80 object-contain rounded-lg shadow-md border border-green-200"
          />
          <h2 className="text-2xl font-semibold text-green-800 dark:text-whatsDark-text text-center">
            Effortlessly manage your time and productivity
          </h2>
          <p className="text-green-700 dark:text-whatsDark-text text-center max-w-sm">
            Stay on top of your tasks, track progress, and achieve more — all in
            one place.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
