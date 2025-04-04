import { Link } from 'react-router-dom';
import StarRating from './StarRating';

const ProductCard = ({ product, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 ${className}`}>
      <Link to={`/products/${product._id}`}>
        <div className="aspect-square bg-gray-100">
          <img 
            src={product.images[0]} 
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
          <div className="mt-1 flex items-center">
            <StarRating rating={product.rating} />
            <span className="ml-1 text-sm text-gray-600">({product.numReviews})</span>
          </div>
          <p className="mt-2 text-lg font-semibold text-green-600">
            ${product.price.toFixed(2)}
          </p>
          {product.organic && (
            <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide">
              Organic
            </span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;