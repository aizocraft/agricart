import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';

export default function ReceiptModal({ showReceipt, setShowReceipt, order, user, formatDate }) {
  return (
    <AnimatePresence>
      {showReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-lg w-full max-w-md p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="print-only">
              <div className="text-center mb-6">
                <img src={logo} alt="Company Logo" className="h-16 mx-auto mb-2" />
                <h2 className="text-xl font-bold">Agricart</h2>
                <p className="text-sm text-gray-600">123 Farm Road, Nairobi</p>
                <p className="text-sm text-gray-600">Phone: +254 700 123456</p>
              </div>

              <div className="border-b pb-4 mb-4">
                <h3 className="text-lg font-semibold">Order Receipt</h3>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Order #:</span>
                  <span>#{order._id?.substring(0, 8).toUpperCase() || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span>
                    {order.isPaid ? 'Paid' : 'Pending'} • 
                    {order.isDelivered ? ' Delivered' : ' Processing'}
                    {order.isCancelled && ' • Cancelled'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Customer Details</h4>
                <p className="text-sm">{user?.name || 'N/A'}</p>
                <p className="text-sm">{order.shippingAddress?.address || 'N/A'}</p>
                <p className="text-sm">
                  {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.postalCode || 'N/A'}
                </p>
                <p className="text-sm">{order.shippingAddress?.country || 'N/A'}</p>
              </div>

              <div className="border-b pb-4 mb-4">
                <h4 className="font-medium mb-2">Order Items</h4>
                <div className="space-y-3">
                  {order.orderItems?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <p>{item.name || 'Unnamed Product'}</p>
                        <p className="text-gray-600">
                          {item.quantity || 0} × KES {item.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <p className="font-medium">
                        KES {((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>KES {order.itemsPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>KES {order.taxPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>
                    {order.shippingPrice === 0 ? 'Free' : `KES ${order.shippingPrice?.toFixed(2) || '0.00'}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span>KES {order.totalPrice?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t text-center text-xs text-gray-500">
                <p>Thank you for shopping with us!</p>
                <p>For any inquiries, contact support@agricart.com</p>
              </div>
            </div>

            <div className="flex justify-end mt-6 print:hidden">
              <button
                onClick={() => setShowReceipt(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="ml-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Print Receipt
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}