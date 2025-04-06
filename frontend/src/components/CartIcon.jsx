import { ShoppingCart } from 'react-feather';
import { Link } from 'react-router-dom';

export default function CartIcon({ cartItems, darkMode }) {
  const itemCount = cartItems?.length || 0;
  return (
    <motion.div
      whileHover="hover"
      className="relative"
    >
      <Link
        to="/cart"
        className={`p-2 rounded-full transition-colors duration-200 ${
          darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
        }`}
        aria-label="Cart"
      >
        <ShoppingCart className={`w-5 h-5 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`} />
      </Link>

      {itemCount > 0 && (
        <motion.span
          className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.2 }}
        >
          {itemCount}
        </motion.span>
      )}
    </motion.div>
  );
}
