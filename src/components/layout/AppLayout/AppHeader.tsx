import React from 'react';

const AppHeader: React.FC = () => (
  <header className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-5 px-4 shadow-lg">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#6366F1" />
          <text x="16" y="22" textAnchor="middle" fontSize="18" fill="white" fontFamily="Arial" fontWeight="bold">
            A
          </text>
        </svg>
        <span className="font-bold text-2xl tracking-wide">Awesome App</span>
      </div>
      <nav className="hidden md:flex gap-8 text-lg">
        <a href="/" className="hover:underline hover:text-gray-200 transition">
          Home
        </a>
        <a href="/about" className="hover:underline hover:text-gray-200 transition">
          About
        </a>
        <a href="/dashboard" className="hover:underline hover:text-gray-200 transition">
          Dashboard
        </a>
      </nav>
      <div className="flex items-center gap-4">
        <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold shadow hover:bg-indigo-50 transition">Sign In</button>
        <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-indigo-700 transition">Sign Up</button>
      </div>
    </div>
  </header>
);

export default AppHeader;
