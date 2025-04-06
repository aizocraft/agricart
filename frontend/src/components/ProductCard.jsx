import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaLeaf, FaCartPlus, FaCheck } from 'react-icons/fa';

export default function ProductCard({ product, onAddToCart, isInCart }) {
  const outOfStock = product.stock === 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01] w-full max-w-sm mx-auto overflow-hidden border border-gray-100 dark:border-gray-800">
      <Link to={`/products/${product._id}`} className="block">
        <div className="relative">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="w-full h-60 object-cover rounded-t-2xl transition-transform duration-300 hover:scale-105"
          />

          {product.organic && (
            <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md backdrop-blur-sm">
              <FaLeaf className="inline-block mr-1 mb-0.5" />
              Organic
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate mb-1">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <FaMapMarkerAlt className="text-green-500 dark:text-green-300" />
            <span>{product.location}</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-green-700 dark:text-green-400 font-bold text-xl">
              Ksh {product.price.toLocaleString()}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              / {product.unit}
            </span>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          onClick={onAddToCart}
          disabled={isInCart || outOfStock}
          className={`w-full mt-3 py-2 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ease-in-out
            ${
              outOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isInCart
                ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
            }
          `}
        >
          {outOfStock ? (
            'Out of Stock'
          ) : isInCart ? (
            <>
              <FaCheck />
              In Cart
            </>
          ) : (
            <>
              <FaCartPlus />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
