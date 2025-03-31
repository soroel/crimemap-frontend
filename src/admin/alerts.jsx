// AdminAlertForm.jsx
import { useState } from 'react';
import axios from 'axios';

export default function AlertForm() {
  const [form, setForm] = useState({
    username: "all", // Default to all users
    type: "crime",
    title: "",
    message: "",
    severity: "medium"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/admin/alerts", form, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      alert("Alert created successfully!");
      setForm({ ...form, title: "", message: "" }); // Reset form
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Alert</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Target User</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({...form, username: e.target.value})}
            placeholder="username or 'all'"
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label>Alert Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({...form, type: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="crime">Crime Alert</option>
            <option value="safety">Safety Tip</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        {/* ... other fields ... */}

        <button 
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send Alert
        </button>
      </form>
    </div>
  );
}