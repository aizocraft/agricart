import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FaMapMarkerAlt, 
  FaLeaf, 
  FaShoppingCart, 
  FaStar, 
  FaRegStar, 
  FaChevronLeft,
  FaCheck // Add this import
} from 'react-icons/fa';
import { productAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageGallery from '../components/ImageGallery';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import { useAuth } from '../contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';

 export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.cartItems);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);

  const isInCart = cartItems.some(item => item.product === id);
  const outOfStock = product?.stock === 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await productAPI.getProductById(id);
        setProduct(data.product || data);
        
        // Fetch related products
        if (data.product?.category || data?.category) {
          const category = data.product?.category || data?.category;
          const { data: related } = await productAPI.getProducts({ 
            category, 
            limit: 4,
            sort: 'rating-desc'
          });
          setRelatedProducts(related.products || related);
        }

        // Fetch reviews (assuming your API has this endpoint)
        // const { data: reviewsData } = await productAPI.getProductReviews(id);
        // setReviews(reviewsData.reviews || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product');
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/auth/login');
      return;
    }

    if (outOfStock) {
      toast.error('This product is out of stock');
      return;
    }

    const cartItem = {
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      stock: product.stock,
      quantity: quantity,
      unit: product.unit,
      farmer: product.farmer,
      farmName: product.farmName || 'Local Farm',
      location: product.location
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart`);
  };

  const handleQuantityChange = (newQuantity) => {
    const validatedQuantity = Math.max(1, Math.min(newQuantity, product.stock));
    setQuantity(validatedQuantity);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {error || 'Product not found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We couldn't find the product you're looking for.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center mx-auto"
          >
            <FaChevronLeft className="mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link
                to="/"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-green-600 dark:text-gray-400 dark:hover:text-white"
              >
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 text-gray-400 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <Link
                  to="/products"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-green-600 md:ml-2 dark:text-gray-400 dark:hover:text-white"
                >
                  Products
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 text-gray-400 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Main Product Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="lg:sticky lg:top-4">
              <ImageGallery images={product.images} />
            </div>

            {/* Product Info */}
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {product.name}
                  </h1>
                  <div className="flex items-center mt-2">
                    <StarRating rating={product.rating || 0} />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      ({product.numReviews || 0} reviews)
                    </span>
                  </div>
                </div>
                {product.organic && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <FaLeaf className="mr-1" />
                    Organic
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FaMapMarkerAlt className="text-green-500 dark:text-green-300 mr-1" />
                <span>
                  {product.location} • {product.farmer?.farmName || 'Local Farm'}
                </span>
              </div>

              <div className="mt-6">
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                  Ksh {product.price.toLocaleString()}
                  <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
                    / {product.unit}
                  </span>
                </h2>

                {product.stock > 0 ? (
                  <p className="text-green-600 dark:text-green-400 mt-1">
                    In Stock ({product.stock} available)
                  </p>
                ) : (
                  <p className="text-red-500 dark:text-red-400 mt-1">Out of Stock</p>
                )}
              </div>

              {product.harvestDate && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Harvested on: {new Date(product.harvestDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mt-6">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-3 py-1 border border-gray-300 rounded-l-md bg-gray-50 text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      className="w-16 text-center border-t border-b border-gray-300 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="px-3 py-1 border border-gray-300 rounded-r-md bg-gray-50 text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="mt-8">
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart || outOfStock}
                  className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center transition-colors ${
                    outOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isInCart
                      ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {outOfStock ? (
                    'Out of Stock'
                  ) : isInCart ? (
                    <>
                      <FaCheck className="mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <FaShoppingCart className="mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-10">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('description')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'description'
                          ? 'border-green-500 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      Description
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'reviews'
                          ? 'border-green-500 text-green-600 dark:text-green-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      Reviews ({product.numReviews || 0})
                    </button>
                  </nav>
                </div>

                <div className="mt-6">
                  {activeTab === 'description' ? (
                    <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                      {product.description || 'No description available.'}
                    </div>
                  ) : (
                    <div>
                      {user ? (
                        <ReviewForm 
                          productId={product._id} 
                          onReviewSubmit={(newReview) => setReviews([...reviews, newReview])} 
                        />
                      ) : (
                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-gray-600 dark:text-gray-300">
                            Please <Link to="/auth/login" className="text-green-600 hover:underline dark:text-green-400">login</Link> to leave a review.
                          </p>
                        </div>
                      )}

                      {reviews.length > 0 ? (
                        <div className="space-y-6">
                          {reviews.map((review) => (
                            <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                              <div className="flex items-center mb-2">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {review.user?.name || 'Anonymous'}
                                </div>
                                <div className="ml-4 flex items-center">
                                  <StarRating rating={review.rating} />
                                </div>
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              You may also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts
                .filter(p => p._id !== product._id)
                .slice(0, 4)
                .map((relatedProduct) => (
                  <div key={relatedProduct._id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <Link to={`/products/${relatedProduct._id}`} className="block">
                      <img
                        src={relatedProduct.images?.[0]}
                        alt={relatedProduct.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <FaMapMarkerAlt className="text-green-500 dark:text-green-300 mr-1" />
                          <span>{relatedProduct.location}</span>
                        </div>
                        <div className="text-green-700 dark:text-green-400 font-bold">
                          Ksh {relatedProduct.price.toLocaleString()}
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                            / {relatedProduct.unit}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}