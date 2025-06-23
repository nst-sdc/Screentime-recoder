import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  return (
    <nav style={{ padding: "1rem", backgroundColor: "#333", display: "flex", justifyContent: 'space-between', alignItems: 'center' }}>
      <ul
        style={{
          display: "flex",
          gap: "1rem",
          listStyle: "none",
          color: "white"
        }}
      >
        <li>
          <Link to="/" style={{ color: "white", textDecoration: "none" }}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
            Login
          </Link>
        </li>
        <li>
          <Link
            to="/dashboard"
            style={{ color: "white", textDecoration: "none" }}
          >
            Dashboard
          </Link>
        </li>
      </ul>
      <div style={{ float: "right" }}>
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
