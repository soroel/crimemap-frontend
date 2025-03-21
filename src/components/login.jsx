import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Import Axios

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Fix: Added missing state
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const response = await axios.post(
            "http://127.0.0.1:5000/api/login",
            { username, password },
            { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );

        console.log("✅ Login successful:", response.data);
        localStorage.setItem("token", response.data.token); // Store token
        navigate("/"); 

    } catch (err) {
        console.error("❌ Login error:", err.response?.data || err.message);
        setError(err.response?.data?.error || "Login failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 mb-3 bg-gray-700 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 bg-gray-700 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full p-2 bg-blue-500 rounded" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
