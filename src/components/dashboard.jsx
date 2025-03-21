import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "../components/ui/card";
import { Bell, Users } from "lucide-react";
import Navbar from "./navbar";

const UserDashboard = () => {
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token"); // Retrieve the stored token

      if (!token) {
        console.error("❌ No token found! User is not authenticated.");
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send JWT token
        };

        // Fetch User Reports
        const reportsResponse = await axios.get(
          "http://127.0.0.1:5000/api/user/reports",
          { headers }
        );
        setReports(reportsResponse.data);

        // Fetch Alerts
        const alertsResponse = await axios.get(
          "http://127.0.0.1:5000/api/alerts",
          { headers }
        );
        setAlerts(alertsResponse.data);

      } catch (err) {
        console.error("❌ Fetch error:", err.response?.data || err.message);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // useEffect must be outside and depend on an empty array (runs once)

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <Navbar />
      <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Report Tracking */}
          <Card className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Users className="mr-2" /> Your Reports
            </h3>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th>ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-700">
                    <td>{report.id}</td>
                    <td>{report.type}</td>
                    <td>{report.status}</td>
                    <td>{report.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Alerts */}
          <Card className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Bell className="mr-2" /> Alerts
            </h3>
            <ul>
              {alerts.map((alert, index) => (
                <li key={index} className="border-b border-gray-700 py-2">
                  {alert.message}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
