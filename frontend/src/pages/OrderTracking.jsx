import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Stepper } from '../components/Stepper';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(`http://localhost:5000/api/orders/${id}`, config);
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, userInfo]);

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  const steps = [
    { name: 'Order Placed', status: 'complete' },
    { 
      name: 'Processing', 
      status: order.isPaid ? 'complete' : 'current' 
    },
    { 
      name: 'Shipped', 
      status: order.isShipped ? 'complete' : order.isPaid ? 'current' : 'upcoming' 
    },
    { 
      name: 'Delivered', 
      status: order.isDelivered ? 'complete' : 'upcoming' 
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order #{order._id}</h1>
      
      <div className="bg-white p-6 rounded shadow-md mb-8">
        <Stepper steps={steps} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
          <p>{order.shippingAddress.address}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
          <p>{order.shippingAddress.country}</p>
        </div>

        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-bold mb-4">Payment Method</h2>
          <p className="capitalize">{order.paymentMethod}</p>
          <p className={order.isPaid ? 'text-green-600' : 'text-red-600'}>
            {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Not Paid'}
          </p>
        </div>
      </div>
    </div>
  );
}