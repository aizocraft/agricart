import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import UserManagement from './UserManagement';
import OrderManagement from './OrderManagement';

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsRes = await adminAPI.getStats();
        setStats(statsRes.data);
      } catch (error) {
        console.error('Dashboard error:', error);
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === 'admin') {
      fetchData();
    }
  }, [currentUser]);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl mb-4">Admin access only</h1>
        <p className="mb-4">You need to be logged in as an admin to access this page</p>
        <Link 
          to="/login" 
          className="bg-primary text-white px-6 py-2 rounded hover:bg-green-600 transition"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Navigation Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'orders' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('orders')}
        >
          Order Management
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                <p className="text-2xl font-bold">{stats?.usersCount || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
                <p className="text-2xl font-bold">{stats?.productsCount || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                <p className="text-2xl font-bold">{stats?.ordersCount || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm font-medium">Total Sales</h3>
                <p className="text-2xl font-bold">${stats?.totalSales?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'orders' && <OrderManagement />}
        </>
      )}
    </div>
  );
}