import { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productsCache, setProductsCache] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderAPI.getAllOrders();
        const ordersData = response.data?.orders || response.data || [];
        setOrders(ordersData);
        
        // Build a cache of product names
        const productIds = [
          ...new Set(
            ordersData.flatMap(order => 
              order.orderItems?.map(item => item.product?._id || item.product) || []
            )
          )
        ].filter(Boolean);

        if (productIds.length > 0) {
          const productsResponse = await Promise.all(
            productIds.map(id => productAPI.getProductById(id).catch(() => null))
          );
          
          const cache = productsResponse.reduce((acc, res) => {
            if (res?.data) {
              acc[res.data._id] = res.data;
            }
            return acc;
          }, {});
          
          setProductsCache(cache);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error(error.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleMarkAsPaid = async (orderId) => {
    try {
      setUpdatingOrderId(orderId);
      await orderAPI.updateOrderToPaid(orderId, {});
      setOrders(orders.map(order => 
        order._id === orderId ? { 
          ...order, 
          isPaid: true, 
          paidAt: new Date().toISOString(),
          status: 'Processing'
        } : order
      ));
      toast.success('Order marked as paid successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    try {
      setUpdatingOrderId(orderId);
      await orderAPI.updateOrderToDelivered(orderId);
      setOrders(orders.map(order => 
        order._id === orderId ? { 
          ...order, 
          isDelivered: true, 
          deliveredAt: new Date().toISOString(),
          status: 'Delivered'
        } : order
      ));
      toast.success('Order marked as delivered successfully');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    return (
      order._id?.toLowerCase().includes(searchLower) ||
      (order.user?.name && order.user.name.toLowerCase().includes(searchLower)) ||
      (order.user?.email && order.user.email.toLowerCase().includes(searchLower))
    );
  });

  const getProductName = (productId) => {
    if (!productId) return 'Product';
    
    // Check if product is already populated in order data
    if (typeof productId === 'object' && productId.name) {
      return productId.name;
    }
    
    // Check our products cache
    if (productsCache[productId]) {
      return productsCache[productId].name;
    }
    
    return 'Product';
  };

  const getFarmerDetails = (order) => {
    if (!order.orderItems) return null;
    
    // Try to get farmer details from the first product that has them
    for (const item of order.orderItems) {
      if (item.product?.farmer) {
        return item.product.farmer;
      }
      const productId = item.product?._id || item.product;
      if (productId && productsCache[productId]?.farmer) {
        return productsCache[productId].farmer;
      }
    }
    return null;
  };

  const handlePrintOrder = (orderId) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    const farmer = getFarmerDetails(order);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order #${order._id?.substring(0, 8) || ''}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
            
            body { 
              font-family: 'Poppins', Arial, sans-serif; 
              padding: 30px; 
              color: #333;
              line-height: 1.6;
            }
            
            .header { 
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              border-bottom: 1px solid #eee;
              padding-bottom: 20px;
            }
            
            .logo { 
              max-height: 80px;
            }
            
            .invoice-title {
              text-align: right;
            }
            
            .invoice-title h1 {
              margin: 0;
              color: #2c3e50;
              font-size: 28px;
              font-weight: 600;
            }
            
            .invoice-title p {
              margin: 5px 0 0;
              color: #7f8c8d;
            }
            
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            
            .info-box {
              flex: 1;
              padding: 15px;
              background: #f9f9f9;
              border-radius: 5px;
              margin-right: 15px;
            }
            
            .info-box:last-child {
              margin-right: 0;
            }
            
            .info-box h3 {
              margin-top: 0;
              color: #2c3e50;
              font-size: 16px;
              border-bottom: 1px solid #eee;
              padding-bottom: 8px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 25px 0;
              font-size: 14px;
            }
            
            th {
              background-color: #2c3e50;
              color: white;
              text-align: left;
              padding: 12px;
              font-weight: 500;
            }
            
            td {
              padding: 12px;
              border-bottom: 1px solid #eee;
            }
            
            tr:last-child td {
              border-bottom: none;
            }
            
            .total-row td {
              font-weight: 600;
              background-color: #f9f9f9;
            }
            
            .grand-total {
              font-size: 16px;
              color: #e74c3c;
            }
            
            .status-badge {
              display: inline-block;
              padding: 5px 10px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
            }
            
            .paid {
              background-color: #d4edda;
              color: #155724;
            }
            
            .unpaid {
              background-color: #f8d7da;
              color: #721c24;
            }
            
            .delivered {
              background-color: #d4edda;
              color: #155724;
            }
            
            .pending {
              background-color: #fff3cd;
              color: #856404;
            }
            
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            
            .text-right {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logo}" alt="Company Logo" class="logo">
            <div class="invoice-title">
              <h1>INVOICE</h1>
              <p>Order #${order._id?.substring(0, 8) || ''}</p>
            </div>
          </div>
          
          <div class="info-section">
            <div class="info-box">
              <h3>Order Information</h3>
              <p><strong>Date:</strong> ${order.createdAt ? format(new Date(order.createdAt), 'PPpp') : 'N/A'}</p>
              <p><strong>Status:</strong> 
                <span class="status-badge ${order.isDelivered ? 'delivered' : order.isPaid ? 'paid' : 'unpaid'}">
                  ${order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </p>
              ${order.paidAt ? `<p><strong>Paid At:</strong> ${format(new Date(order.paidAt), 'PPpp')}</p>` : ''}
              ${order.deliveredAt ? `<p><strong>Delivered At:</strong> ${format(new Date(order.deliveredAt), 'PPpp')}</p>` : ''}
            </div>
            
            <div class="info-box">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${order.user?.name || 'Guest'}</p>
              ${order.user?.email ? `<p><strong>Email:</strong> ${order.user.email}</p>` : ''}
              ${order.user?.phone ? `<p><strong>Phone:</strong> ${order.user.phone}</p>` : ''}
            </div>
          </div>
          
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems?.map(item => `
                <tr>
                  <td>${getProductName(item.product)}</td>
                  <td>Ksh ${item.price?.toFixed(2) || '0.00'}</td>
                  <td>${item.quantity || 0}</td>
                  <td class="text-right">Ksh ${((item.price || 0) * (item.quantity || 0))?.toFixed(2) || '0.00'}</td>
                </tr>
              `).join('') || ''}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3">Subtotal:</td>
                <td class="text-right">Ksh ${order.itemsPrice?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3">Shipping:</td>
                <td class="text-right">Ksh ${order.shippingPrice?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3">Tax:</td>
                <td class="text-right">Ksh ${order.taxPrice?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr class="total-row grand-total">
                <td colspan="3">Total Amount:</td>
                <td class="text-right">Ksh ${order.totalPrice?.toFixed(2) || '0.00'}</td>
              </tr>
            </tfoot>
          </table>
          
          <div class="info-section">
            <div class="info-box">
              <h3>Shipping Address</h3>
              <p>${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}</p>
              <p>${order.shippingAddress?.postalCode || ''}, ${order.shippingAddress?.country || ''}</p>
            </div>
            
            ${farmer ? `
            <div class="info-box">
              <h3>Farmer Details</h3>
              <p><strong>Name:</strong> ${farmer.name || 'N/A'}</p>
              <p><strong>Contact:</strong> ${farmer.phone || 'N/A'}</p>
              ${farmer.email ? `<p><strong>Email:</strong> ${farmer.email}</p>` : ''}
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>If you have any questions about this invoice, please contact our customer service.</p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order._id?.substring(0, 8) || ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.createdAt ? format(new Date(order.createdAt), 'PP') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {order.user?.name || 'Guest'}
                      </span>
                      {order.user?.email && (
                        <span className="text-xs text-gray-500">
                          {order.user.email}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.orderItems?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Ksh {order.totalPrice?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${order.isDelivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.isDelivered ? 'Delivered' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-2">
                    <div className="flex flex-col gap-2">
                      {!order.isPaid && (
                        <button
                          onClick={() => handleMarkAsPaid(order._id)}
                          disabled={updatingOrderId === order._id}
                          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                        >
                          {updatingOrderId === order._id ? 'Processing...' : 'Mark as Paid'}
                        </button>
                      )}
                      
                      {order.isPaid && !order.isDelivered && (
                        <button
                          onClick={() => handleMarkAsDelivered(order._id)}
                          disabled={updatingOrderId === order._id}
                          className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                        >
                          {updatingOrderId === order._id ? 'Processing...' : 'Mark as Delivered'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
                      >
                        View Details
                      </button>
                      
                      <button
                        onClick={() => handlePrintOrder(order._id)}
                        className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded"
                      >
                        Print Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <svg
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No orders found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm
                        ? 'Try adjusting your search criteria'
                        : 'There are currently no orders in the system'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}