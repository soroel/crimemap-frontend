import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AlertForm({ alerts: initialAlerts, onUpdate }) {
  const [form, setForm] = useState({
    username: "all",
    type: "crime",
    title: "",
    message: "",
    severity: "medium"
  });

  const [alerts, setAlerts] = useState(initialAlerts || []);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const { api } = useAuth();

  useEffect(() => {
    if (initialAlerts) {
      setAlerts(initialAlerts);
    }
  }, [initialAlerts]);

  const resetForm = () => {
    setForm({
      username: "all",
      type: "crime",
      title: "",
      message: "",
      severity: "medium"
    });
    setEditingAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      if (editingAlert) {
        // Update existing alert
        const response = await api.put(
          `/admin/alerts/${editingAlert.id}`,
          form
        );
        
        if (response.data && response.data.success) {
          // Update alerts list with the updated data
          const updatedAlert = {
            ...editingAlert,
            ...form,
            updated_at: new Date().toISOString()
          };
          setAlerts(alerts.map(alert => 
            alert.id === editingAlert.id ? updatedAlert : alert
          ));
          alert("Alert updated successfully!");
          resetForm();
        } else {
          throw new Error(response.data?.error || response.data?.message || 'Failed to update alert');
        }
      } else {
        // Create new alert
        const response = await api.post('/admin/alerts', form);
        if (response.status === 201) {
          // Add new alert to list if we have the response data
          if (response.data && response.data.alert) {
            setAlerts([response.data.alert, ...alerts]);
          } else {
            // Create a new alert object with current timestamp
            const newAlert = {
              ...form,
              id: Date.now(), // Temporary ID if not provided by server
              created_at: new Date().toISOString()
            };
            setAlerts([newAlert, ...alerts]);
          }
          alert("Alert created successfully!");
          resetForm();
        } else {
          throw new Error(response.data?.error || response.data?.message || 'Failed to create alert');
        }
      }
    } catch (err) {
      console.error('Error submitting alert:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to submit alert';
      alert(`Error: ${errorMessage}`);
      setErrors(err.response?.data?.details || {});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (alert) => {
    // Scroll form into view
    const formElement = document.querySelector('#alertForm');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }

    // Set form data
    setForm({
      username: alert.username || "all",
      type: alert.type || "crime",
      title: alert.title || "",
      message: alert.message || "",
      severity: alert.severity || "medium"
    });
    setEditingAlert(alert);
  };

  const handleDelete = async (alertId) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) {
      return;
    }

    try {
      const response = await api.delete(`/admin/alerts/${alertId}`);
      if (response.status === 200) {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
        alert("Alert deleted successfully!");
      }
    } catch (err) {
      alert(`Error deleting alert: ${err.response?.data?.error || err.message}`);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-500/90 text-white',
      medium: 'bg-yellow-500/90 text-gray-900',
      low: 'bg-blue-500/90 text-white',
      critical: 'bg-red-700/90 text-white',
      default: 'bg-gray-500/90 text-white'
    };
    return colors[severity?.toLowerCase()] || colors.default;
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-white">Alert Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts List - Left Side */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Sent Alerts</h3>
          {alerts.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-lg">{alert.title}</h4>
                      <p className="text-sm text-gray-400">
                        Target: {alert.username || 'all'} | Type: {alert.type}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-3">{alert.message}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleEdit(alert)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">No alerts to display</p>
            </div>
          )}
        </div>

        {/* Alert Form - Right Side */}
        <div className="lg:sticky lg:top-4">
          <form id="alertForm" onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-6">
            <h3 className="text-xl font-semibold border-b border-gray-700 pb-2">
              {editingAlert ? 'Edit Alert' : 'Create New Alert'}
            </h3>

            <div className="space-y-4">
        {/* Target User */}
        <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Target User</label>
          <input
            type="text"
            value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Username or 'all'"
                  className={`w-full p-2 border ${errors.username ? 'border-red-500' : 'border-gray-700'} bg-gray-900 text-white rounded`}
          />
                {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>
        
        {/* Alert Type */}
        <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Alert Type</label>
          <select
            value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className={`w-full p-2 border ${errors.type ? 'border-red-500' : 'border-gray-700'} bg-gray-900 text-white rounded`}
          >
            <option value="crime">Crime Alert</option>
            <option value="weather">Weather Alert</option>
            <option value="safety">Safety Tip</option>
            <option value="emergency">Emergency</option>
          </select>
                {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
        </div>

        {/* Title */}
        <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Title*</label>
          <input
            type="text"
            value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Alert Title"
                  className={`w-full p-2 border ${errors.title ? 'border-red-500' : 'border-gray-700'} bg-gray-900 text-white rounded`}
            required
          />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        {/* Message */}
        <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Message*</label>
          <textarea
            value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
            placeholder="Detailed alert message"
                  className={`w-full p-2 border ${errors.message ? 'border-red-500' : 'border-gray-700'} bg-gray-900 text-white rounded`}
            required
          ></textarea>
                {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
        </div>

        {/* Severity */}
        <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Severity</label>
          <select
            value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className={`w-full p-2 border ${errors.severity ? 'border-red-500' : 'border-gray-700'} bg-gray-900 text-white rounded`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
                {errors.severity && <p className="text-red-500 text-sm">{errors.severity}</p>}
              </div>
        </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
        <button 
          type="submit"
          disabled={isSubmitting}
                className={`flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Sending...' : editingAlert ? 'Update Alert' : 'Send Alert'}
              </button>
              {editingAlert && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                >
                  Cancel Edit
        </button>
              )}
            </div>
      </form>
        </div>
      </div>
    </div>
  );
}