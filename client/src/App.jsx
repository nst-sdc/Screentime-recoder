import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import Home from './pages/Home';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          </Routes>
        <Footer />
    </>
  );
}

export default App;
