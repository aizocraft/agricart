// pages/Cart.jsx
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
import CartItems from './cart/CartItems';
import OrderSummary from './cart/OrderSummary';
import AddressForm from './cart/AddressForm';
import PaymentMethod from "./cart/PaymentMethod";

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
    country: 'Kenya',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState(savedPaymentMethod || 'Mpesa');

  // Calculate order summary
  const tax = subtotal * 0.1; // 10% tax
  const shipping = subtotal > 5000 ? 0 : 200; // Free shipping over 5000 KES
  const total = subtotal + tax + shipping;

  useEffect(() => {
    if (!savedShippingAddress && user?.address) {
      setAddress({
        address: user.address.street || '',
        city: user.address.city || '',
        postalCode: user.address.postalCode || '',
        country: user.address.country || 'Kenya',
        phone: user.phone || ''
      });
    }
  }, [user, savedShippingAddress]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const validatePhoneNumber = (phone) => {
    const regex = /^(\+?254|0)[17]\d{8}$/;
    return regex.test(phone);
  };

  const saveAddress = () => {
    if (!address.address || !address.city || !address.postalCode || !address.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!validatePhoneNumber(address.phone)) {
      toast.error('Please enter a valid Kenyan phone number (e.g. 0712345678)');
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
      navigate(`/order/${data._id}`, { 
        state: { 
          order: data,
          justCreated: true 
        } 
      });
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
        error.response.data.outOfStockItems.forEach(item => {
          dispatch(removeFromCart(item.product));
        });
      } else if (error.response?.status === 400 && error.response.data?.message?.includes('stock')) {
        toast.error('Some items in your cart are no longer available in the requested quantities. Please update your cart.');
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
              {showAddressForm && (
                <AddressForm 
                  address={address}
                  onAddressChange={handleAddressChange}
                  onSave={saveAddress}
                  onCancel={() => setShowAddressForm(false)}
                />
              )}

              {showPaymentMethod && (
                <PaymentMethod 
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  onSave={savePaymentSelection}
                  onCancel={() => setShowPaymentMethod(false)}
                />
              )}

              <CartItems 
                items={cartItems}
                onRemove={(productId) => dispatch(removeFromCart(productId))}
                onQuantityChange={handleQuantityChange}
              />
            </div>
            
            <OrderSummary 
              subtotal={subtotal}
              tax={tax}
              shipping={shipping}
              total={total}
              savedShippingAddress={savedShippingAddress}
              savedPaymentMethod={savedPaymentMethod}
              onAddressEdit={() => setShowAddressForm(true)}
              onPaymentEdit={() => setShowPaymentMethod(true)}
              onCheckout={handleCheckout}
              isCheckingOut={isCheckingOut}
              onContinueShopping={() => navigate('/products')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}