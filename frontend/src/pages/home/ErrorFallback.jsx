import { motion } from 'framer-motion';

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <motion.div 
      className="text-center p-6 bg-red-50 rounded-lg max-w-md mx-auto"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
      <p className="text-red-600 mt-2 mb-4">{error.message}</p>
      <motion.button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Try again
      </motion.button>
    </motion.div>
  );
}