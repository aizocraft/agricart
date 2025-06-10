import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion } from 'framer-motion';
import { GiCorn } from 'react-icons/gi';

export default function KenyanFactsCarousel({ currentTheme }) {
  const kenyanFacts = [
    "Kenya is Africa's leading tea producer",
    "Over 75% of Kenya's workforce is in agriculture",
    "The Rift Valley is Kenya's breadbasket",
    "Kenyan coffee is world-renowned for its quality",
    "Small-scale farmers produce 75% of Kenya's food"
  ];

  const sliderSettings = {
    slidesToShow: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 5000,
    dots: false,
    fade: true
  };

  return (
    <section className={`py-8 ${currentTheme.secondaryBg} border-y ${currentTheme.border}`}>
      <div className="container mx-auto px-4">
        <Slider {...sliderSettings}>
          {kenyanFacts.map((fact, index) => (
            <motion.div 
              key={index}
              className="px-4 py-2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`inline-flex items-center max-w-3xl ${currentTheme.card} rounded-full px-6 py-3 shadow-sm`}>
                <GiCorn className="text-yellow-500 text-2xl mr-3" />
                <p className={`text-lg font-medium ${currentTheme.text}`}>{fact}</p>
              </div>
            </motion.div>
          ))}
        </Slider>
      </div>
    </section>
  );
}