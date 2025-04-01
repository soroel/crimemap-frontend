import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/navbar';
import AlertForm from '../admin/alerts';

// Create configured axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [crimeReports, setCrimeReports] = useState([]);
  const [loading, setLoading] = useState({
    alerts: false,
    users: false,
    crimeReports: false
  });
  const [error, setError] = useState({
    alerts: null,
    users: null,
    crimeReports: null
  });

  useEffect(() => {
    // Verify admin access
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    // Add request interceptor to include token
    const requestInterceptor = api.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Fetch all data
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, alerts: true }));
        const alertsRes = await api.get('/alerts');
        setAlerts(alertsRes.data.alerts || []);
      } catch (err) {
        setError(prev => ({ ...prev, alerts: err.message }));
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(prev => ({ ...prev, alerts: false }));
      }

      try {
        setLoading(prev => ({ ...prev, users: true }));
        const usersRes = await api.get('/users');
        setUsers(usersRes.data || []);
      } catch (err) {
        setError(prev => ({ ...prev, users: err.message }));
        console.error('Error fetching users:', err);
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }

      try {
        setLoading(prev => ({ ...prev, crimeReports: true }));
        const crimeRes = await api.get('/admin/crime-reports');
        setCrimeReports(crimeRes.data || []);
      } catch (err) {
        setError(prev => ({ ...prev, crimeReports: err.message }));
        console.error('Error fetching crime reports:', err);
      } finally {
        setLoading(prev => ({ ...prev, crimeReports: false }));
      }
    };

    fetchData();

    // Cleanup interceptor
    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null; // Or a loading spinner while redirect happens
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Users" 
            value={users.length} 
            loading={loading.users}
            error={error.users}
          />
          <StatCard 
            title="Crime Reports" 
            value={crimeReports.length} 
            loading={loading.crimeReports}
            error={error.crimeReports}
          />
          <StatCard 
            title="Alerts Sent" 
            value={alerts.length} 
            loading={loading.alerts}
            error={error.alerts}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataTable 
            title="User Management"
            data={users}
            columns={[
              { header: 'Username', accessor: 'username' },
              { header: 'Role', accessor: 'role' }
            ]}
            loading={loading.users}
            error={error.users}
          />
          
          <DataTable 
            title="Recent Crime Reports"
            data={crimeReports}
            columns={[
              { header: 'Type', accessor: 'type' },
              { header: 'Location', accessor: 'location' }
            ]}
            loading={loading.crimeReports}
            error={error.crimeReports}
          />
        </div>

        {/* Alerts Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataTable 
            title="Recent Alerts"
            data={alerts}
            columns={[
              { header: 'Title', accessor: 'title' },
              { header: 'Type', accessor: 'type' },
              { 
                header: 'Severity', 
                accessor: 'severity',
                cell: (value) => (
                  <span className={`font-bold ${
                    value === 'high' ? 'text-red-500' : 
                    value === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {value}
                  </span>
                )
              }
            ]}
            loading={loading.alerts}
            error={error.alerts}
          />
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Send Alerts</h2>
            <AlertForm />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, loading, error }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    {loading ? (
      <div className="animate-pulse h-6 w-1/2 bg-gray-700 rounded"></div>
    ) : error ? (
      <p className="text-red-500 text-sm">Error loading data</p>
    ) : (
      <p className="text-gray-400">{value.toLocaleString()}</p>
    )}
  </div>
);

// Reusable Data Table Component
const DataTable = ({ title, data, columns, loading, error }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    {loading ? (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-4 bg-gray-700 rounded"></div>
        ))}
      </div>
    ) : error ? (
      <p className="text-red-500">Error: {error}</p>
    ) : data.length === 0 ? (
      <p className="text-gray-400">No data available</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              {columns.map(col => (
                <th key={col.header} className="py-2">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map((item, i) => (
              <tr key={i} className="border-b border-gray-700">
                {columns.map(col => (
                  <td key={`${i}-${col.accessor}`} className="py-2">
                    {col.cell ? col.cell(item[col.accessor]) : item[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default AdminDashboard;