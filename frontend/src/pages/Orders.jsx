import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import logo from '../assets/react.svg'; // Replace with your actual logo

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await orderAPI.getMyOrders();
        setOrders(data);
      } catch (error) {
        toast.error('Failed to load orders');
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewDetails = (order) => {
    navigate(`/orders/${order._id}`);
  };

  const handlePrintReceipt = (order) => {
    setSelectedOrder(order);
    setShowReceipt(true);
    setTimeout(() => {
      window.print();
      setShowReceipt(false);
    }, 500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (order) => {
    if (!order.isPaid) {
      return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">Pending Payment</span>;
    }
    if (!order.isDelivered) {
      return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">Processing</span>;
    }
    return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Delivered</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.h1 
        className="text-3xl font-bold mb-8 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        My Orders
      </motion.h1>

      {orders.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="inline-flex flex-col items-center">
            <svg 
              className="w-16 h-16 text-gray-400 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-lg text-gray-600 mb-6">You haven't placed any orders yet</p>
            <motion.button 
              onClick={() => navigate('/products')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Products
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <motion.tr 
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      KES {order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-green-600 hover:text-green-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handlePrintReceipt(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Receipt
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal for Printing */}
      <AnimatePresence>
        {showReceipt && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div 
              className="bg-white rounded-lg w-full max-w-md p-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="print-only">
                <div className="text-center mb-6">
                  <img src={logo} alt="Company Logo" className="h-16 mx-auto mb-2" />
                  <h2 className="text-xl font-bold">Agricart</h2>
                  <p className="text-sm text-gray-600">123 Farm Road, Nairobi</p>
                  <p className="text-sm text-gray-600">Phone: +254 700 123456</p>
                </div>

                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-semibold">Order Receipt</h3>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Order #:</span>
                    <span>{selectedOrder._id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span>
                      {selectedOrder.isPaid ? 'Paid' : 'Pending'} • 
                      {selectedOrder.isDelivered ? ' Delivered' : ' Processing'}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Customer Details</h4>
                  <p className="text-sm">{user?.name}</p>
                  <p className="text-sm">{selectedOrder.shippingAddress.address}</p>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm">{selectedOrder.shippingAddress.country}</p>
                </div>

                <div className="border-b pb-4 mb-4">
                  <h4 className="font-medium mb-2">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div>
                          <p>{item.name}</p>
                          <p className="text-gray-600">{item.quantity} × KES {item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-medium">KES {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>KES {selectedOrder.itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>KES {selectedOrder.taxPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>
                      {selectedOrder.shippingPrice === 0 ? 'Free' : `KES ${selectedOrder.shippingPrice.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>KES {selectedOrder.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
                  <p>Thank you for shopping with us!</p>
                  <p>For any inquiries, contact support@agricart.com</p>
                </div>
              </div>

              <div className="flex justify-end mt-6 print:hidden">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}