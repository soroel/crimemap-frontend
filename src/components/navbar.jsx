import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload(); // Refresh to update UI state
  };

  return (
    <nav className="w-full max-w-5xl flex items-center py-3 border-b border-gray-700">
      {/* Left: Logo */}
      <h1 className="text-gray-300 text-xl font-bold">GIS Crimemap</h1>

      {/* Centered Navigation Links */}
      <div className="flex-1 flex justify-center space-x-6">
        <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
        <Link to="/map" className="text-gray-300 hover:text-white">Map</Link>
        
        {token && (
          <>
            <Link to="/report" className="text-gray-300 hover:text-white">Report</Link>
            <Link to="/stats" className="text-gray-300 hover:text-white">Stats</Link>
            <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
          </>
        )}

        {/* Admin-specific link */}
        {user?.role === "admin" && (
          <Link to="/admin/dashboard" className="text-gray-300 hover:text-white">Admin</Link>
        )}
      </div>

      {/* Right: Auth Links */}
      <div className="flex space-x-4">
        {token ? (
          <>
            <span className="text-gray-300">Welcome, {user?.username}</span>
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