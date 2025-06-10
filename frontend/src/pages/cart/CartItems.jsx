// pages/cart/CartItems.jsx
import { motion, AnimatePresence } from 'framer-motion';

export default function CartItems({ items, onRemove, onQuantityChange }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <AnimatePresence>
        {items.map(item => (
          <motion.div 
            key={item.product}
            className="p-4 border-b flex flex-col sm:flex-row"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            layout
          >
            <div className="flex-shrink-0">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-20 h-20 object-cover rounded-lg"
                loading="lazy"
              />
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 flex-grow">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.unit && `${item.quantity} ${item.unit}`}
                  </p>
                </div>
                <button 
                  onClick={() => onRemove(item.product)}
                  className="text-red-500 hover:text-red-700 transition-colors h-6"
                  aria-label="Remove item"
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center border rounded-md overflow-hidden">
                  <button
                    onClick={() => onQuantityChange(item.product, item.quantity - 1)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Decrease quantity"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-center w-12">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onQuantityChange(item.product, item.quantity + 1)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-700 font-medium">
                  KES {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}