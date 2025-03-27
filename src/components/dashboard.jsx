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

      console.log("🔑 Token retrieved:", token); // Debugging

      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [reportsResponse, alertsResponse] = await Promise.all([
          axios.get("http://127.0.0.1:5000/api/user/reports", { headers }),
          axios.get("http://127.0.0.1:5000/api/alerts", { headers }),
        ]);

        setReports(reportsResponse.data || []);
        setAlerts(alertsResponse.data || []);
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
          {/* Reports Section */}
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

          {/* Alerts Section */}
          <Card className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Bell className="mr-2" /> Alerts
            </h3>
            {alerts.length > 0 ? (
              <ul className="divide-y divide-gray-700">
                {alerts.map((alert, index) => (
                  <li key={index} className="py-2 px-3 bg-gray-700 rounded-md my-2">
                    {alert.message}
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
