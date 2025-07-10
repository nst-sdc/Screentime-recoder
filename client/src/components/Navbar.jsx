import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      await logout();
      navigate("/login");
    }
  };

  if (isLoading) {
    return (
      <nav className="flex items-center justify-between px-8 py-3 shadow-md bg-[#075E54] dark:bg-[#1f2c33] border-b border-green-800 dark:border-[#2a3942]">
        <div className="text-white">Loading...</div>
      </nav>
    );
  }

  return (
    <nav className="flex items-center justify-between px-8 py-3 shadow-md bg-[#075E54] dark:bg-[#1f2c33] border-b border-green-800 dark:border-[#2a3942]">
      {/* Left-side links */}
      <ul className="flex gap-6 list-none">
        <li>
          <Link
            to="/"
            className="relative px-3 py-1.5 rounded-full text-[#e1f2f1] dark:text-[#e1f2f1] text-base font-semibold tracking-wide hover:bg-white hover:bg-opacity-10 hover:text-white transition-colors duration-200 shadow-sm"
          >
            Home
          </Link>
        </li>

        {!isAuthenticated && (
          <>
            <li>
              <Link
                to="/login"
                className="relative px-3 py-1.5 rounded-full text-[#e1f2f1] text-base font-semibold tracking-wide hover:bg-white hover:bg-opacity-10 hover:text-white transition-colors duration-200"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="relative px-3 py-1.5 rounded-full text-[#e1f2f1] text-base font-semibold tracking-wide hover:bg-white hover:bg-opacity-10 hover:text-white transition-colors duration-200"
              >
                Register
              </Link>
            </li>
          </>
        )}

        {isAuthenticated && (
          <li>
            <Link
              to="/dashboard"
              className="relative px-3 py-1.5 rounded-full text-[#e1f2f1] text-base font-semibold tracking-wide hover:bg-white hover:bg-opacity-10 hover:text-white transition-colors duration-200"
            >
              Dashboard
            </Link>
          </li>
        )}
      </ul>

      {/* Right-side user info, logout, and theme toggle */}
      <div className="flex items-center space-x-4">
        {isAuthenticated && user && (
          <div className="flex items-center space-x-3">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            )}
            <span className="text-[#e1f2f1] text-sm font-medium">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg shadow transition-all duration-300"
            >
              Logout
            </button>
          </div>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
