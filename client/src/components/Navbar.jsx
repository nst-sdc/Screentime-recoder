import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-3 shadow-md bg-[#075E54] dark:bg-[#1f2c33] border-b border-green-800 dark:border-[#2a3942]">
      {/* Left-side links */}
      <ul className="flex gap-6 list-none">
        {[
          { to: "/", label: "Home" },
          { to: "/login", label: "Login" },
          { to: "/dashboard", label: "Dashboard" },
        ].map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="relative px-3 py-1.5 rounded-full text-[#e1f2f1] dark:text-[#e1f2f1] text-base font-semibold tracking-wide hover:bg-white hover:bg-opacity-10 hover:text-white transition-colors duration-200 shadow-sm"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Right-side theme toggle */}
      <div className="flex items-center">
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
