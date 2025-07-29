import React from 'react';

const AppFooter: React.FC = () => (
  <footer className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-6 px-4 mt-auto shadow-lg">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#6366F1" />
          <text x="16" y="21" textAnchor="middle" fontSize="16" fill="white" fontFamily="Arial" fontWeight="bold">
            A
          </text>
        </svg>
        <span className="font-semibold text-lg tracking-wide">Awesome App</span>
      </div>
      <nav className="flex gap-6 text-sm">
        <a href="/about" className="hover:underline hover:text-gray-200 transition">
          About
        </a>
        <a href="/dashboard" className="hover:underline hover:text-gray-200 transition">
          Dashboard
        </a>
        <a href="/contact" className="hover:underline hover:text-gray-200 transition">
          Contact
        </a>
      </nav>
      <div className="text-xs text-gray-200">© 2025 Awesome App. All rights reserved.</div>
    </div>
  </footer>
);

export default AppFooter;
