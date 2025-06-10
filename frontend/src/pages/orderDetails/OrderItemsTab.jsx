import logo from '../../assets/logo.png';
import StarRating from '../../components/StarRating';

export default function OrderItemsTab({ order, reviews }) {
  return (
    <div className="divide-y divide-gray-200">
      {order.orderItems?.map((item) => (
        <div key={item._id || item.product?._id} className="p-6 flex flex-col sm:flex-row">
          <div className="flex-shrink-0">
            <img
              src={item.image || logo}
              alt={item.name || 'Product image'}
              className="w-20 h-20 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = logo;
              }}
            />
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-6 flex-grow">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-800">
                  {item.name || 'Unnamed Product'}
                </h3>
                <p className="text-sm text-gray-500">
                  {item.quantity || 0} × KES {item.price?.toFixed(2) || '0.00'}
                </p>
                {item.product?.organic && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                    Organic
                  </span>
                )}
              </div>
              <p className="text-lg font-medium text-gray-900">
                KES {((item.price || 0) * (item.quantity || 0)).toFixed(2)}
              </p>
            </div>
            {order.isDelivered && reviews[item.product?._id]?.submitted && (
              <div className="mt-2 flex items-center">
                <StarRating rating={reviews[item.product._id].rating} />
                <span className="ml-2 text-sm text-gray-500">Your review</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}