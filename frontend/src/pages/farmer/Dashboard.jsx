import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import DashboardStats from './components/DashboardStats';
import ProductsTable from './components/ProductsTable';
import OrdersTable from './components/OrdersTable';
import PaymentsTable from './components/PaymentsTable';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    totalSales: 0,
    averageRating: 0
  });

  useDocumentMetadata({
    title: 'Farmer Dashboard',
    description: 'Manage your farm products, orders and payments'
  });

  if (user?.role !== 'farmer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md p-8 space-y-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Access Restricted
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Only authenticated farmers can access this dashboard
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <Link
              to="/login"
              className="w-full px-4 py-2 text-center bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="w-full px-4 py-2 text-center border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'Farmer'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your farm products and track your sales
            </p>
          </div>
          <Link
            to="/farmer/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                clipRule="evenodd" 
              />
            </svg>
            Add New Product
          </Link>
        </div>

        {/* Stats Cards */}
        <DashboardStats stats={stats} />

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {['products', 'orders', 'payments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-green-500 text-green-600 dark:text-green-400 dark:border-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          {activeTab === 'products' && <ProductsTable farmerId={user._id} stats={stats} setStats={setStats} />}
          {activeTab === 'orders' && <OrdersTable farmerId={user._id} />}
          {activeTab === 'payments' && <PaymentsTable farmerId={user._id} />}
        </div>
      </div>
    </div>
  );
}