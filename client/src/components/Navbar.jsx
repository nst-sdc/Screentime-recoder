import React, { useLayoutEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(null);

  useLayoutEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (isDarkMode === null) return null;

  const navGradientStyle = {
    background: isDarkMode
      ? "radial-gradient(circle, rgba(74, 222, 128, 0.67) 0%, rgba(15, 27, 34, 1) 50%)"
      : "radial-gradient(circle, rgba(255, 255, 255, 0.94) 0%, rgba(74, 222, 128, 1) 71%)",
  };

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      await logout();
      navigate("/login");
    }
  };

  return (
    <nav
      style={navGradientStyle}
      className="flex flex-wrap items-center justify-between px-8 py-5 shadow-lg text-gray-900 dark:text-gray-300 pt-4 relative z-10 rounded-b-xl backdrop-blur-lg shadow-inner border border-green-400 dark:border-green-700"
    >
      <ul className="flex flex-wrap gap-4 list-none items-center relative z-20">
  <li className="flex items-center space-x-1">
    <div className="w-6 h-6 flex items-center justify-center text-green-700 dark:text-green-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 24 24"
        stroke="none"
      >
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    </div>
    <Link
      to="/"
      className="relative px-3 py-2 rounded-full text-green-700 dark:text-green-400 text-base font-semibold tracking-wide hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-300 shadow-sm"
    >
      Home
    </Link>
  </li>
  {!isAuthenticated && (
    <>
      <li>
        <Link
          to="/login"
          className="relative px-3 py-2 rounded-lg text-green-900 dark:text-green-400 text-base font-semibold tracking-wide hover:text-green-700 dark:hover:text-green-300 transition-colors duration-300 hover:shadow-lg hover:bg-green-100 dark:hover:bg-green-900"
        >
          Login
        </Link>
      </li>
      <li>
        <Link
          to="/register"
          className="relative px-3 py-2 rounded-lg text-green-900 dark:text-green-400 text-base font-semibold tracking-wide hover:text-green-700 dark:hover:text-green-300 transition-colors duration-300 hover:shadow-lg hover:bg-green-100 dark:hover:bg-green-900"
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
        className="relative px-3 py-2 rounded-lg text-green-900 dark:text-green-400 text-base font-semibold tracking-wide hover:text-green-700 dark:hover:text-green-300 transition-colors duration-300 hover:shadow-lg hover:bg-green-100 dark:hover:bg-green-900"
      >
        Dashboard
      </Link>
    </li>
  )}
</ul>


      <div className="flex items-center space-x-4 sm:space-x-5 mt-3 sm:mt-0 relative z-20 text-sm sm:text-base">
        {isAuthenticated && user && (
          <div className="flex items-center space-x-3 sm:space-x-4">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="w-9 h-9 rounded-full border-2 border-green-500"
              />
            )}
            <span className="text-green-900 dark:text-green-400 font-semibold truncate max-w-[120px]">
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="ml-1 sm:ml-3 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm rounded-lg shadow-lg transition-all duration-300"
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
