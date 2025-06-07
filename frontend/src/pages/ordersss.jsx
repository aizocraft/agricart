import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import OrderHeader from './orderDetails/OrderHeader';
import StatusStepper from './orderDetails/StatusStepper';
import OrderItemsTab from './orderDetails/OrderItemsTab';
import ShippingPaymentTab from './orderDetails/ShippingPaymentTab';
import ReviewsTab from './orderDetails/ReviewsTab';
import ReceiptModal from './orderDetails/ReceiptModal';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [activeTab, setActiveTab] = useState('items');
  const [reviews, setReviews] = useState({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await orderAPI.getOrderById(id);
        
        if (!data) {
          throw new Error('Order not found');
        }

        setOrder(data);
        
        const initialReviews = {};
        data.orderItems?.forEach(item => {
          if (item.product?._id) {
            initialReviews[item.product._id] = {
              rating: 0,
              comment: '',
              submitted: false
            };
          }
        });
        setReviews(initialReviews);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load order details');
        toast.error(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleReviewChange = (productId, field, value) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const submitReview = async (productId) => {
    try {
      const review = reviews[productId];
      if (!review?.rating) {
        toast.error('Please select a rating');
        return;
      }

      toast.success('Review submitted successfully!');
      
      setReviews(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          submitted: true
        }
      }));
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return 'Invalid date';
    }
  };

  const cancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      toast.success('Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="w-12 h-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl text-center">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          No order data available
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <OrderHeader 
          order={order} 
          user={user} 
          formatDate={formatDate} 
          setShowReceipt={setShowReceipt} 
          cancelOrder={cancelOrder} 
        />

        <StatusStepper order={order} formatDate={formatDate} />

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('items')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'items' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Order Items
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'shipping' 
                  ? 'border-green-500 text-green-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Shipping & Payment
            </button>
            {order.isDelivered && user?.role !== 'farmer' && (
              <button
                onClick={() => setActiveTab('review')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'review' 
                    ? 'border-green-500 text-green-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Leave Reviews
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'items' && <OrderItemsTab order={order} reviews={reviews} />}
              {activeTab === 'shipping' && <ShippingPaymentTab order={order} />}
              {activeTab === 'review' && (
                <ReviewsTab 
                  order={order} 
                  reviews={reviews} 
                  handleReviewChange={handleReviewChange} 
                  submitReview={submitReview} 
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Back Button */}
        <div className="flex justify-end">
          <motion.button
            onClick={() => navigate('/orders')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Orders
          </motion.button>
        </div>
      </motion.div>

      <ReceiptModal 
        showReceipt={showReceipt} 
        setShowReceipt={setShowReceipt} 
        order={order} 
        user={user} 
        formatDate={formatDate} 
      />
    </div>
  );
}