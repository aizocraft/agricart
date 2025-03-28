import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { clearCart } from '../store/slices/cartSlice';

export default function Checkout() {
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [loading, setLoading] = useState(false);
  
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(
        'http://localhost:5000/api/orders',
        {
          orderItems: cartItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
        },
        config
      );

      dispatch(clearCart());
      navigate(`/order/${data._id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Shipping</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={shippingAddress.country}
                onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <h2 className="text-xl font-bold mt-8 mb-4">Payment Method</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="paypal"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                  className="mr-2"
                />
                <label htmlFor="paypal">PayPal</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="mpesa"
                  name="paymentMethod"
                  value="mpesa"
                  checked={paymentMethod === 'mpesa'}
                  onChange={() => setPaymentMethod('mpesa')}
                  className="mr-2"
                />
                <label htmlFor="mpesa">M-Pesa</label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className="w-full py-2 bg-primary text-white rounded hover:bg-secondary transition disabled:opacity-50 mt-8"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
        
        <div className="bg-white p-6 rounded shadow-md h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Items:</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>${shippingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${taxPrice.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}