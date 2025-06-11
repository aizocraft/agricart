import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from "../../contexts/AuthContext";
import { toast } from 'react-hot-toast';

// Custom arrow components
const NextArrow = ({ onClick, currentTheme }) => (
  <button
    onClick={onClick}
    className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full ${
      currentTheme.darkMode 
        ? 'bg-gray-700 hover:bg-gray-600 text-emerald-300' 
        : 'bg-white hover:bg-gray-50 text-emerald-600'
    } shadow-lg hover:shadow-xl transition-all border ${currentTheme.border}`}
    aria-label="Next"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  </button>
);

const PrevArrow = ({ onClick, currentTheme }) => (
  <button
    onClick={onClick}
    className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full ${
      currentTheme.darkMode 
        ? 'bg-gray-700 hover:bg-gray-600 text-emerald-300' 
        : 'bg-white hover:bg-gray-50 text-emerald-600'
    } shadow-lg hover:shadow-xl transition-all border ${currentTheme.border}`}
    aria-label="Previous"
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  </button>
);

export default function LatestProducts({
  products,
  loading,
  error,
  cartItems,
  handleAddToCart,
  loadProducts,
  currentTheme
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    nextArrow: <NextArrow currentTheme={currentTheme} />,
    prevArrow: <PrevArrow currentTheme={currentTheme} />,
    appendDots: dots => (
      <div className={`${currentTheme.darkMode ? 'bg-gray-800/50' : 'bg-white/50'} rounded-full py-3 px-4 shadow-sm`}>
        <ul className="flex justify-center gap-2">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className={`w-3 h-3 rounded-full transition-all ${
        currentTheme.darkMode ? 'bg-gray-500 hover:bg-emerald-400' : 'bg-gray-300 hover:bg-emerald-500'
      }`} />
    ),
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, arrows: false }
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1, arrows: false }
      }
    ]
  };

  const handleAuthAddToCart = (product) => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      setTimeout(() => navigate('/login'), 1500); // Delay to allow toast to display
      return;
    }
    handleAddToCart(product);
  };

  return (
    <section className={`py-16 ${currentTheme.secondaryBg}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-4xl md:text-5xl font-bold ${currentTheme.text} mb-4`}>
            Fresh from <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">Our Farms</span>
          </h2>
          <p className={`${currentTheme.lightText} max-w-2xl mx-auto text-lg md:text-xl`}>
            Our newest additions straight from the soil
          </p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-16">
                <LoadingSpinner size="lg" variant={currentTheme.darkMode ? "light" : "dark"} />
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-16">
                <motion.div 
                  className={`inline-flex flex-col items-center max-w-md p-8 ${currentTheme.card} rounded-xl shadow-lg border ${currentTheme.border}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="relative mb-4">
                    <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="absolute inset-0 bg-yellow-500/10 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <h3 className={`text-xl font-semibold ${currentTheme.text} mb-3`}>Oops! Something went wrong</h3>
                  <p className={`${currentTheme.lightText} mb-6`}>{error}</p>
                  <motion.button 
                    onClick={loadProducts}
                    className={`flex items-center px-6 py-3 rounded-xl shadow-sm text-white ${
                      currentTheme.darkMode ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'
                    } transition-colors`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Products
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Slider {...sliderSettings}>
                  {products.map((product) => (
                    <div key={product._id} className="px-2">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -10, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                        className="h-full"
                      >
                        <ProductCard 
                          product={product}
                          onAddToCart={() => handleAuthAddToCart(product)}
                          isInCart={cartItems.some(item => item.product === product._id)}
                          className={`h-full border ${currentTheme.border} hover:shadow-xl transition-all duration-300`}
                          currentTheme={currentTheme}
                        />
                      </motion.div>
                    </div>
                  ))}
                </Slider>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link 
            to="/products" 
            className={`inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl shadow-lg text-white ${
              currentTheme.darkMode 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
            } transition-all duration-300`}
          >
            Explore All Products
            <svg className="ml-3 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
