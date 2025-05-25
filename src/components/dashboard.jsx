import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Bell, Users, AlertCircle, Loader2, Settings, BarChart, FileText, Home } from "lucide-react";
import Navbar from "./navbar";
import Pagination from "../admin/components/Pagination";

const UserDashboard = () => {
  const [reports, setReports] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [unreadAlerts, setUnreadAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
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
          axios.get(`http://127.0.0.1:5000/api/user/reports?page=${currentPage}&per_page=5`, { headers }),
          axios.get("http://127.0.0.1:5000/api/alerts", { headers }),
        ]);

        // Handle reports data with pagination
        if (reportsResponse.data?.reports) {
          setReports(reportsResponse.data.reports);
          setTotalPages(reportsResponse.data.total_pages || 1);
        } else {
          setReports(reportsResponse.data || []);
          setTotalPages(1);
        }
        
        const alertsData = alertsResponse.data?.alerts || alertsResponse.data || [];
        setAlerts(alertsData);

        // Get read alerts from localStorage
        const readAlertIds = JSON.parse(localStorage.getItem('readAlerts') || '[]');
        const unread = alertsData.filter(alert => !readAlertIds.includes(alert.id));
        setUnreadAlerts(unread);
        
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError(err.response?.data?.error || "Failed to fetch data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, currentPage]);

  const markAlertAsRead = (alertId) => {
    const readAlerts = JSON.parse(localStorage.getItem('readAlerts') || '[]');
    if (!readAlerts.includes(alertId)) {
      const newReadAlerts = [...readAlerts, alertId];
      localStorage.setItem('readAlerts', JSON.stringify(newReadAlerts));
      setUnreadAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }
  };

  const markAllAlertsAsRead = () => {
    const allAlertIds = alerts.map(alert => alert.id);
    localStorage.setItem('readAlerts', JSON.stringify(allAlertIds));
    setUnreadAlerts([]);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-500/90 text-white',
      medium: 'bg-yellow-500/90 text-gray-900',
      low: 'bg-blue-500/90 text-white',
      default: 'bg-gray-500/90 text-white'
    };
    return colors[severity?.toLowerCase()] || colors.default;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500 text-gray-900',
      verified: 'bg-green-600 text-white',
      rejected: 'bg-red-600 text-white',
      default: 'bg-gray-500 text-white',
    };
    return colors[status?.toLowerCase()] || colors.default;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'reports':
        return (
          <Card className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="mr-2 h-5 w-5" /> Your Reports
              </h3>
              <button 
                onClick={() => navigate("/report")}
                className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded"
              >
                + New Report
              </button>
            </div>
            
            {reports.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-200">
                      <tr>
                        <th className="p-3">Category</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Status</th>
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
                          <td className="p-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                              {report.status || "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
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
        );

      case 'alerts':
        return (
          <Card className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Bell className="mr-2 h-5 w-5" /> Recent Alerts
              </h3>
              {unreadAlerts.length > 0 && (
                <button
                  onClick={markAllAlertsAsRead}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-md border-l-4 ${getSeverityColor(alert.severity).replace('bg', 'border')} ${
                      unreadAlerts.some(a => a.id === alert.id) ? 'bg-gray-700/50' : ''
                    }`}
                    onClick={() => markAlertAsRead(alert.id)}
                  >
                    <div className="flex justify-between">
                      <h4 className="font-medium flex items-center">
                        {alert.title}
                        {unreadAlerts.some(a => a.id === alert.id) && (
                          <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </h4>
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
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No alerts to display</p>
            )}
          </Card>
        );

      case 'settings':
        return (
          <Card className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="mr-2 h-5 w-5" /> Alert Preferences
            </h3>
            <p className="text-sm text-gray-400">
              Customize how and when you'd like to receive alerts. (Feature coming soon)
            </p>
            <div className="mt-4">
              <ul className="space-y-2 text-sm">
                <li>• SMS Notifications (default: enabled)</li>
                <li>• Email Alerts (coming soon)</li>
                <li>• High-Severity Only Mode (coming soon)</li>
              </ul>
            </div>
          </Card>
        );

      default: // overview
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
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

            {/* Recent Reports Preview */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800 p-4 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Recent Reports</h3>
                  <button 
                    onClick={() => setActiveSection('reports')}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View All
                  </button>
                </div>
                {reports.slice(0, 3).map((report) => (
                  <div key={report.id} className="border-b border-gray-700 last:border-0 py-2">
                    <div className="flex justify-between items-center">
                      <span>{report.category}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                        {report.status || "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        );
    }
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
      <div className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">User Dashboard</h2>

        {/* Dashboard Navigation */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="flex space-x-8">
              <button 
              onClick={() => setActiveSection('overview')}
              className={`pb-4 px-2 relative ${
                activeSection === 'overview'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Overview
              </span>
              </button>
                <button 
              onClick={() => setActiveSection('reports')}
              className={`pb-4 px-2 relative ${
                activeSection === 'reports'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </span>
                </button>
            <button
              onClick={() => setActiveSection('alerts')}
              className={`pb-4 px-2 relative ${
                activeSection === 'alerts'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Alerts
                {unreadAlerts.length > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadAlerts.length}
                      </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveSection('settings')}
              className={`pb-4 px-2 relative ${
                activeSection === 'settings'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </span>
            </button>
          </nav>
              </div>

        {/* Content Section */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
