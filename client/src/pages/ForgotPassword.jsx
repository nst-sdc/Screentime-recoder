import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const { api } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message || 'If an account exists, a reset link will be sent');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
        {message && <div className="mb-4 text-sm text-green-600">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" required className="w-full p-2 border rounded" />
          <button className="w-full py-2 bg-green-600 text-white rounded">Send reset link</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
