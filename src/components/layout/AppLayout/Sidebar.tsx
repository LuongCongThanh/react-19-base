const Sidebar: React.FC = () => (
  <aside className="fixed inset-0 z-40 flex flex-col bg-gradient-to-b from-indigo-700 via-blue-700 to-purple-700 text-white shadow-2xl min-h-screen w-full md:w-80 py-10 px-6 animate-fade-in">
    <div className="mb-10 flex items-center gap-3">
      <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#6366F1" />
        <text x="16" y="22" textAnchor="middle" fontSize="16" fill="white" fontFamily="Arial" fontWeight="bold">
          A
        </text>
      </svg>
      <span className="font-bold text-2xl tracking-wide">Awesome App</span>
    </div>
    <nav className="flex flex-col gap-8 text-lg font-medium">
      <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-800 transition">
        <span className="material-icons">dashboard</span>
        <span>Dashboard</span>
      </a>
      <a href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-800 transition">
        <span className="material-icons">person</span>
        <span>Profile</span>
      </a>
      <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-800 transition">
        <span className="material-icons">settings</span>
        <span>Settings</span>
      </a>
    </nav>
    <div className="mt-auto pt-10 text-sm text-gray-200 text-center">© 2025 Awesome App</div>
  </aside>
);

export default Sidebar;
