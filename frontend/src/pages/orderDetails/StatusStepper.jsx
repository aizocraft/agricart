import { motion } from 'framer-motion';

export default function StatusStepper({ order, formatDate }) {
  const getStatusSteps = () => {
    return [
      { 
        id: 'ordered', 
        name: 'Order Placed', 
        description: 'Your order has been received', 
        date: order?.createdAt,
        completed: true
      },
      { 
        id: 'paid', 
        name: 'Payment', 
        description: order?.isPaid ? 'Payment completed' : 'Awaiting payment', 
        date: order?.paidAt,
        completed: order?.isPaid
      },
      { 
        id: 'processed', 
        name: 'Processing', 
        description: order?.isPaid ? 'Preparing your order' : 'Will start after payment', 
        date: order?.isPaid ? new Date(order.createdAt).setHours(new Date(order.createdAt).getHours() + 1) : null,
        completed: order?.isPaid
      },
      { 
        id: 'delivered', 
        name: 'Delivered', 
        description: order?.isDelivered ? 'Order delivered' : 'On the way', 
        date: order?.deliveredAt,
        completed: order?.isDelivered
      }
    ];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h2 className="text-lg font-semibold mb-6">Order Status</h2>
      <div className="relative">
        <div className="absolute top-0 left-4 h-full w-0.5 bg-gray-200" />
        <ul className="space-y-8">
          {getStatusSteps().map((step, stepIdx) => (
            <motion.li 
              key={step.id}
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: stepIdx * 0.1 }}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {step.completed ? (
                      <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-white">{stepIdx + 1}</span>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className={`text-sm font-medium ${
                    step.completed ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {step.description}
                  </p>
                  {step.date && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(step.date)}
                    </p>
                  )}
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}