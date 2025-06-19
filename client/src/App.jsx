import React from 'react';
import Login from './pages/Login';
import './index.css';

import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <>
      <Navbar />
      <div className="p-4">
        <ThemeToggle />
        <Login />
      </div>
    </>
  );
}

export default App;
