import React from 'react';

const PublicFooter: React.FC = () => (
  <footer className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white py-6 px-4 mt-auto shadow-lg">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <span className="font-semibold text-lg tracking-wide">Awesome App</span>
      <nav className="flex gap-6 text-sm">
        <a href="/login" className="hover:underline hover:text-gray-200 transition">
          Login
        </a>
        <a href="/register" className="hover:underline hover:text-gray-200 transition">
          Register
        </a>
      </nav>
      <div className="text-xs text-gray-200">© 2025 Awesome App. All rights reserved.</div>
    </div>
  </footer>
);

export default PublicFooter;
