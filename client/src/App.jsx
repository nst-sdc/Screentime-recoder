import React from 'react';
import './index.css'; // Tailwind CSS + global styles
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import Login from './pages/Login'; //login page
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow p-4">
          <ThemeToggle />
          <Login />
        </div>
        <Footer />
      </div>
    </>
  );
}

export default App;  
