import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function LatestProducts({
  products,
  loading,
  error,
  cartItems,
  handleAddToCart,
  loadProducts,
  currentTheme
}) {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
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

  return (
    <section className={`py-12 ${currentTheme.secondaryBg}`}>
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-3xl md:text-4xl font-bold ${currentTheme.text} mb-3`}>
            Fresh from <span className="text-green-600">Kenyan Farms</span>
          </h2>
          <p className={`${currentTheme.lightText} max-w-2xl mx-auto text-lg`}>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className={`inline-flex flex-col items-center max-w-md p-6 ${currentTheme.card} rounded-lg shadow-md`}>
                <svg className="w-12 h-12 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className={`text-lg ${currentTheme.text} mb-4`}>{error}</p>
                <motion.button 
                  onClick={loadProducts}
                  className={`flex items-center px-5 py-2 ${currentTheme.primary} text-white rounded-md hover:${currentTheme.primaryHover} transition-colors`}
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
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
                      className={`h-full border ${currentTheme.border} hover:shadow-lg transition-all`}
                      currentTheme={currentTheme}
                    />
                  </motion.div>
                </div>
              ))}
            </Slider>
          )}
        </AnimatePresence>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link 
            to="/products" 
            className={`inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white ${currentTheme.primary} hover:${currentTheme.primaryHover} transition-all`}
          >
            View All Kenyan Products
            <svg className="ml-3 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}