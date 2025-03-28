import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: 1,
      })
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-gray-500">No Image</span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-gray-600 mt-1">${product.price.toFixed(2)}</p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {product.description}
        </p>

        {/* Actions: Stock, View & Add to Cart */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">Stock: {product.stock}</span>
          
          <div className="flex space-x-2">
            <Link 
              to={`/products/${product._id}`}
              className="px-3 py-1 bg-primary text-white rounded hover:bg-secondary transition"
            >
              View
            </Link>

            <button
              onClick={handleAddToCart}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
