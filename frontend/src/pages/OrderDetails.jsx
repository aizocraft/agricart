import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderAPI } from '../services/api' // Updated import
import { toast } from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const { data } = await orderAPI.getOrderById(id) // Updated API call
        setOrder(data)
      } catch (error) {
        toast.error('Failed to load order details')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Please login to view order details
          </h1>
          <Link 
            to="/login" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
          >
            Login
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Order not found
          </h1>
          <Link 
            to="/orders" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">
            Order #{order.orderNumber || order._id.substring(0, 8)}
          </h1>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            order.status === 'delivered' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : order.status === 'cancelled'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Order Items
                </h2>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items.map(item => (
                    <div key={item._id} className="py-4 flex items-start hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 px-2 rounded">
                      <img 
                        src={item.product?.image || 'https://via.placeholder.com/80'} 
                        alt={item.product?.name} 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="ml-4 flex-1">
                        <Link 
                          to={`/products/${item.product?._id}`}
                          className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {item.product?.name}
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {item.quantity} × ${item.price?.toFixed(2)} = ${(item.quantity * item.price)?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  Shipping Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h3>
                    <p className="mt-1 text-gray-800 dark:text-white">{order.shippingAddress?.address}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">City</h3>
                    <p className="mt-1 text-gray-800 dark:text-white">{order.shippingAddress?.city}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Postal Code</h3>
                    <p className="mt-1 text-gray-800 dark:text-white">{order.shippingAddress?.postalCode}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Country</h3>
                    <p className="mt-1 text-gray-800 dark:text-white">{order.shippingAddress?.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                  </svg>
                  Order Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-800 dark:text-white">${order.itemsPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-800 dark:text-white">${order.shippingPrice?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="text-gray-800 dark:text-white">${order.taxPrice?.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-800 dark:text-white">Total</span>
                    <span className="font-bold text-lg text-gray-800 dark:text-white">${order.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Method
                  </h3>
                  <p className="text-gray-800 dark:text-white">{order.paymentMethod}</p>
                  <p className={`mt-2 ${
                    order.isPaid 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {order.isPaid 
                      ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}`
                      : 'Not Paid'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Delivery Status
                  </h3>
                  <p className={`${
                    order.isDelivered 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
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
                className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white px-4 py-2 rounded-md transition-colors duration-200"
              >
                Back to Orders
              </Link>
              {order.status === 'pending' && (
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200">
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}