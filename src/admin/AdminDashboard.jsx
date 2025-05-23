import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/navbar';
import AlertForm from '../admin/alerts';
import UserForm from './components/UserForm';
import CrimeReportForm from './components/CrimeReportForm';
import Pagination from './components/Pagination';

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
  const [activeTab, setActiveTab] = useState('users');

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCrimeReportModal, setShowCrimeReportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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

    fetchData();

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [isAuthenticated, user, navigate]);

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

  // User CRUD operations
  const handleUserSubmit = async (data) => {
    try {
      console.log("Submitting user data:", { ...data, password: data.password ? '[REDACTED]' : undefined });
      
      if (selectedUser) {
        // Update existing user
        const response = await api.put(`/users/${selectedUser.id}`, data);
        console.log("User update response:", response.data);
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...data } : u));
      } else {
        // Create new user - ensure password is included
        if (!data.password) {
          alert('Password is required for new users');
          return;
        }
        
        // Send request to create user
        console.log("Creating new user with username:", data.username);
        const response = await api.post('/users', {
          username: data.username,
          password: data.password,
          role: data.role || 'user'
        });
        
        console.log("User creation response:", response.data);
        
        // If we got a user object back in the response, add it to our list
        if (response.data && response.data.user) {
          setUsers([...users, response.data.user]);
        } else if (response.data && response.data.success) {
          // Otherwise refresh the user list
          fetchData();
        }
      }
      
      // Close modal and reset selection
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("User operation error:", err);
      const errorMessage = err.response?.data?.error || err.message || 'An unknown error occurred';
      alert('Failed to ' + (selectedUser ? 'update' : 'create') + ' user: ' + errorMessage);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  // Crime Report CRUD operations
  const handleCrimeReportSubmit = async (data) => {
    try {
      if (selectedCrimeReport) {
        await api.put(`/admin/crime-reports/${selectedCrimeReport.id}`, data);
        setCrimeReports(reports => reports.map(r => 
          r.id === selectedCrimeReport.id ? { ...r, ...data } : r
        ));
      } else {
        const response = await api.post('/admin/crime-reports', data);
        setCrimeReports([...crimeReports, response.data]);
      }
      setShowCrimeReportModal(false);
      setSelectedCrimeReport(null);
    } catch (err) {
      alert('Failed to ' + (selectedCrimeReport ? 'update' : 'create') + ' report: ' + err.message);
    }
  };

  const handleDeleteCrimeReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`/admin/crime-reports/${reportId}`);
      setCrimeReports(reports => reports.filter(r => r.id !== reportId));
    } catch (err) {
      alert('Failed to delete report: ' + err.message);
    }
  };

  // Alert CRUD operations are already handled in AlertForm component

  if (!isAuthenticated || !user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Tabs menu */}
        <div className="flex space-x-6 mb-6 border-b border-gray-700">
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            User Management
          </TabButton>
          <TabButton active={activeTab === 'crimeReports'} onClick={() => setActiveTab('crimeReports')}>
            Crime Reports
          </TabButton>
          <TabButton active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')}>
            Alerts Management
          </TabButton>
        </div>

        {/* Users Section */}
        {activeTab === 'users' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <StatCard title="Users" value={users.length} loading={loading.users} error={error.users} />
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setShowUserModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add New User
              </button>
            </div>
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
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(item);
                          setShowUserModal(true);
                        }}
                        className="text-yellow-400 hover:text-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(item.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  ),
                },
              ]}
              loading={loading.users}
              error={error.users}
            />
          </>
        )}

        {/* Crime Reports Section */}
        {activeTab === 'crimeReports' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <StatCard
                title="Crime Reports"
                value={crimeReports.length}
                loading={loading.crimeReports}
                error={error.crimeReports}
              />
              <button
                onClick={() => {
                  setSelectedCrimeReport(null);
                  setShowCrimeReportModal(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add New Report
              </button>
            </div>
            <DataTable
              title="Crime Reports"
              data={crimeReports}
              columns={[
                { header: 'Category', accessor: 'category' },
                { header: 'Location', accessor: 'location' },
                { header: 'Status', accessor: 'status' },
                {
                  header: 'Actions',
                  accessor: 'actions',
                  cell: (_, item) => (
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCrimeReport(item);
                          setShowCrimeReportModal(true);
                        }}
                        className="text-yellow-400 hover:text-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCrimeReport(item.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  ),
                },
              ]}
              loading={loading.crimeReports}
              error={error.crimeReports}
            />
          </>
        )}

        {/* Alerts Section */}
        {activeTab === 'alerts' && (
          <AlertForm alerts={alerts} onUpdate={fetchData} />
        )}

        {/* User Modal */}
        {showUserModal && (
          <Modal
            title={selectedUser ? 'Edit User' : 'Create New User'}
            onClose={() => {
              setShowUserModal(false);
              setSelectedUser(null);
            }}
          >
            <UserForm
              user={selectedUser}
              onSubmit={handleUserSubmit}
              onCancel={() => {
                setShowUserModal(false);
                setSelectedUser(null);
              }}
            />
          </Modal>
        )}

        {/* Crime Report Modal */}
        {showCrimeReportModal && (
          <Modal
            title={selectedCrimeReport ? 'Edit Crime Report' : 'Create New Crime Report'}
            onClose={() => {
              setShowCrimeReportModal(false);
              setSelectedCrimeReport(null);
            }}
          >
            <CrimeReportForm
              report={selectedCrimeReport}
              onSubmit={handleCrimeReportSubmit}
              onCancel={() => {
                setShowCrimeReportModal(false);
                setSelectedCrimeReport(null);
              }}
            />
          </Modal>
        )}
      </main>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`py-2 px-4 border-b-2 ${
      active
        ? 'border-blue-500 text-blue-500'
        : 'border-transparent text-gray-400 hover:text-gray-300'
    }`}
  >
    {children}
  </button>
);

const StatCard = ({ title, value, loading, error }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <h3 className="text-lg font-medium text-gray-300">{title}</h3>
    {loading ? (
      <p>Loading...</p>
    ) : error ? (
      <p className="text-red-500">{error}</p>
    ) : (
      <p className="text-2xl font-bold">{value}</p>
    )}
  </div>
);

const DataTable = ({ title, data, columns, loading, error }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
      <h3 className="text-lg font-medium text-gray-300 mb-4">{title}</h3>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <table className="min-w-full">
            <thead>
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-700' : 'bg-gray-750'}>
                  {columns.map((col, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap text-sm">
                      {col.cell ? col.cell(j, item) : item[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > itemsPerPage && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-gray-800 rounded-lg max-w-lg w-full">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300"
        >
          ✕
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

export default AdminDashboard;
