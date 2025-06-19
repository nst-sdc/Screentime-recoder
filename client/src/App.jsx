import React from 'react';
import './index.css'; // Tailwind CSS + global styles
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import Login from './pages/Login'; //login page
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';


function Layout() {
  return (
    <>
      <Navbar />
      <ThemeToggle />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;  
