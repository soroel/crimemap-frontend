import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        role: "user", // Default role
    });

    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate(); // Initialize navigation

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        console.log("Submitting:", formData); // Debugging

        try {
            const response = await axios.post("http://127.0.0.1:5000/api/register", formData, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });

            console.log("Response:", response.data); // Debugging
            setMessage(response.data.success);

            // Redirect to home page after successful registration
            setTimeout(() => {
                navigate("/");
            }, 2000); // Optional delay for showing success message
        } catch (err) {
            console.error("Error response:", err.response); // Debugging
            setError(err.response?.data?.error || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
            <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center">Register</h2>
                {message && <p className="text-green-400 text-center">{message}</p>}
                {error && <p className="text-red-400 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white"
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        disabled={loading}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
