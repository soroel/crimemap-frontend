import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full max-w-5xl flex items-center py-3 border-b border-gray-700">
      {/* Left: Logo */}
      <h1 className="text-gray-300 text-xl font-bold">GIS Crimemap</h1>

      {/* Centered Navigation Links */}
      <div className="flex-1 flex justify-center space-x-6">
        <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
        <Link to="/map" className="text-gray-300 hover:text-white">Map</Link>
        <Link to="/report" className="text-gray-300 hover:text-white">Report</Link>
        <Link to="/stats" className="text-gray-300 hover:text-white">Stats</Link>
        <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
      </div>

      {/* Right: Login & Register Links */}
      <div className="flex space-x-4">
        <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
        <Link to="/register" className="text-gray-300 hover:text-white">Register</Link>
      </div>
    </nav>
  );
}
