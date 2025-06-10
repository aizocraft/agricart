// pages/cart/OrderSummary.jsx
import { motion } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function OrderSummary({
  subtotal,
  tax,
  shipping,
  total,
  savedShippingAddress,
  savedPaymentMethod,
  onAddressEdit,
  onPaymentEdit,
  onCheckout,
  isCheckingOut,
  onContinueShopping
}) {
  return (
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
            {savedShippingAddress.postalCode}, {savedShippingAddress.country}<br />
            Phone: {savedShippingAddress.phone}
          </p>
          <button
            onClick={onAddressEdit}
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
            onClick={onPaymentEdit}
            className="mt-2 text-sm text-green-600 hover:underline"
          >
            Change payment
          </button>
        </div>
      )}
      
      <motion.button
        onClick={onCheckout}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md flex justify-center items-center"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isCheckingOut}
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
        onClick={onContinueShopping}
        className="w-full mt-4 text-green-600 py-2.5 rounded-lg border border-green-600 hover:bg-green-50 transition-colors"
      >
        Continue Shopping
      </button>
    </div>
  );
}