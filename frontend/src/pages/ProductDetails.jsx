import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, orderAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/StarRating';
import ImageGallery from '../components/ImageGallery';
import ReviewForm from '../components/ReviewForm';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { cartItems } = useSelector(state => state.cart);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productAPI.getProductById(id);
        
        if (!response?.data) {
          throw new Error('Product not found');
        }

        const productData = response.data;

        // Validate and normalize product data
        const validatedProduct = {
          _id: productData._id,
          name: productData.name || 'Product Name',
          images: Array.isArray(productData.images) && productData.images.length > 0 
            ? productData.images 
            : ['/placeholder-product.jpg'],
          rating: typeof productData.rating === 'number' ? productData.rating : 0,
          numReviews: typeof productData.numReviews === 'number' ? productData.numReviews : 0,
          stock: typeof productData.stock === 'number' ? productData.stock : 0,
          price: typeof productData.price === 'number' ? productData.price : 0,
          organic: Boolean(productData.organic),
          category: productData.category || 'General',
          subCategory: productData.subCategory || '',
          location: productData.location || 'Not specified',
          harvestDate: productData.harvestDate || null,
          description: productData.description || 'No description available',
          farmer: productData.farmer || null,
          reviews: Array.isArray(productData.reviews) ? productData.reviews : []
        };

        setProduct(validatedProduct);
      } catch (err) {
        setError(err.message || 'Failed to load product details');
        toast.error(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    if (!product || product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }

    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: quantity,
      stock: product.stock
    }));
    
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to proceed with purchase');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    if (!product || product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }

    try {
      const orderData = {
        orderItems: [{
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          quantity: quantity
        }],
        itemsPrice: product.price * quantity,
        taxPrice: (product.price * quantity) * 0.1,
        shippingPrice: 10,
        totalPrice: (product.price * quantity) * 1.1 + 10
      };

      const { data } = await orderAPI.createOrder(orderData);
      navigate(`/orders/${data._id}/payment`);
    } catch (error) {
      toast.error(error.message || 'Failed to create order');
    }
  };

  const isInCart = product ? cartItems.some(item => item.product === product._id) : false;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl mb-4 text-red-500">{error}</h1>
        <button 
          onClick={() => window.location.reload()}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Try Again
        </button>
        <button 
          onClick={() => navigate('/products')}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl mb-4">Product not found</h1>
        <button 
          onClick={() => navigate('/products')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <ImageGallery 
            images={product.images} 
            selected={selectedImage}
            onSelect={setSelectedImage}
          />
        </div>
        
        {/* Product Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <div className="flex items-center mb-2">
              <StarRating rating={product.rating} />
              <span className="ml-2 text-sm text-gray-600">
                ({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})
              </span>
            </div>
            {product.organic && (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide mb-2">
                Organic Certified
              </span>
            )}
          </div>
          
          <div className="mb-6">
            <p className="text-3xl font-semibold text-green-600 mb-4">
              ${product.price.toFixed(2)}
            </p>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Stock Status</h2>
              <p className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock > 0 ? (
                  <>
                    <span className="font-bold">{product.stock}</span> available
                  </>
                ) : 'Out of stock'}
              </p>
            </div>
            
            {product.stock > 0 ? (
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-6 py-2 text-center w-12">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddToCart}
                      className={`px-6 py-3 rounded-lg font-medium transition ${
                        isInCart 
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      disabled={isInCart}
                    >
                      {isInCart ? '✓ Added to Cart' : 'Add to Cart'}
                    </button>
                    
                    <button
                      onClick={handleBuyNow}
                      className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-700">This product is currently out of stock</p>
                <button
                  onClick={() => navigate('/products')}
                  className="mt-2 text-green-600 hover:text-green-800 text-sm"
                >
                  Browse similar products
                </button>
              </div>
            )}
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Category:</span> {product.category}
                {product.subCategory && ` > ${product.subCategory}`}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">Location:</span> {product.location}
              </p>
              {product.harvestDate && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Harvest Date:</span> {new Date(product.harvestDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('description')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'description'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reviews ({product.numReviews})
            </button>
            {product.farmer && (
              <button
                onClick={() => setActiveTab('farmer')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'farmer'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                About the Farmer
              </button>
            )}
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'description' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
              {user && (
                <ReviewForm 
                  productId={product._id} 
                  onReviewAdded={() => window.location.reload()} 
                />
              )}
              <div className="mt-6 space-y-6">
                {product.reviews.length > 0 ? (
                  product.reviews.map(review => (
                    <div key={review._id} className="border-b pb-4">
                      <div className="flex items-center mb-2">
                        <StarRating rating={review.rating} />
                        <span className="ml-2 font-medium">{review.user?.name || 'Anonymous'}</span>
                        <span className="ml-auto text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'farmer' && product.farmer && (
            <div>
              <h3 className="text-lg font-semibold mb-4">About the Farmer</h3>
              <div className="flex items-start space-x-4">
                <img 
                  src={product.farmer.avatar || '/default-avatar.png'} 
                  alt={product.farmer.name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div>
                  <h4 className="font-medium">{product.farmer.name}</h4>
                  <p className="text-sm text-gray-600">{product.farmer.farmName}</p>
                  <p className="text-sm text-gray-600 mt-1">{product.farmer.location}</p>
                  <button
                    onClick={() => navigate(`/products/farmer/${product.farmer._id}`)}
                    className="mt-2 text-sm text-green-600 hover:text-green-800"
                  >
                    View all products from this farmer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}