import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GiFruitBowl } from 'react-icons/gi';

export default function HeroSection({ user, currentTheme }) {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-r ${currentTheme.primary}`}>
      <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80')] bg-cover bg-center"></div>
      <div className="container mx-auto px-4 py-24 md:py-32 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
        <motion.div 
          className="md:w-1/2 space-y-6"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight`}>
            Fresh <span className="text-yellow-300">Kenyan</span> Farm Produce
          </h1>
          <p className="text-green-100 max-w-lg text-lg md:text-xl">
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
  );
}