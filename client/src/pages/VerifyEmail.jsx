import React, { useEffect } from 'react';

const VerifyEmail = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    if (token && email) {
      window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    }
  }, []);
  return null;
};

export default VerifyEmail;
