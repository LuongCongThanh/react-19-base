const Navbar: React.FC = () => (
  <nav className="w-full bg-white shadow-md py-3 px-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#6366F1" />
          <text x="16" y="21" textAnchor="middle" fontSize="16" fill="white" fontFamily="Arial" fontWeight="bold">
            A
          </text>
        </svg>
        <span className="font-bold text-xl text-indigo-700 tracking-wide">Awesome App</span>
      </div>
      <ul className="flex gap-8 text-gray-700 font-medium">
        <li>
          <a href="/" className="hover:text-indigo-600 transition">
            Home
          </a>
        </li>
        <li>
          <a href="/about" className="hover:text-indigo-600 transition">
            About
          </a>
        </li>
        <li>
          <a href="/dashboard" className="hover:text-indigo-600 transition">
            Dashboard
          </a>
        </li>
      </ul>
      <div className="flex items-center gap-3">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition">Sign In</button>
        <button className="bg-gray-100 text-indigo-700 px-4 py-2 rounded-lg shadow hover:bg-indigo-200 transition">Sign Up</button>
      </div>
    </div>
  </nav>
);

export default Navbar;
