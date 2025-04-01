import { useState } from 'react';
import axios from 'axios';

export default function AlertForm() {
  const [form, setForm] = useState({
    username: "all",
    type: "crime",
    title: "",
    message: "",
    severity: "medium"
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/alerts", 
        form, 
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        alert("Alert created successfully!");
        setForm({ 
          username: "all",
          type: "crime",
          title: "",
          message: "",
          severity: "medium"
        });
      }
    } catch (err) {
      if (err.response?.data?.details) {
        // Handle field-specific validation errors
        setErrors(err.response.data.details);
      } else {
        alert(`Error: ${err.response?.data?.error || err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Alert</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Target User */}
        <div>
          <label className="block text-sm font-medium mb-1">Target User</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({...form, username: e.target.value})}
            placeholder="Username or 'all'"
            className={`w-full p-2 border ${errors.username ? 'border-red-500' : 'border-gray-600'} bg-gray-900 text-white rounded`}
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
        </div>
        
        {/* Alert Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Alert Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({...form, type: e.target.value})}
            className={`w-full p-2 border ${errors.type ? 'border-red-500' : 'border-gray-600'} bg-gray-900 text-white rounded`}
          >
            <option value="crime">Crime Alert</option>
            <option value="weather">Weather Alert</option>
            <option value="safety">Safety Tip</option>
            <option value="emergency">Emergency</option>
          </select>
          {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Title*</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({...form, title: e.target.value})}
            placeholder="Alert Title"
            className={`w-full p-2 border ${errors.title ? 'border-red-500' : 'border-gray-600'} bg-gray-900 text-white rounded`}
            required
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium mb-1">Message*</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({...form, message: e.target.value})}
            placeholder="Detailed alert message"
            rows={4}
            className={`w-full p-2 border ${errors.message ? 'border-red-500' : 'border-gray-600'} bg-gray-900 text-white rounded`}
            required
          ></textarea>
          {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium mb-1">Severity</label>
          <select
            value={form.severity}
            onChange={(e) => setForm({...form, severity: e.target.value})}
            className={`w-full p-2 border ${errors.severity ? 'border-red-500' : 'border-gray-600'} bg-gray-900 text-white rounded`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          {errors.severity && <p className="text-red-500 text-sm mt-1">{errors.severity}</p>}
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Sending...' : 'Send Alert'}
        </button>
      </form>
    </div>
  );
}