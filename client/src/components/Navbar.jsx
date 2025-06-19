// client/src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav style={{ padding: '1rem', backgroundColor: '#333' }}>
      <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none', color: 'white' }}>
        <li><Link to="/home" style={{ color: 'white', textDecoration: 'none' }}>Home</Link></li>
        <li><Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link></li>
        <li><Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;


