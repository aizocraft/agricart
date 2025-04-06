import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart, updateQuantity } from '../store/cartSlice';
import { orderAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const { cartItems } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout', {
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff'
        }
      });
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image
        })),
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
        paymentMethod: 'PayPal' // Default payment method
      };

      const { data } = await orderAPI.createOrder(orderData);
      dispatch(clearCart());
      toast.success('Order placed successfully!', {
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff'
        }
      });
      navigate(`/orders/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed', {
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff'
        }
      });
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.h1 
        className="text-3xl font-bold mb-8 text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Your Shopping Cart
      </motion.h1>
      
      <AnimatePresence>
        {cartItems.length === 0 ? (
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63  . 63-. 184 1. 707  . 707V20  a2 2 0 002 2  h10  a2 2 0 002-2  v-4  . 414  c0-1. 074  . 336-2. 077  . 707-2. 293  L17 13  m-5-5  a2 2 0 11  -4 0  a2 2 0 014 0  z"
                />
              </svg>
              <p className="text-lg text-gray-600 mb-6">Your cart is empty</p>
              <motion.button 
                onClick={() => navigate('/products')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue Shopping
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <AnimatePresence>
                  {cartItems.map(item => (
                    <motion.div 
                      key={item.product}
                      className="p-4 border-b flex flex-col sm:flex-row"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <div className="flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-20 h-20 object-cover rounded-lg"
                          loading="lazy"
                        />
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          <button 
                            onClick={() => dispatch(removeFromCart(item.product))}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Remove item"
                          >
                            <svg 
                              className="w-5 h-5" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M19 7  l-. 867 12. 142  a2 2 0 01-1. 995 1. 858  h-10. 276  a2 2 0 01-1. 995-1. 858  l-. 867-12. 142  m5. 728 0  a. 5. 5 0 00-  . 5. 5  v. 5  a. 5. 5 0 00. 5. 5  h. 5  a. 5. 5 0 00. 5-. 5  v-. 5  a. 5. 5 0 00-. 5-. 5  h-. 5  z  m-5 0  a. 5. 5 0 00-. 5. 5  v. 5  a. 5. 5 0 00. 5. 5  h. 5  a. 5. 5 0 00. 5-. 5  v-. 5  a. 5. 5 0 00-. 5-. 5  h-. 5  z"
                              />
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-600">${item.price.toFixed(2)}</p>
                        <div className="flex items-center mt-4">
                          <div className="flex items-center border rounded-md overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-4 py-1 text-center w-12">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <span className="ml-4 text-gray-700">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              <motion.button
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </motion.button>

              <button
                onClick={() => navigate('/products')}
                className="w-full mt-4 text-green-600 py-2.5 rounded-lg border border-green-600 hover:bg-green-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}