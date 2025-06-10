import { formatDate } from './orderUtils';

export default function ShippingPaymentTab({ order }) {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-800">{order.shippingAddress?.address || 'N/A'}</p>
          <p className="text-gray-800">
            {order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.postalCode || 'N/A'}
          </p>
          <p className="text-gray-800">{order.shippingAddress?.country || 'N/A'}</p>
          {order.shippingAddress?.phone && (
            <p className="text-gray-800 mt-2">Phone: {order.shippingAddress.phone}</p>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-800 capitalize">
            {order.paymentMethod ? order.paymentMethod.toLowerCase() : 'N/A'}
          </p>
          <p className={`mt-2 ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
            {order.isPaid ? `Paid on ${formatDate(order.paidAt)}` : 'Not Paid'}
          </p>
          {order.isPaid && order.paymentResult && (
            <div className="mt-2 text-sm">
              <p className="text-gray-500">
                Transaction ID: {order.paymentResult.id || 'N/A'}
              </p>
              {order.paymentResult.status && (
                <p className="text-gray-500">
                  Status: {order.paymentResult.status}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">KES {order.itemsPrice?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (10%)</span>
            <span className="font-medium">KES {order.taxPrice?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {order.shippingPrice === 0 ? 'Free' : `KES ${order.shippingPrice?.toFixed(2) || '0.00'}`}
            </span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>KES {order.totalPrice?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}