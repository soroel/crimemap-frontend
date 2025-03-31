import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AdminDashboard mounted - verification check');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      console.warn('AdminDashboard: Invalid access detected');
      navigate('/');
    }
  }, [navigate]);

  console.log('Rendering AdminDashboard content');
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-2">User Management</h3>
            <p className="text-gray-600">Manage system users</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-2">Crime Reports</h3>
            <p className="text-gray-600">Review all reports</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-2">System Settings</h3>
            <p className="text-gray-600">Configure application</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;