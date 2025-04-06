import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { productAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ErrorBoundary } from 'react-error-boundary';
import { FaLeaf, FaShoppingCart, FaChevronRight, FaChevronLeft, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { GiCorn, GiFarmer, GiFruitBowl, GiWheat } from 'react-icons/gi';
import { TbTractor } from 'react-icons/tb';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';

// Kenyan-themed categories
const categories = [
  { name: 'Fruits', icon: <GiFruitBowl className="text-4xl" />, bg: 'from-red-100 to-red-50', kenyan: ['Mangoes', 'Pineapples', 'Passion Fruits'] },
  { name: 'Vegetables', icon: <FaLeaf className="text-4xl" />, bg: 'from-green-100 to-green-50', kenyan: ['Sukuma Wiki', 'Kale', 'Tomatoes'] },
  { name: 'Dairy', icon: '🥛', bg: 'from-blue-100 to-blue-50', kenyan: ['Maziwa', 'Mala', 'Yogurt'] },
  { name: 'Grains', icon: <GiWheat className="text-4xl" />, bg: 'from-amber-100 to-amber-50', kenyan: ['Mahindi', 'Maharage', 'Ngano'] },
  { name: 'Herbs', icon: '🌿', bg: 'from-lime-100 to-lime-50', kenyan: ['Dania', 'Sage', 'Thyme'] },
  { name: 'Spices', icon: '🧂', bg: 'from-yellow-100 to-yellow-50', kenyan: ['Pilipili', 'Turmeric', 'Cumin'] }
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const scaleUp = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <motion.div 
    className="text-center p-6 bg-red-50 rounded-lg max-w-md mx-auto"
    initial="hidden"
    animate="visible"
    variants={scaleUp}
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

// Custom arrow components for sliders
const SampleNextArrow = (props) => {
  const { onClick } = props;
  return (
    <motion.div
      onClick={onClick}
      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-green-50 transition-colors cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FaChevronRight className="text-green-600" />
    </motion.div>
  );
};

const SamplePrevArrow = (props) => {
  const { onClick } = props;
  return (
    <motion.div
      onClick={onClick}
      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-green-50 transition-colors cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FaChevronLeft className="text-green-600" />
    </motion.div>
  );
};

// Slider settings
const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  nextArrow: <SampleNextArrow />,
  prevArrow: <SamplePrevArrow />,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
      }
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
      }
    }
  ]
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.cartItems);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load latest products
      const response = await productAPI.getProducts({
        limit: 12,
        sort: '-createdAt'
      });

      const loadedProducts = Array.isArray(response?.data?.products) ? 
        response.data.products : 
        (Array.isArray(response?.data) ? response.data : []);
      
      setProducts(loadedProducts);
      
      if (loadedProducts.length === 0) {
        setError('No products available. Check back later!');
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.response?.data?.message || 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAddToCart = (product) => {
    if (!user) {
      // Optionally redirect to login
      return;
    }

    const cartItem = {
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      stock: product.stock,
      quantity: 1,
      unit: product.unit,
      farmer: product.farmer,
      farmName: product.farmer?.farmName || 'Local Farm',
      location: product.location
    };

    dispatch(addToCart(cartItem));
  };

  // Kenyan agricultural facts
  const kenyanFacts = [
    "Kenya is Africa's leading tea producer",
    "Over 75% of Kenya's workforce is in agriculture",
    "The Rift Valley is Kenya's breadbasket",
    "Kenyan coffee is world-renowned for its quality",
    "Small-scale farmers produce 75% of Kenya's food"
  ];

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        {/* Hero Section with Kenyan theme */}
        <section className="relative overflow-hidden bg-gradient-to-r from-green-700 to-emerald-700">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80')] bg-cover bg-center"></div>
          <div className="container mx-auto px-4 py-24 md:py-32 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
            <motion.div 
              className="md:w-1/2 space-y-6"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Fresh <span className="text-yellow-300">Kenyan</span> Farm Produce
              </h1>
              <p className="text-lg md:text-xl text-green-100 max-w-lg">
                Direct from Kenyan farms to your table - the freshest seasonal produce at competitive prices.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/products" 
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-green-800 bg-yellow-400 hover:bg-yellow-300 transition-all"
                  >
                    Shop Now
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </motion.div>
                
                {user?.role === 'farmer' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/farmer/dashboard" 
                      className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-xl shadow-sm text-white bg-transparent hover:bg-white/10 transition-all"
                    >
                      Farmer Dashboard
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 relative"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img 
                  src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" 
                  alt="Kenyan farm produce"
                  className="w-full h-auto object-cover aspect-video"
                  loading="lazy"
                  width={735}
                  height={490}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <p className="text-sm">Fresh produce from Kenyan highlands</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Kenyan Agricultural Facts Carousel */}
        <section className="py-8 bg-yellow-50 border-y border-yellow-200">
          <div className="container mx-auto px-4">
            <Slider 
              {...{
                ...sliderSettings,
                slidesToShow: 1,
                arrows: false,
                autoplay: true,
                autoplaySpeed: 5000,
                dots: false,
                fade: true
              }}
            >
              {kenyanFacts.map((fact, index) => (
                <motion.div 
                  key={index}
                  className="px-4 py-2 text-center"
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                >
                  <div className="inline-flex items-center max-w-3xl bg-white rounded-full px-6 py-3 shadow-sm">
                    <GiCorn className="text-yellow-500 text-2xl mr-3" />
                    <p className="text-lg font-medium text-gray-800">{fact}</p>
                  </div>
                </motion.div>
              ))}
            </Slider>
          </div>
        </section>

        {/* Categories Section with Kenyan Flair */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                Kenyan <span className="text-green-600">Farm Categories</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Discover fresh produce from our rich Kenyan agricultural heritage
              </p>
            </motion.div>

            <Slider {...sliderSettings}>
              {categories.map((category) => (
                <div key={category.name} className="px-2">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="h-full"
                  >
                    <Link 
                      to={`/products?category=${category.name}`}
                      className={`block h-full p-6 rounded-2xl bg-gradient-to-br ${category.bg} border border-gray-100 shadow-sm hover:shadow-md transition-all`}
                    >
                      <div className="flex justify-center mb-3">
                        {category.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 text-center mb-2">{category.name}</h3>
                      <ul className="text-sm text-gray-600 text-center">
                        {category.kenyan.map(item => (
                          <li key={item} className="mb-1">{item}</li>
                        ))}
                      </ul>
                    </Link>
                  </motion.div>
                </div>
              ))}
            </Slider>
          </div>
        </section>

        {/* Latest Products from Kenyan Farms */}
        <section className="py-12 bg-green-50">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                Fresh from <span className="text-green-600">Kenyan Farms</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Our newest additions straight from Kenyan soil
              </p>
            </motion.div>

            <AnimatePresence>
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
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  className="text-center py-12"
                >
                  <div className="inline-flex flex-col items-center max-w-md p-6 bg-white rounded-lg shadow-md">
                    <svg className="w-12 h-12 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-lg text-gray-700 mb-4">{error}</p>
                    <motion.button 
                      onClick={loadProducts}
                      className="flex items-center px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Refresh Products
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <Slider {...sliderSettings}>
                  {products.map((product) => (
                    <div key={product._id} className="px-2">
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        whileHover={{ 
                          y: -5,
                          transition: { duration: 0.3 }
                        }}
                        className="h-full"
                      >
                        <ProductCard 
                          product={product} 
                          onAddToCart={() => handleAddToCart(product)}
                          isInCart={cartItems.some(item => item.product === product._id)}
                          className="h-full border border-gray-100 hover:shadow-lg transition-all"
                        />
                      </motion.div>
                    </div>
                  ))}
                </Slider>
              )}
            </AnimatePresence>

            <motion.div 
              className="text-center mt-12"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Link 
                to="/products" 
                className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                View All Kenyan Products
                <svg className="ml-3 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Kenyan Farm Benefits */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
              <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80')] bg-cover bg-center"></div>
              <div className="relative z-10">
                <motion.div 
                  className="text-center mb-12"
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Why Choose <span className="text-yellow-300">Kenyan</span> FarmConnect
                  </h2>
                  <p className="text-green-100 max-w-2xl mx-auto text-lg">
                    Supporting Kenya's agricultural heritage while bringing you the freshest produce
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      title: "Support Kenyan Farmers",
                      description: "Your purchase directly supports Kenyan farming families",
                      icon: <GiFarmer className="text-4xl" />
                    },
                    {
                      title: "Fresh from Kenyan Soil",
                      description: "Produce harvested at peak freshness from Kenyan farms",
                      icon: <TbTractor className="text-4xl" />
                    },
                    {
                      title: "Sustainable Practices",
                      description: "Eco-friendly farming that preserves Kenya's land",
                      icon: <FaLeaf className="text-4xl" />
                    }
                  ].map((benefit, index) => (
                    <motion.div
                      key={benefit.title}
                      initial="hidden"
                      animate="visible"
                      variants={fadeIn}
                      transition={{ delay: 0.2 * index }}
                      whileHover={{ 
                        y: -5,
                        scale: 1.02,
                        transition: { duration: 0.3 }
                      }}
                      className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20"
                    >
                      <div className="flex justify-center mb-4 text-yellow-300">
                        {benefit.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-center">{benefit.title}</h3>
                      <p className="text-green-100 text-center">{benefit.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}