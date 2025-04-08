import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  removeFromCart, 
  clearCart, 
  updateQuantity,
  saveShippingAddress,
  savePaymentMethod,
  selectCartItems,
  selectCartTotal,
  selectShippingAddress,
  selectPaymentMethod
} from '../store/cartSlice';
import { orderAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Cart() {
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const savedShippingAddress = useSelector(selectShippingAddress);
  const savedPaymentMethod = useSelector(selectPaymentMethod);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const [address, setAddress] = useState(savedShippingAddress || {
    address: '',
    city: '',
    postalCode: '',
    country: 'Kenya'
  });
  const [paymentMethod, setPaymentMethod] = useState(savedPaymentMethod || 'Mpesa');

  // Calculate order summary
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 5000 ? 0 : 200; // Free shipping over 5000 KES
  const total = subtotal + tax + shipping;

  useEffect(() => {
    if (!savedShippingAddress && user?.address) {
      setAddress({
        ...user.address,
        country: user.address.country || 'Kenya'
      });
    }
  }, [user, savedShippingAddress]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const saveAddress = () => {
    if (!address.address || !address.city || !address.postalCode) {
      toast.error('Please fill all required fields');
      return;
    }
    dispatch(saveShippingAddress(address));
    setShowAddressForm(false);
    toast.success('Shipping address saved');
  };

  const savePaymentSelection = () => {
    dispatch(savePaymentMethod(paymentMethod));
    setShowPaymentMethod(false);
    toast.success('Payment method saved');
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (!savedShippingAddress && !showAddressForm) {
      setShowAddressForm(true);
      toast('Please enter your shipping address', { icon: '✏️' });
      return;
    }

    if (!savedPaymentMethod && !showPaymentMethod) {
      setShowPaymentMethod(true);
      toast('Please select a payment method', { icon: '💳' });
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.product,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          unit: item.unit
        })),
        shippingAddress: savedShippingAddress || address,
        paymentMethod: savedPaymentMethod || paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total
      };

      const { data } = await orderAPI.createOrder(orderData);
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      navigate(`/orders`);
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMsg = error.response?.data?.message || 
        error.message || 
        'Checkout failed. Please try again.';
      
      if (error.response?.data?.outOfStockItems) {
        toast.error(
          `Some items are out of stock. Please update your cart.`,
          { duration: 5000 }
        );
        // Remove out of stock items from cart
        error.response.data.outOfStockItems.forEach(item => {
          dispatch(removeFromCart(item.product));
        });
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsCheckingOut(false);
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707V20a2 2 0 002 2h10a2 2 0 002-2v-4.414c0-1.074.336-2.077.707-2.293L17 13m-5-5a2 2 0 11-4 0a2 2 0 014 0z"
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
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address Section */}
              {showAddressForm && (
                <motion.div 
                  className="bg-white rounded-xl shadow-sm p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
                      <input
                        type="text"
                        name="address"
                        value={address.address}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code*</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={address.postalCode}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <select
                        name="country"
                        value={address.country}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="Kenya">Kenya</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Tanzania">Tanzania</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 space-x-3">
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveAddress}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save Address
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Payment Method Section */}
              {showPaymentMethod && (
                <motion.div 
                  className="bg-white rounded-xl shadow-sm p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="mpesa"
                        name="paymentMethod"
                        value="Mpesa"
                        checked={paymentMethod === 'Mpesa'}
                        onChange={() => setPaymentMethod('Mpesa')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="mpesa" className="ml-3 block text-sm font-medium text-gray-700">
                        M-Pesa
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="paypal"
                        name="paymentMethod"
                        value="PayPal"
                        checked={paymentMethod === 'PayPal'}
                        onChange={() => setPaymentMethod('PayPal')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700">
                        PayPal
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="Cash on Delivery"
                        checked={paymentMethod === 'Cash on Delivery'}
                        onChange={() => setPaymentMethod('Cash on Delivery')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                        Cash on Delivery
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 space-x-3">
                    <button
                      onClick={() => setShowPaymentMethod(false)}
                      className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={savePaymentSelection}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save Payment Method
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Cart Items Section */}
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
                          <div>
                            <h3 className="font-semibold text-gray-800">{item.name}</h3>
                            <p className="text-sm text-gray-500">
                              {item.unit && `${item.quantity} ${item.unit}`}
                            </p>
                          </div>
                          <button 
                            onClick={() => dispatch(removeFromCart(item.product))}
                            className="text-red-500 hover:text-red-700 transition-colors h-6"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border rounded-md overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                              aria-label="Decrease quantity"
                              disabled={item.quantity <= 1}
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
                          <span className="text-gray-700 font-medium">
                            KES {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Order Summary Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">KES {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">KES {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `KES ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span>KES {total.toFixed(2)}</span>
                </div>
              </div>

              {savedShippingAddress && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Shipping to</h3>
                  <p className="text-gray-800">
                    {savedShippingAddress.address}, {savedShippingAddress.city}<br />
                    {savedShippingAddress.postalCode}, {savedShippingAddress.country}
                  </p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="mt-2 text-sm text-green-600 hover:underline"
                  >
                    Change address
                  </button>
                </div>
              )}

              {savedPaymentMethod && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Payment Method</h3>
                  <p className="text-gray-800 capitalize">{savedPaymentMethod.toLowerCase()}</p>
                  <button
                    onClick={() => setShowPaymentMethod(true)}
                    className="mt-2 text-sm text-green-600 hover:underline"
                  >
                    Change payment
                  </button>
                </div>
              )}
              
              <motion.button
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md flex justify-center items-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={cartItems.length === 0 || isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <LoadingSpinner className="w-5 h-5 mr-2" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
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