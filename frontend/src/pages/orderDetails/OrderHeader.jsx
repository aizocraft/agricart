import { formatDate } from './orderUtils';

export default function OrderHeader({ order, user, showReceipt, setShowReceipt, cancelOrder }) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Order #{order._id?.substring(0, 8) || 'N/A'}
        </h1>
        <p className="text-gray-600">
          Placed on {formatDate(order.createdAt)}
          {order.status === 'Cancelled' && (
            <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
              Cancelled
            </span>
          )}
        </p>
      </div>
      <div className="mt-4 md:mt-0 flex space-x-3">
        <button
          onClick={() => setShowReceipt(true)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          View Receipt
        </button>
        {!order.isPaid && user?.role !== 'farmer' && order.status !== 'Cancelled' && (
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