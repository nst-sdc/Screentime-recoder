import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import Home from './pages/Home';
import Login from './pages/Login';
import Registration from './pages/Registration';

function App() {
  return (
    <>
      <Navbar />
      <div className="p-4">
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          {/* <Route path="/dashboard" element={<Dashboard />} />  */}
        </Routes>
      </div>
    </>
  );
}

export default App;
