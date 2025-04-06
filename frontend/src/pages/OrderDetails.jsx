import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await orderAPI.getOrderById(id);
        setOrder(data);
      } catch (err) {
        console.error('Order fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load order details');
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      setCancelling(true);
      // Implement cancel order API endpoint in your backend
      // await orderAPI.cancelOrder(id);
      toast.success('Order cancellation requested');
      navigate('/orders');
    } catch (err) {
      console.error('Cancel order error:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (!user) {
    return (
      <EmptyState
        title="Please login to view order details"
        actionText="Login"
        actionLink="/login"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title={error}
        description="Please try again later"
        actionText="Back to Orders"
        actionLink="/orders"
      />
    );
  }

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        description="The order you're looking for doesn't exist"
        actionText="Back to Orders"
        actionLink="/orders"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
            Order #{order.orderNumber || order._id.substring(0, 8)}
          </h1>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            order.isDelivered 
              ? 'bg-green-100 text-green-800'
              : order.status === 'cancelled'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {order.isDelivered ? 'Delivered' : order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Order Items
                </h2>
                <div className="divide-y divide-gray-200">
                  {order.orderItems.map(item => (
                    <div key={item._id} className="py-4 flex items-start hover:bg-gray-50 transition-colors duration-150 px-2 rounded">
                      <img 
                        src={item.image || 'https://via.placeholder.com/80'} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-semibold text-gray-800">
                          {item.name}
                        </p>
                        <p className="text-gray-600 mt-1">
                          {item.quantity} × KES {item.price?.toFixed(2)} = KES {(item.quantity * item.price)?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  Shipping Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="mt-1 text-gray-800">{order.shippingAddress?.address}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">City</h3>
                    <p className="mt-1 text-gray-800">{order.shippingAddress?.city}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Postal Code</h3>
                    <p className="mt-1 text-gray-800">{order.shippingAddress?.postalCode}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Country</h3>
                    <p className="mt-1 text-gray-800">{order.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                  Order Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800">KES {order.itemsPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-800">KES {order.shippingPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-800">KES {order.taxPrice?.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="font-bold text-lg text-gray-800">KES {order.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Method
                  </h3>
                  <p className="text-gray-800">{order.paymentMethod}</p>
                  <p className={`mt-2 ${
                    order.isPaid 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {order.isPaid 
                      ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}`
                      : 'Not Paid'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Delivery Status
                  </h3>
                  <p className={`${
                    order.isDelivered 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {order.isDelivered 
                      ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}`
                      : 'Not Delivered'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Link 
                to="/orders" 
                className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors duration-200"
              >
                Back to Orders
              </Link>
              {order.status === 'pending' && (
                <button 
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex justify-center items-center"
                >
                  {cancelling ? (
                    <>
                      <LoadingSpinner className="w-4 h-4 mr-2" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Order'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}