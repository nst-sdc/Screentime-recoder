import React from 'react';
import './index.css'; // Tailwind CSS + global styles
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import Login from './pages/Login'; //login page
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>

      <Routes>

        <Route path='/' element={ 
          <>
            <Navbar/>
            <ThemeToggle/>
          </> 
        }/>

        <Route path='/home'
        element={ 
          <>
            <Navbar/>
            <ThemeToggle/>
            <Home/> 
          </>
        }/>
        <Route path='/login'
          element={ 
            <>
              <Navbar/>
              <ThemeToggle/>
              <Login/> 
            </>
          }/>
        <Route path='/dashboard'
          element={ 
            <>
              <Navbar/>
              <ThemeToggle/>
              <Dashboard/> 
            </>
          }/>
      </Routes>

    </Router>
  );
}

export default App;  
