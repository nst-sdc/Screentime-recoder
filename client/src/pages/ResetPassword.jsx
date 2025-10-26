import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  const { api } = useAuth();
  const query = useQuery();
  const token = query.get('token');
  const email = query.get('email');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, { password });
      setMessage(res.data.message || 'Password reset');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
        {message && <div className="mb-4 text-sm text-green-600">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" required className="w-full p-2 border rounded" />
          <button className="w-full py-2 bg-green-600 text-white rounded">Set new password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
