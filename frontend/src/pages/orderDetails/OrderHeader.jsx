import { motion } from 'framer-motion';

export default function OrderHeader({ order, user, formatDate, setShowReceipt, cancelOrder }) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Order #{order._id?.substring(0, 8).toUpperCase() || 'N/A'}
        </h1>
        <p className="text-gray-600">
          Placed on {formatDate(order.createdAt)}
        </p>
        {order.isCancelled && (
          <span className="inline-block mt-1 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
            Cancelled
          </span>
        )}
      </div>
      <div className="mt-4 md:mt-0 flex space-x-3">
        <button
          onClick={() => setShowReceipt(true)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          View Receipt
        </button>
        {!order.isPaid && !order.isCancelled && user?.role !== 'farmer' && (
          <button
            onClick={cancelOrder}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}