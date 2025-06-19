import React from 'react';
import './index.css'; // Tailwind CSS + global styles
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import Login from './pages/Login'; //login page

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
