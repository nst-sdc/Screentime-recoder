import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [message, setMessage] = useState('Verifying...');
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const email = params.get('email');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        setMessage(res.data || 'Email verified');
        setTimeout(() => navigate('/login'), 1500);
      } catch (err) {
        setMessage(err.response?.data || 'Verification failed');
      }
    };
    if (token && email) verify();
  }, [token, email, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded shadow text-center">
        <h2 className="text-xl font-semibold mb-4">Email verification</h2>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
