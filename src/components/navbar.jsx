import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [showStatsMenu, setShowStatsMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="w-full max-w-7xl flex items-center justify-between py-3 border-b border-gray-700 px-4">
      {/* Left: Logo */}
      <h1 className="text-gray-300 text-xl font-bold">GIS Crimemap</h1>

      {/* Center: Navigation Links */}
      <div className="flex space-x-6 relative">
        <Link to="/" className="text-gray-300 hover:text-white">Home</Link>

        {token && (
          <>
            <Link to="/report" className="text-gray-300 hover:text-white">Report</Link>
            <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>

            {/* Stats Dropdown (Analytics only) */}
            <Link to="/stats" className="text-gray-300 hover:text-white">
              Stats
            </Link>
          </>
        )}

        {/* Admin-specific link */}
        {user?.role === "admin" && (
          <Link to="/admin/dashboard" className="text-gray-300 hover:text-white">Admin</Link>
        )}
      </div>

      {/* Right: Auth */}
      <div className="flex space-x-4 items-center">
        {token ? (
          <>
            <span className="text-gray-300 text-sm">Welcome, {user?.username}</span>
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
            <Link to="/register" className="text-gray-300 hover:text-white">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
