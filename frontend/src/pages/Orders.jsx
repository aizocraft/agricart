// src/pages/Orders.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { getMyOrders } from "../services/api"; 
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to fetch orders.");
        toast.error("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">You have no orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border p-4 rounded-lg shadow-md bg-white dark:bg-gray-800"
            >
              <Link
                to={`/orders/${order.id}`}
                className="text-blue-500 hover:underline"
              >
                <p className="text-lg font-semibold">Order #{order.id}</p>
              </Link>
              <p>
                Status:{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {order.status}
                </span>
              </p>
              <p>
                Total: <span className="font-semibold">${order.total}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Orders;
