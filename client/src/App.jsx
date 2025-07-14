import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Dashboard from "./pages/Dashboard";
import AuthSuccess from "./pages/AuthSuccess";
import "./styles/d3.css";
import Logout from "./pages/Logout";
import Footer from "./components/Footer";
import Reminders from "./pages/Reminders";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/reminders" element={<Reminders />} />
      </Routes>
      <Footer />
    </AuthProvider>
  );
}

export default App;
