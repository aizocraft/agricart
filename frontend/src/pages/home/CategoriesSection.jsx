import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaLeaf, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { GiFruitBowl, GiWheat } from 'react-icons/gi';

// Custom arrow components
const NextArrow = ({ onClick, currentTheme }) => (
  <button
    onClick={onClick}
    className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full ${
      currentTheme.darkMode 
        ? 'bg-gray-700 hover:bg-gray-600 text-emerald-300' 
        : 'bg-white hover:bg-gray-100 text-emerald-600'
    } shadow-lg hover:shadow-xl transition-all`}
    aria-label="Next"
  >
    <FaChevronRight className="text-lg" />
  </button>
);

const PrevArrow = ({ onClick, currentTheme }) => (
  <button
    onClick={onClick}
    className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full ${
      currentTheme.darkMode 
        ? 'bg-gray-700 hover:bg-gray-600 text-emerald-300' 
        : 'bg-white hover:bg-gray-100 text-emerald-600'
    } shadow-lg hover:shadow-xl transition-all`}
    aria-label="Previous"
  >
    <FaChevronLeft className="text-lg" />
  </button>
);

export default function CategoriesSection({ currentTheme }) {
  const categories = [
    { 
      name: 'Fruits', 
      icon: <GiFruitBowl className="text-4xl" />, 
      bgLight: 'from-red-100/80 to-pink-100/80', 
      bgDark: 'from-red-900/20 via-red-800/20 to-pink-900/20',
      kenyan: ['Mangoes', 'Pineapples', 'Passion Fruits'] 
    },
    { 
      name: 'Vegetables', 
      icon: <FaLeaf className="text-4xl" />, 
      bgLight: 'from-green-100/80 to-emerald-100/80', 
      bgDark: 'from-green-900/20 via-green-800/20 to-emerald-900/20',
      kenyan: ['Sukuma Wiki', 'Kale', 'Tomatoes'] 
    },
    { 
      name: 'Dairy', 
      icon: '🥛', 
      bgLight: 'from-blue-100/80 to-cyan-100/80', 
      bgDark: 'from-blue-900/20 via-blue-800/20 to-cyan-900/20',
      kenyan: ['Maziwa', 'Mala', 'Yogurt'] 
    },
    { 
      name: 'Grains', 
      icon: <GiWheat className="text-4xl" />, 
      bgLight: 'from-amber-100/80 to-yellow-100/80', 
      bgDark: 'from-amber-900/20 via-amber-800/20 to-yellow-900/20',
      kenyan: ['Mahindi', 'Maharage', 'Ngano'] 
    },
    { 
      name: 'Herbs', 
      icon: '🌿', 
      bgLight: 'from-lime-100/80 to-green-100/80', 
      bgDark: 'from-lime-900/20 via-lime-800/20 to-green-900/20',
      kenyan: ['Dania', 'Sage', 'Thyme'] 
    },
    { 
      name: 'Spices', 
      icon: '🧂', 
      bgLight: 'from-yellow-100/80 to-orange-100/80', 
      bgDark: 'from-yellow-900/20 via-yellow-800/20 to-orange-900/20',
      kenyan: ['Pilipili', 'Turmeric', 'Cumin'] 
    }
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    nextArrow: <NextArrow currentTheme={currentTheme} />,
    prevArrow: <PrevArrow currentTheme={currentTheme} />,
    appendDots: dots => (
      <div className={`${currentTheme.darkMode ? 'bg-gray-800/50' : 'bg-white/50'} rounded-full py-3 px-4`}>
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
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          arrows: false
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          arrows: false
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          arrows: false
        }
      }
    ]
  };

  return (
    <section className={`py-16 ${currentTheme.bg}`}>
      <div className="container mx-auto px-4 relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-4xl md:text-5xl font-bold ${currentTheme.text} mb-4`}>
            Product <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent"> Categories</span>
          </h2>
          <p className={`${currentTheme.lightText} max-w-2xl mx-auto text-lg md:text-xl`}>
            Discover fresh produce from our rich Kenyan agricultural heritage
          </p>
        </motion.div>

        <div className="relative">
          <Slider {...sliderSettings}>
            {categories.map((category) => (
              <div key={category.name} className="px-2">
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  <Link 
                    to={`/products?category=${category.name}`}
                    className={`block h-full p-8 rounded-3xl bg-gradient-to-br ${
                      currentTheme.darkMode ? category.bgDark : category.bgLight
                    } border ${currentTheme.border} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="flex justify-center mb-4">
                      <div className={`p-4 rounded-full ${
                        currentTheme.darkMode ? 'bg-gray-800/50' : 'bg-white/80'
                      } shadow-sm group-hover:shadow-md transition-all`}>
                        {category.icon}
                      </div>
                    </div>
                    
                    <h3 className={`text-2xl font-bold ${currentTheme.text} text-center mb-3 relative z-10`}>
                      {category.name}
                    </h3>
                    
                    <ul className={`text-sm ${currentTheme.lightText} text-center space-y-1 relative z-10`}>
                      {category.kenyan.map(item => (
                        <li key={item} className="transition-all group-hover:translate-x-1">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Link>
                </motion.div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}