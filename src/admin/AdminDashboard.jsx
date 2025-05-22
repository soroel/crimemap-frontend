import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/navbar';
import AlertForm from '../admin/alerts';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // States
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [crimeReports, setCrimeReports] = useState([]);

  const [loading, setLoading] = useState({ alerts: false, users: false, crimeReports: false });
  const [error, setError] = useState({ alerts: null, users: null, crimeReports: null });

  // For UI tabs: "users" | "crimeReports" | "alerts"
  const [activeTab, setActiveTab] = useState('users');

  // User edit modal state
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState('');

  // Crime report detail modal state
  const [selectedCrimeReport, setSelectedCrimeReport] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const requestInterceptor = api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    const fetchData = async () => {
      setLoading({ alerts: true, users: true, crimeReports: true });
      try {
        const [alertsRes, usersRes, crimeRes] = await Promise.all([
          api.get('/alerts'),
          api.get('/users'),
          api.get('/admin/crime-reports'),
        ]);
        setAlerts(alertsRes.data.alerts || []);
        setUsers(usersRes.data || []);
        setCrimeReports(crimeRes.data || []);
        setError({ alerts: null, users: null, crimeReports: null });
      } catch (err) {
        setError({
          alerts: err.message || 'Failed to load alerts',
          users: err.message || 'Failed to load users',
          crimeReports: err.message || 'Failed to load crime reports',
        });
      } finally {
        setLoading({ alerts: false, users: false, crimeReports: false });
      }
    };

    fetchData();

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [isAuthenticated, user, navigate]);

  // Update user role handler
  const handleUserEdit = async () => {
    if (!editUser) return;
    try {
      await api.put(`/users/${editUser.id}`, { role: editRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? { ...u, role: editRole } : u))
      );
      setEditUser(null);
      setEditRole('');
    } catch (err) {
      alert('Failed to update user role: ' + err.message);
    }
  };

  // Delete alert handler
  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    try {
      await api.delete(`/alerts/${alertId}`);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      alert('Failed to delete alert: ' + err.message);
    }
  };

  if (!isAuthenticated || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Tabs menu */}
        <div className="flex space-x-6 mb-6 border-b border-gray-700">
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </TabButton>
          <TabButton
            active={activeTab === 'crimeReports'}
            onClick={() => setActiveTab('crimeReports')}
          >
            Crime Reports
          </TabButton>
          <TabButton
            active={activeTab === 'alerts'}
            onClick={() => setActiveTab('alerts')}
          >
            Alerts Management
          </TabButton>
        </div>

        {/* Section content */}
        {activeTab === 'users' && (
          <>
            <StatCard title="Users" value={users.length} loading={loading.users} error={error.users} />
            <DataTable
              title="User Management"
              data={users}
              columns={[
                { header: 'Username', accessor: 'username' },
                { header: 'Role', accessor: 'role' },
                {
                  header: 'Actions',
                  accessor: 'actions',
                  cell: (_, item) => (
                    <button
                      onClick={() => {
                        setEditUser(item);
                        setEditRole(item.role);
                      }}
                      className="text-yellow-400 hover:text-yellow-600"
                    >
                      Edit
                    </button>
                  ),
                },
              ]}
              loading={loading.users}
              error={error.users}
            />
          </>
        )}

        {activeTab === 'crimeReports' && (
          <>
            <StatCard
              title="Crime Reports"
              value={crimeReports.length}
              loading={loading.crimeReports}
              error={error.crimeReports}
            />
            <DataTable
              title="Recent Crime Reports"
              data={crimeReports}
              columns={[
                { header: 'Type', accessor: 'category' },
                { header: 'Location', accessor: 'location' },
                {
                  header: 'Actions',
                  accessor: 'actions',
                  cell: (_, item) => (
                    <button
                      onClick={() => setSelectedCrimeReport(item)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      View Details
                    </button>
                  ),
                },
              ]}
              loading={loading.crimeReports}
              error={error.crimeReports}
            />
          </>
        )}

        {activeTab === 'alerts' && (
          <>
            <StatCard title="Alerts Sent" value={alerts.length} loading={loading.alerts} error={error.alerts} />
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
                    <span
                      className={`font-bold ${
                        value === 'critical'
                          ? 'text-red-700'
                          : value === 'high'
                          ? 'text-red-500'
                          : value === 'medium'
                          ? 'text-yellow-500'
                          : value === 'low'
                          ? 'text-green-500'
                          : 'text-gray-500'
                      }`}
                    >
                      {value}
                    </span>
                  ),
                },
                {
                  header: 'Actions',
                  accessor: 'actions',
                  cell: (_, item) => (
                    <button
                      onClick={() => handleDeleteAlert(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  ),
                },
              ]}
              loading={loading.alerts}
              error={error.alerts}
            />
            <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">Send Alerts</h2>
              <AlertForm />
            </div>
          </>
        )}

        {/* Modals */}
        {editUser && (
          <Modal onClose={() => setEditUser(null)} title={`Edit Role for ${editUser.username}`}>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUserEdit}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
              >
                Save
              </button>
            </div>
          </Modal>
        )}

        {selectedCrimeReport && (
          <Modal onClose={() => setSelectedCrimeReport(null)} title="Crime Report Details">
            <div>
              <p><strong>Category:</strong> {selectedCrimeReport.category}</p>
              <p><strong>Description:</strong> {selectedCrimeReport.description}</p>
              <p><strong>Location:</strong> {selectedCrimeReport.location}</p>
              <p><strong>Date:</strong> {selectedCrimeReport.date}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedCrimeReport(null)}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`pb-2 font-semibold border-b-4 ${
      active ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:text-indigo-300'
    }`}
  >
    {children}
  </button>
);

const StatCard = ({ title, value, loading, error }) => (
  <div className="mb-6 p-4 bg-gray-800 rounded-lg shadow-md w-48 text-center">
    <p className="text-gray-400">{title}</p>
    {loading ? (
      <p>Loading...</p>
    ) : error ? (
      <p className="text-red-500">{error}</p>
    ) : (
      <p className="text-3xl font-bold">{value}</p>
    )}
  </div>
);

const DataTable = ({ title, data, columns, loading, error }) => (
  <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-md p-4">
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    {loading ? (
      <p>Loading...</p>
    ) : error ? (
      <p className="text-red-500">{error}</p>
    ) : data.length === 0 ? (
      <p>No data available.</p>
    ) : (
      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className="border-b border-gray-700 p-2"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-700 cursor-default"
            >
              {columns.map((col) => (
                <td key={col.header} className="p-2 border-b border-gray-700">
                  {col.cell
                    ? col.cell(item[col.accessor], item)
                    : item[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
    <div className="bg-gray-900 p-6 rounded-lg w-96 max-w-full max-h-full overflow-y-auto shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200"
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
      <div>{children}</div>
    </div>
  </div>
);

export default AdminDashboard;
