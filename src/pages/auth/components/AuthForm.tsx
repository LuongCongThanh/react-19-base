// src/pages/auth/components/AuthForm.tsx
import React from 'react';

interface AuthFormProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({ title, onSubmit, children, loading, error }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow w-80">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {children}
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded" disabled={loading}>
        {loading ? 'Processing...' : title}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  </div>
);

export default AuthForm;
