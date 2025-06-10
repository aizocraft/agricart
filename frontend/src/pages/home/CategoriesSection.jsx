import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaLeaf } from 'react-icons/fa';
import { GiCorn, GiFarmer, GiFruitBowl, GiWheat } from 'react-icons/gi';

export default function CategoriesSection({ currentTheme }) {
  const categories = [
    { name: 'Fruits', icon: <GiFruitBowl className="text-4xl" />, bg: 'from-red-100 to-red-50', kenyan: ['Mangoes', 'Pineapples', 'Passion Fruits'] },
    { name: 'Vegetables', icon: <FaLeaf className="text-4xl" />, bg: 'from-green-100 to-green-50', kenyan: ['Sukuma Wiki', 'Kale', 'Tomatoes'] },
    { name: 'Dairy', icon: '🥛', bg: 'from-blue-100 to-blue-50', kenyan: ['Maziwa', 'Mala', 'Yogurt'] },
    { name: 'Grains', icon: <GiWheat className="text-4xl" />, bg: 'from-amber-100 to-amber-50', kenyan: ['Mahindi', 'Maharage', 'Ngano'] },
    { name: 'Herbs', icon: '🌿', bg: 'from-lime-100 to-lime-50', kenyan: ['Dania', 'Sage', 'Thyme'] },
    { name: 'Spices', icon: '🧂', bg: 'from-yellow-100 to-yellow-50', kenyan: ['Pilipili', 'Turmeric', 'Cumin'] }
  ];

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
    <section className={`py-12 ${currentTheme.bg}`}>
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={`text-3xl md:text-4xl font-bold ${currentTheme.text} mb-3`}>
            Kenyan <span className="text-green-600">Farm Categories</span>
          </h2>
          <p className={`${currentTheme.lightText} max-w-2xl mx-auto text-lg`}>
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
                  className={`block h-full p-6 rounded-2xl bg-gradient-to-br ${category.bg} border ${currentTheme.border} shadow-sm hover:shadow-md transition-all`}
                >
                  <div className="flex justify-center mb-3">
                    {category.icon}
                  </div>
                  <h3 className={`text-xl font-bold ${currentTheme.text} text-center mb-2`}>{category.name}</h3>
                  <ul className={`text-sm ${currentTheme.lightText} text-center`}>
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
  );
}