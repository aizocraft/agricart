/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { productAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    totalSales: 0,
    averageRating: 0
  });

  useDocumentMetadata({
    title: 'Farmer Dashboard',
    description: 'Manage your farm products and sales'
  });

  // Fetch farmer products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?._id || user?.role !== 'farmer') return;
      
      const response = await productAPI.getFarmerProducts(user._id);
      const productsData = response.data?.products || response.data || [];
      
      setProducts(productsData);
      updateDashboardStats(productsData);
    } catch (err) {
      handleFetchError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  // Update dashboard statistics
  const updateDashboardStats = (productsData) => {
    const outOfStock = productsData.filter(p => p.stock <= 0).length;
    const totalSales = productsData.reduce((sum, p) => sum + (p.numSold || 0), 0);
    const avgRating = productsData.length > 0 
      ? productsData.reduce((sum, p) => sum + (p.rating || 0), 0) / productsData.length
      : 0;

    setStats({
      totalProducts: productsData.length,
      outOfStock,
      totalSales,
      averageRating: parseFloat(avgRating.toFixed(1))
    });
  };

  const handleFetchError = (err) => {
    const errorMsg = err.response?.data?.message || err.message || 'Failed to load products';
    setError(errorMsg);
    toast.error(errorMsg);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { data } = await productAPI.deleteProduct(productId);
      
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== productId));
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete product');
    }
  };

  const handleEdit = (productId) => {
    navigate(`/farmer/products/${productId}/edit`);
  };

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
              <svg
                className="h-6 w-6 text-red-600 dark:text-red-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-3 text-xl font-bold text-gray-800 dark:text-white">
              Error Loading Dashboard
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {error}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Retry
          </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              title: "Total Products", 
              value: stats.totalProducts, 
              icon: "🌱", 
              color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
            },
            { 
              title: "Out of Stock", 
              value: stats.outOfStock, 
              icon: "⚠️", 
              color: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200" 
            },
            { 
              title: "Total Sold", 
              value: stats.totalSales, 
              icon: "💰", 
              color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" 
            },
            { 
              title: "Avg Rating", 
              value: stats.averageRating || 0, 
              icon: "⭐", 
              color: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200" 
            }
          ].map((stat, index) => (
            <div 
              key={index} 
              className={`p-6 rounded-xl ${stat.color} shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Products Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Your Products
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No products listed yet
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Start by adding your first agricultural product
              </p>
              <div className="mt-6">
                <Link
                  to="/farmer/products/new"
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  Add Product
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {products.map((product) => (
                    <tr 
                      key={product._id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                              src={product.images?.[0] || '/placeholder-product.jpg'}
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = '/placeholder-product.jpg';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {product.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        KSh {product.price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {product.stock || 0} {product.unit || 'kg'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock > 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleEdit(product._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                            title="Edit product"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Delete product"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}