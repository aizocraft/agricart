import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../store/slices/cartSlice';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <Link
            to="/products"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {cartItems.map((item) => (
              <div
                key={item.product}
                className="flex items-center border-b border-gray-200 py-4"
              >
                <div className="w-24 h-24 bg-gray-100 rounded mr-4"></div>
                <div className="flex-grow">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center">
                  <span className="mx-4">Qty: {item.qty}</span>
                  <button
                    onClick={() => dispatch(removeFromCart(item.product))}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white p-6 rounded shadow-md h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={() => dispatch(clearCart())}
              className="w-full py-2 bg-gray-200 text-gray-800 rounded mb-4 hover:bg-gray-300 transition"
            >
              Clear Cart
            </button>
            <button className="w-full py-2 bg-primary text-white rounded hover:bg-secondary transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}