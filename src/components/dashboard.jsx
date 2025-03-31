import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Bell, Users, AlertCircle, Loader2 } from "lucide-react";
import Navbar from "./navbar";

const UserDashboard = () => {
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      console.debug("🔑 Token from localStorage:", token);

      if (!token) {
        console.warn("❌ No token found! Redirecting to login...");
        setError("Authentication required. Please log in.");
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        console.log("📡 Making API requests...");
        const [reportsResponse, alertsResponse] = await Promise.all([
          axios.get("http://127.0.0.1:5000/api/user/reports", { headers }),
          axios.get("http://127.0.0.1:5000/api/alerts", { headers }),
        ]);

        console.log("📊 Reports response:", reportsResponse.data);
        console.log("🚨 Alerts response:", alertsResponse.data);

        // Handle different response structures
        setReports(reportsResponse.data?.reports || reportsResponse.data || []);
        setAlerts(alertsResponse.data?.alerts || alertsResponse.data || []);
        
      } catch (err) {
        console.error("❌ Fetch error:", err);
        console.error("Error details:", {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });

        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(err.response?.data?.error || "Failed to fetch data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-500/90 text-white',
      medium: 'bg-yellow-500/90 text-gray-900',
      low: 'bg-blue-500/90 text-white',
      default: 'bg-gray-500/90 text-white'
    };
    return colors[severity?.toLowerCase()] || colors.default;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 text-white min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 text-white min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-500 text-center max-w-md">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <Navbar />
      <h2 className="text-2xl font-bold mb-6">User Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Overview Card */}
        <Card className="bg-gray-800 p-4 rounded-lg shadow-lg lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400">Total Reports</p>
              <p className="text-2xl font-bold">{reports.length}</p>
            </div>
            <div>
              <p className="text-gray-400">Active Alerts</p>
              <p className="text-2xl font-bold">{alerts.length}</p>
            </div>
          </div>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reports Section */}
          <Card className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="mr-2 h-5 w-5" /> Your Reports
              </h3>
              <button 
                onClick={() => navigate("/report")}
                className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded"
              >
                + New Report
              </button>
            </div>
            
            {reports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700 text-gray-200">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="p-3">{report.category}</td>
                        <td className="p-3 max-w-xs truncate">{report.description}</td>
                        <td className="p-3 whitespace-nowrap">
                          {new Date(report.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No reports found.</p>
                <button 
                  onClick={() => navigate("/report")}
                  className="mt-2 text-blue-400 hover:text-blue-300"
                >
                  Submit your first report
                </button>
              </div>
            )}
          </Card>

          {/* Alerts Section */}
          <Card className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Bell className="mr-2 h-5 w-5" /> Recent Alerts
            </h3>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-md border-l-4 ${getSeverityColor(alert.severity).replace('bg', 'border')}`}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium">{alert.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
                {alerts.length > 5 && (
                  <button 
                    onClick={() => navigate("/alerts")}
                    className="text-sm text-blue-400 hover:text-blue-300 mt-2"
                  >
                    View all alerts ({alerts.length})
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No alerts to display</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;