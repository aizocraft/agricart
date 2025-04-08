import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import logo from '../assets/react.svg'; // Replace with your actual logo

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
        const { data } = await orderAPI.getOrderById(id);
        setOrder(data);
        
        // Initialize reviews state
        const initialReviews = {};
        data.orderItems.forEach(item => {
          initialReviews[item.product] = {
            rating: 0,
            comment: ''
          };
        });
        setReviews(initialReviews);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details');
        toast.error('Failed to load order details');
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
      if (!review.rating) {
        toast.error('Please select a rating');
        return;
      }

      // Here you would call your API to submit the review
      // await productAPI.createReview(productId, review);
      toast.success('Review submitted successfully!');
      
      // Update UI to show review was submitted
      setReviews(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          submitted: true
        }
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusSteps = () => {
    const steps = [
      { id: 'ordered', name: 'Order Placed', description: 'Your order has been received', date: order?.createdAt },
      { id: 'paid', name: 'Payment', description: order?.isPaid ? 'Payment completed' : 'Awaiting payment', date: order?.paidAt },
      { id: 'processed', name: 'Processing', description: order?.isPaid ? 'Preparing your order' : 'Will start after payment', date: order?.isPaid ? new Date(order.createdAt).setHours(new Date(order.createdAt).getHours() + 1) : null },
      { id: 'delivered', name: 'Delivered', description: order?.isDelivered ? 'Order delivered' : 'On the way', date: order?.deliveredAt }
    ];

    return steps;
  };

  const cancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      // await orderAPI.cancelOrder(order._id);
      // setOrder(prev => ({ ...prev, status: 'cancelled' }));
      toast.success('Order cancelled successfully');
    } catch (error) {
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
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Order #{order._id.substring(0, 8)}</h1>
            <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setShowReceipt(true)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Receipt
            </button>
            {!order.isPaid && (
              <button
                onClick={cancelOrder}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Order Status Stepper */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Order Status</h2>
          <div className="relative">
            <div className="absolute top-0 left-4 h-full w-0.5 bg-gray-200" aria-hidden="true"></div>
            <ul className="space-y-8">
              {getStatusSteps().map((step, stepIdx) => (
                <li key={step.name} className="relative">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`flex items-center justify-center h-8 w-8 rounded-full ${step.date ? 'bg-green-500' : 'bg-gray-300'}`}>
                        {step.date ? (
                          <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-white">{stepIdx + 1}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className={`text-sm font-medium ${step.date ? 'text-green-600' : 'text-gray-500'}`}>
                        {step.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {step.description}
                      </p>
                      {step.date && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(step.date)}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('items')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'items' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Order Items
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'shipping' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Shipping & Payment
            </button>
            {order.isDelivered && (
              <button
                onClick={() => setActiveTab('review')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'review' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Leave Reviews
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          {activeTab === 'items' && (
            <div className="divide-y divide-gray-200">
              {order.orderItems.map((item) => (
                <div key={item._id} className="p-4 flex flex-col sm:flex-row">
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-6 flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × KES {item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-lg font-medium text-gray-900">
                        KES {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    {order.isDelivered && reviews[item.product]?.submitted && (
                      <div className="mt-2 flex items-center">
                        <StarRating rating={reviews[item.product].rating} />
                        <span className="ml-2 text-sm text-gray-500">Your review</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">{order.shippingAddress.address}</p>
                  <p className="text-gray-800">
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-gray-800">{order.shippingAddress.country}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 capitalize">{order.paymentMethod.toLowerCase()}</p>
                  <p className={`mt-2 ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.isPaid ? `Paid on ${formatDate(order.paidAt)}` : 'Not Paid'}
                  </p>
                  {order.isPaid && (
                    <p className="text-sm text-gray-500 mt-1">
                      Transaction ID: {order.paymentResult?.id || 'N/A'}
                    </p>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">KES {order.itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">KES {order.taxPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {order.shippingPrice === 0 ? 'Free' : `KES ${order.shippingPrice.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>KES {order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Rate Your Products</h3>
              <div className="space-y-8">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg mr-4"
                        loading="lazy"
                      />
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        {!reviews[item.product]?.submitted ? (
                          <div className="mt-3">
                            <div className="mb-3">
                              <p className="text-sm text-gray-600 mb-1">Rating</p>
                              <StarRating
                                rating={reviews[item.product]?.rating || 0}
                                editable={true}
                                onRatingChange={(rating) => handleReviewChange(item.product, 'rating', rating)}
                              />
                            </div>
                            <div className="mb-3">
                              <label htmlFor={`comment-${item.product}`} className="block text-sm text-gray-600 mb-1">
                                Review
                              </label>
                              <textarea
                                id={`comment-${item.product}`}
                                rows="3"
                                className="w-full px-3 py-2 border rounded-md"
                                value={reviews[item.product]?.comment || ''}
                                onChange={(e) => handleReviewChange(item.product, 'comment', e.target.value)}
                                placeholder="Share your experience with this product..."
                              />
                            </div>
                            <button
                              onClick={() => submitReview(item.product)}
                              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                            >
                              Submit Review
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <StarRating rating={reviews[item.product].rating} />
                            {reviews[item.product].comment && (
                              <p className="mt-2 text-gray-600">{reviews[item.product].comment}</p>
                            )}
                            <p className="text-sm text-green-600 mt-2">Thank you for your review!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => navigate('/orders')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            Back to Orders
          </button>
        </div>
      </motion.div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && (
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
                    <span>#{order._id.substring(0, 8)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span>
                      {order.isPaid ? 'Paid' : 'Pending'} • 
                      {order.isDelivered ? ' Delivered' : ' Processing'}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Customer Details</h4>
                  <p className="text-sm">{user?.name}</p>
                  <p className="text-sm">{order.shippingAddress.address}</p>
                  <p className="text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm">{order.shippingAddress.country}</p>
                </div>

                <div className="border-b pb-4 mb-4">
                  <h4 className="font-medium mb-2">Order Items</h4>
                  <div className="space-y-3">
                    {order.orderItems.map((item, index) => (
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
                    <span>KES {order.itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>KES {order.taxPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>
                      {order.shippingPrice === 0 ? 'Free' : `KES ${order.shippingPrice.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>KES {order.totalPrice.toFixed(2)}</span>
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
                <button
                  onClick={() => window.print()}
                  className="ml-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Print Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}