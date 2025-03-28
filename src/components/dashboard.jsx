import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Bell, Users } from "lucide-react";
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

        const [reportsResponse, alertsResponse] = await Promise.all([
          axios.get("http://127.0.0.1:5000/api/user/reports", { headers }),
          axios.get("http://127.0.0.1:5000/api/alerts", { headers }),
        ]);

        // Destructure the nested responses
        setReports(reportsResponse.data?.reports || reportsResponse.data || []);
        setAlerts(alertsResponse.data?.alerts || []);
        
      } catch (err) {
        console.error("❌ Fetch error:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to fetch data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Enhanced Alert Display
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <Navbar />
      <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>

      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reports Section - unchanged */}
          <Card className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Users className="mr-2" /> Your Reports
            </h3>
            {reports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border border-gray-700">
                  <thead>
                    <tr className="bg-gray-700 text-gray-200">
                      <th className="p-3">ID</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-b border-gray-700">
                        <td className="p-3">{report.id}</td>
                        <td className="p-3">{report.category}</td>
                        <td className="p-3">{report.status}</td>
                        <td className="p-3">
                          {new Date(report.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">No reports found.</p>
            )}
          </Card>



          {/* Enhanced Alerts Section */}
          <Card className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Bell className="mr-2" /> Alerts
            </h3>
            {alerts.length > 0 ? (
              <ul className="space-y-2">
                {alerts.map((alert) => (
                  <li 
                    key={alert.id} 
                    className="p-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{alert.title || 'Security Alert'}</h4>
                        <p className="text-sm text-gray-300">{alert.message}</p>
                      </div>
                      {alert.severity && (
                        <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No alerts available.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;