import React from 'react';

const PublicHeader: React.FC = () => (
  <header className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white py-5 px-4 shadow-lg">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <span className="font-bold text-2xl tracking-wide">Welcome to Awesome App</span>
      <nav className="hidden md:flex gap-8 text-lg">
        <a href="/" className="hover:underline hover:text-gray-200 transition">
          Home
        </a>
        <a href="/login" className="hover:underline hover:text-gray-200 transition">
          Login
        </a>
        <a href="/register" className="hover:underline hover:text-gray-200 transition">
          Register
        </a>
      </nav>
    </div>
  </header>
);

export default PublicHeader;
