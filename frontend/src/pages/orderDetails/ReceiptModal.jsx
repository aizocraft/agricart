 import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from './orderUtils';
import logo from '../../assets/logo.png';

export default function ReceiptModal({ 
  showReceipt, 
  setShowReceipt, 
  order, 
  user,
  onPrintSuccess = () => {}
}) {
  if (!order) return null;

  // Calculate values with fallbacks
  const subtotal = order.itemsPrice?.toFixed(2) || '0.00';
  const tax = order.taxPrice?.toFixed(2) || '0.00';
  const shipping = order.shippingPrice === 0 ? 'Free' : `KES ${order.shippingPrice?.toFixed(2) || '0.00'}`;
  const total = order.totalPrice?.toFixed(2) || '0.00';
  const orderNumber = order._id?.substring(0, 8).toUpperCase() || 'N/A';

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    // Basic HTML structure for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${orderNumber}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 
                Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.5; 
              color: #111827; 
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header { 
              text-align: center;
              margin-bottom: 2rem;
            }
            .logo { 
              height: 3.5rem;
              margin-bottom: 0.75rem;
            }
            .title { 
              font-size: 1.5rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            .divider { 
              width: 5rem;
              height: 1px;
              background: #e5e7eb;
              margin: 0.75rem auto;
            }
            .order-number { 
              font-size: 0.875rem;
              color: #6b7280;
            }
            .section-title { 
              font-size: 0.875rem;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 0.5rem;
            }
            .grid { 
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 2rem;
              margin-bottom: 2rem;
            }
            .info-text { 
              font-size: 0.875rem;
              margin-bottom: 0.25rem;
            }
            .info-label { 
              font-weight: 500;
            }
            table { 
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 2rem;
            }
            th, td { 
              padding: 0.75rem;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            th { 
              font-size: 0.75rem;
              font-weight: 500;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              background: #f9fafb;
            }
            .item-name { 
              font-weight: 500;
            }
            .organic-badge { 
              display: inline-block;
              background: #d1fae5;
              color: #065f46;
              font-size: 0.75rem;
              padding: 0.125rem 0.375rem;
              border-radius: 0.25rem;
              margin-top: 0.125rem;
            }
            .summary-box { 
              background: #f9fafb;
              padding: 1rem;
              border-radius: 0.5rem;
            }
            .summary-row { 
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.5rem;
              font-size: 0.875rem;
            }
            .total-row { 
              border-top: 1px solid #e5e7eb;
              padding-top: 0.5rem;
              margin-top: 0.5rem;
              font-weight: 600;
            }
            .footer { 
              border-top: 1px solid #e5e7eb;
              padding-top: 1rem;
              margin-top: 3rem;
              text-align: center;
              font-size: 0.75rem;
              color: #6b7280;
            }
            @page { 
              margin: 10mm;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logo}" alt="Company Logo" class="logo" />
            <h1 class="title">ORDER RECEIPT</h1>
            <div class="divider"></div>
            <p class="order-number">#${orderNumber}</p>
          </div>

          <div class="grid">
            <div>
              <h3 class="section-title">Order Details</h3>
              <p class="info-text"><span class="info-label">Date:</span> ${formatDate(order.createdAt)}</p>
              <p class="info-text"><span class="info-label">Status:</span> ${order.status?.toLowerCase() || 'processing'}</p>
              <p class="info-text"><span class="info-label">Payment:</span> ${order.paymentMethod || 'N/A'}</p>
              ${order.isPaid ? `<p class="info-text"><span class="info-label">Paid On:</span> ${formatDate(order.paidAt)}</p>` : ''}
            </div>

            <div>
              <h3 class="section-title">Customer</h3>
              <p class="info-text"><span class="info-label">${user?.name || 'N/A'}</span></p>
              <p class="info-text">${order.shippingAddress?.address || 'N/A'}</p>
              <p class="info-text">${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.postalCode || 'N/A'}</p>
              <p class="info-text">${order.shippingAddress?.country || 'N/A'}</p>
              ${order.shippingAddress?.phone ? `<p class="info-text"><span class="info-label">Phone:</span> ${order.shippingAddress.phone}</p>` : ''}
            </div>
          </div>

          <h3 class="section-title">Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: right">Qty</th>
                <th style="text-align: right">Price</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems?.map((item, index) => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center;">
                      <span style="margin-right: 0.5rem; font-weight: 500; color: #6b7280;">${index + 1}.</span>
                      <div>
                        <p class="item-name">${item.name || 'Unnamed Product'}</p>
                        ${item.product?.organic ? '<span class="organic-badge">Organic</span>' : ''}
                      </div>
                    </div>
                  </td>
                  <td style="text-align: right">${item.quantity || 0}</td>
                  <td style="text-align: right">KES ${item.price?.toFixed(2) || '0.00'}</td>
                  <td style="text-align: right; font-weight: 500">
                    KES ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="grid">
            ${order.isPaid && order.paymentResult ? `
              <div>
                <h3 class="section-title">Payment Details</h3>
                <div class="summary-box">
                  <p class="info-text"><span class="info-label">Transaction ID:</span> ${order.paymentResult.id || 'N/A'}</p>
                  <p class="info-text"><span class="info-label">Status:</span> ${order.paymentResult.status || 'N/A'}</p>
                  <p class="info-text"><span class="info-label">Email:</span> ${order.paymentResult.email || 'N/A'}</p>
                </div>
              </div>
            ` : '<div></div>'}

            <div>
              <h3 class="section-title">Summary</h3>
              <div class="summary-box">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span>KES ${subtotal}</span>
                </div>
                <div class="summary-row">
                  <span>Tax (10%):</span>
                  <span>KES ${tax}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping:</span>
                  <span>${shipping}</span>
                </div>
                <div class="summary-row total-row">
                  <span>Total:</span>
                  <span>KES ${total}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your purchase!</p>
            <p style="margin-top: 0.25rem;">This is your official receipt. Please keep it for your records.</p>
          </div>

          <script>
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 300);
            }, 100);
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    onPrintSuccess();
  };

  return (
    <AnimatePresence>
      {showReceipt && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Printable Content */}
            <div className="p-6">
              <div className="flex flex-col items-center mb-8">
                <img src={logo} alt="Company Logo" className="h-14 mb-3" />
                <h2 className="text-2xl font-bold text-gray-800">ORDER RECEIPT</h2>
                <div className="w-20 h-0.5 bg-gray-300 my-3"></div>
                <p className="text-sm text-gray-500">#{orderNumber}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Details</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Date:</span> {formatDate(order.createdAt)}</p>
                    <p><span className="font-medium">Status:</span> <span className="capitalize">{order.status?.toLowerCase() || 'processing'}</span></p>
                    <p><span className="font-medium">Payment:</span> <span className="capitalize">{order.paymentMethod || 'N/A'}</span></p>
                    {order.isPaid && (
                      <p><span className="font-medium">Paid On:</span> {formatDate(order.paidAt)}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer</h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{user?.name || 'N/A'}</p>
                    <p>{order.shippingAddress?.address || 'N/A'}</p>
                    <p>{order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.postalCode || 'N/A'}</p>
                    <p>{order.shippingAddress?.country || 'N/A'}</p>
                    {order.shippingAddress?.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.orderItems?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <span className="mr-2 font-medium text-gray-500">{index + 1}.</span>
                              <div>
                                <p className="font-medium text-gray-900">{item.name || 'Unnamed Product'}</p>
                                {item.product?.organic && (
                                  <span className="inline-block bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded mt-0.5">
                                    Organic
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                            {item.quantity || 0}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">
                            KES {item.price?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                            KES {((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {order.isPaid && order.paymentResult && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-600">Transaction ID:</p>
                        <p className="font-medium">{order.paymentResult.id || 'N/A'}</p>
                        <p className="text-gray-600">Status:</p>
                        <p className="font-medium capitalize">{order.paymentResult.status || 'N/A'}</p>
                        <p className="text-gray-600">Email:</p>
                        <p className="font-medium">{order.paymentResult.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">KES {subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (10%):</span>
                        <span className="font-medium">KES {tax}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-medium">{shipping}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>KES {total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>Thank you for your purchase!</p>
                <p className="mt-1">This is your official receipt. Please keep it for your records.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}