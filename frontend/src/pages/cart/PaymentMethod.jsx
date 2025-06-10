// pages/cart/PaymentMethod.jsx
import { motion } from 'framer-motion';

export default function PaymentMethod({ 
  paymentMethod, 
  setPaymentMethod, 
  onSave, 
  onCancel 
}) {
  return (
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
          onClick={onCancel}
          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Save Payment Method
        </button>
      </div>
    </motion.div>
  );
}