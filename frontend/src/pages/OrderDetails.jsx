import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getOrderById } from '../services/api'
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
        const { data } = await getOrderById(id)
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
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl mb-4">Please login to view order details</h1>
        <Link 
          to="/login" 
          className="bg-primary text-white px-6 py-2 rounded hover:bg-green-600 transition"
        >
          Login
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl mb-4">Order not found</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order #{order._id.substring(0, 8)}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            {order.orderItems.map(item => (
              <div key={item._id} className="flex py-4 border-b">
                <img 
                  src={item.product.image} 
                  alt={item.product.name} 
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="ml-4">
                  <Link 
                    to={`/products/${item.product._id}`}
                    className="font-semibold hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-gray-600">
                    {item.quantity} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Address:</span> {order.shippingAddress.address}</p>
              <p><span className="font-semibold">City:</span> {order.shippingAddress.city}</p>
              <p><span className="font-semibold">Postal Code:</span> {order.shippingAddress.postalCode}</p>
              <p><span className="font-semibold">Country:</span> {order.shippingAddress.country}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>Items Price</span>
              <span>${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${order.shippingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${order.taxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-gray-100 rounded">
              <h3 className="font-semibold mb-1">Payment Method</h3>
              <p>{order.paymentMethod}</p>
              {order.isPaid ? (
                <p className="text-green-500 mt-1">
                  Paid on {new Date(order.paidAt).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-red-500 mt-1">Not Paid</p>
              )}
            </div>
            
            <div className="p-3 bg-gray-100 rounded">
              <h3 className="font-semibold mb-1">Delivery Status</h3>
              {order.isDelivered ? (
                <p className="text-green-500">
                  Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-red-500">Not Delivered</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}