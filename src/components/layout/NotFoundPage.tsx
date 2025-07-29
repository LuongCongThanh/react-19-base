import React from 'react';

const NotFoundPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100">
    <div className="bg-white rounded-2xl shadow-2xl p-12 flex flex-col items-center animate-fade-in">
      <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-6 drop-shadow-lg">
        404
      </h1>
      <p className="text-2xl text-gray-700 mb-10 font-medium">Oops! Page Not Found</p>
      <a href="/" className="px-10 py-4 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition font-bold text-lg">
        Go Home
      </a>
    </div>
  </div>
);

export default NotFoundPage;
