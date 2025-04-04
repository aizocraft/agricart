import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { ErrorBoundary } from 'react-error-boundary';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  hover: {
    y: -5,
    transition: { duration: 0.2 }
  }
};

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <motion.div 
    className="text-center p-6 bg-red-50 rounded-lg max-w-md mx-auto"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0 }}
  >
    <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
    <p className="text-red-600 mt-2 mb-4">{error.message}</p>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Try again
    </button>
  </motion.div>
);

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Set document title
  useEffect(() => {
    document.title = "FarmConnect | Fresh Farm Produce";
    return () => { document.title = "FarmConnect"; };
  }, []);

  const loadFeaturedProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchProducts({ 
        limit: 4, 
        featured: true,
        cache: 'no-cache'
      });
      
      // Enhanced data validation
      const products = Array.isArray(response?.data) ? response.data : [];
      
      setFeaturedProducts(products);
      if (products.length === 0) {
        setError('No featured products available. Check back later!');
      }
    } catch (err) {
      console.error('Failed to load featured products:', err);
      setError(err.response?.data?.message || 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadFeaturedProducts();
    
    return () => controller.abort();
  }, [loadFeaturedProducts]);

  // Refresh button animation
  // eslint-disable-next-line no-unused-vars
  const refreshVariants = {
    initial: { rotate: 0 },
    animate: { rotate: 360 },
    transition: { duration: 0.5 }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen pb-12 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-100">
          <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <motion.div 
              className="md:w-1/2 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                Fresh Farm Produce <br className="hidden sm:block" />Direct to Your Doorstep
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-lg">
                Connect with local farmers and enjoy the freshest, seasonal agricultural products at competitive prices.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/products" 
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 transition-all"
                  >
                    Browse Products
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </motion.div>
                
                {user?.role === 'farmer' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/farmer/dashboard" 
                      className="inline-flex items-center px-6 py-3 border border-green-600 text-base font-medium rounded-lg shadow-sm text-green-600 bg-white hover:bg-green-50 transition-all"
                    >
                      Farmer Dashboard
                    </Link>
                  </motion.div>
                )}
                
                {user?.role === 'admin' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/admin/dashboard" 
                      className="inline-flex items-center px-6 py-3 border border-green-600 text-base font-medium rounded-lg shadow-sm text-green-600 bg-white hover:bg-green-50 transition-all"
                    >
                      Admin Dashboard
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
            >
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                  alt="Fresh farm produce"
                  className="w-full h-auto object-cover aspect-video"
                  loading="lazy"
                  width={735}
                  height={490}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Featured <span className="text-green-600">Products</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Discover our selection of fresh, high-quality products from trusted local farmers
            </p>
          </motion.div>
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-12"
              >
                <LoadingSpinner size="lg" />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="inline-flex flex-col items-center max-w-md p-6 bg-white rounded-lg shadow-md">
                  <svg className="w-12 h-12 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-lg text-gray-700 mb-4">{error}</p>
                  <motion.button 
                    onClick={loadFeaturedProducts}
                    className="flex items-center px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Products
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="products"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
              >
                {featuredProducts.length > 0 ? (
                  featuredProducts.map(product => (
                    <motion.div 
                      key={product._id} 
                      variants={itemVariants}
                      whileHover="hover"
                      className="relative"
                    >
                      <ProductCard 
                        product={product} 
                        className="h-full hover:shadow-lg transition-shadow duration-300"
                      />
                      {product.organic && (
                        <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Organic
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    className="col-span-full text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="inline-flex flex-col items-center max-w-md p-6 bg-white rounded-lg shadow-md">
                      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No Featured Products</h3>
                      <p className="text-gray-500 mb-4">We couldn't find any featured products at this time.</p>
                      <motion.button 
                        onClick={loadFeaturedProducts}
                        className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Check Again
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="text-center mt-12 md:mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link 
                to="/products" 
                className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 transition-all"
              >
                View All Products
                <svg className="ml-3 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Seasonal Categories Section */}
        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                Seasonal <span className="text-green-600">Categories</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Explore what's fresh and in season right now
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {['Fruits', 'Vegetables', 'Dairy', 'Grains'].map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="relative overflow-hidden rounded-xl shadow-md group"
                >
                  <Link to={`/products/category/${category.toLowerCase()}`} className="block">
                    <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                      <div className="text-center p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{category}</h3>
                        <p className="text-sm text-gray-600">Shop Now</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}