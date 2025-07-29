import React, { useState } from 'react';

import useRegister from '@/pages/auth/hooks/useRegister';

const Register: React.FC = () => {
  const { register, loading, error } = useRegister();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(username, password, email);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="mb-2 w-full p-2 border rounded" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-2 w-full p-2 border rounded" />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2 w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default Register;
