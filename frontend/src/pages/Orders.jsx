import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setError("Please log in to view your orders");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await orderAPI.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || "Failed to fetch orders");
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex flex-col items-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg text-gray-700 mb-4">{error}</p>
          {!user && (
            <Link
              to="/login"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Your order history will appear here once you make a purchase"
        actionText="Browse Products"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          My Orders
        </h2>
        <Link
          to="/products"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-800">
                  Order #{order.orderNumber || order._id.substring(0, 8)}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  order.isDelivered
                    ? "bg-green-100 text-green-800"
                    : order.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.isDelivered ? "Delivered" : order.status}
              </span>
            </div>

            <div className="p-4">
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center space-x-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || "https://via.placeholder.com/80"}
                        alt={item.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × KES {item.price?.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">
                        KES {(item.quantity * item.price)?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  {order.orderItems.length} item{order.orderItems.length !== 1 && "s"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Total amount
                </p>
                <p className="text-lg font-bold text-gray-800">
                  KES {order.totalPrice?.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <Link
                to={`/orders/${order._id}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View Details
              </Link>
              {order.status === "pending" && (
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;