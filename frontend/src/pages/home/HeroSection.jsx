import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { GiFruitBowl, GiFarmer, GiShoppingCart } from 'react-icons/gi';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export default function HeroSection({ user, currentTheme }) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1] // Modern spring-like easing
      }
    }
  };

  const buttonVariants = {
    initial: {
      backgroundColor: currentTheme.buttonPrimary,
      color: currentTheme.buttonText,
      borderColor: currentTheme.buttonPrimary
    },
    hover: {
      backgroundColor: currentTheme.buttonText,
      color: currentTheme.buttonPrimary,
      borderColor: currentTheme.buttonText,
      transition: { 
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const secondaryButtonVariants = {
    initial: {
      backgroundColor: 'transparent',
      color: currentTheme.buttonText,
      borderColor: currentTheme.buttonText
    },
    hover: {
      backgroundColor: currentTheme.buttonText,
      color: currentTheme.buttonPrimary,
      borderColor: currentTheme.buttonText,
      transition: { 
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const stats = [
    { icon: <GiFarmer className="text-2xl" />, label: '500+ Farmers' },
    { icon: <GiFruitBowl className="text-2xl" />, label: '100+ Products' },
    { icon: <GiShoppingCart className="text-2xl" />, label: '5000+ Customers' },
  ];

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden min-h-screen flex items-center justify-center bg-gradient-to-br ${currentTheme.primary}`}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              opacity: Math.random() * 0.5 + 0.1
            }}
            animate={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              transition: {
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: "linear"
              }
            }}
          />
        ))}
      </div>

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-fixed bg-cover bg-center opacity-30"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1471&q=80')",
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
        {/* Left Content */}
        <motion.div
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="space-y-6 md:space-y-8 order-2 md:order-1"
        >
          {/* Logo & Title */}
          <motion.div 
            className="flex flex-col items-start gap-4"
          >
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center p-2 shadow-lg">
                <img 
                  src="/logo.png" 
                  alt="Agricart Logo" 
                  className="w-full h-full object-contain" 
                  style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' }}
                />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
                <motion.span 
                  className={`${currentTheme.highlightText}`}
                  variants={itemVariants}
                >
                  Agricart
                </motion.span> Kenya
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-green-50 text-lg md:text-xl leading-relaxed max-w-xl"
            >
              Experience the bounty of Kenyan farms — fresh, local, and direct to your doorstep.
            </motion.p>
          </motion.div>

          {/* Key Stats */}
          <motion.div 
            className="flex flex-wrap gap-3 md:gap-4"
            variants={containerVariants}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                custom={index}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg backdrop-blur-sm border border-white/10 transition-colors cursor-default"
                whileHover={{ 
                  y: -2,
                  transition: { duration: 0.2 }
                }}
              >
                <span className={`${currentTheme.highlightText}`}>{stat.icon}</span>
                <span className="font-medium text-sm md:text-base">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-wrap gap-3 md:gap-4 pt-2"
            variants={containerVariants}
          >
            <motion.div
              variants={itemVariants}
              custom={0}
            >
              <Link
                to="/products"
                className="inline-flex items-center px-5 py-2.5 md:px-6 md:py-3 text-base md:text-lg font-semibold rounded-lg shadow-lg transition-all"
              >
                <motion.span
                  className="relative z-10 flex items-center"
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  Shop Now
                  <svg 
                    className="ml-2 w-4 h-4 md:w-5 md:h-5" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.span>
              </Link>
            </motion.div>

            {user?.role === 'farmer' && (
              <motion.div
                variants={itemVariants}
                custom={1}
              >
                <Link
                  to="/farmer/dashboard"
                  className="inline-flex items-center px-5 py-2.5 md:px-6 md:py-3 text-base md:text-lg font-semibold rounded-lg border-2 shadow-lg transition-all"
                >
                  <motion.span
                    className="relative z-10"
                    variants={secondaryButtonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Farmer Dashboard
                  </motion.span>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Right: Hero Image */}
        <motion.div
          className="relative w-full aspect-square md:aspect-video overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl border-4 border-white/20 order-1 md:order-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            transition: { 
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1]
            }
          }}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.4 }
          }}
        >
          <motion.img
            src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=1471&q=80"
            alt="Kenyan produce"
            className="object-cover w-full h-full"
            initial={{ scale: 1.1 }}
            animate={{ 
              scale: 1,
              transition: { 
                duration: 8,
                ease: [0.16, 1, 0.3, 1]
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <motion.p 
              className="text-sm md:text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  delay: 0.6,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
            >
              Fresh from the Kenyan Highlands
            </motion.p>
            <motion.div 
              className="flex items-center mt-2"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                transition: { 
                  delay: 0.8,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1]
                }
              }}
            >
              <div className="flex -space-x-2">
                {[22, 23, 24].map((id) => (
                  <motion.img
                    key={id}
                    src={`https://randomuser.me/api/portraits/women/${id}.jpg`}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white"
                    alt="Happy customer"
                    whileHover={{ 
                      y: -4,
                      transition: { duration: 0.2 }
                    }}
                  />
                ))}
              </div>
              <span className="ml-3 text-xs md:text-sm">Trusted by 5000+ customers</span>
            </motion.div>
          </div>

          {/* Floating Badge */}
          <motion.div
            className="absolute top-4 right-4 bg-yellow-400 text-green-900 font-semibold px-3 py-1 md:px-4 md:py-2 rounded-full shadow-md"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ 
              scale: 1, 
              rotate: 6,
              transition: { 
                delay: 0.5,
                type: 'spring',
                stiffness: 300,
                damping: 10
              }
            }}
            whileHover={{
              rotate: [6, -6, 6],
              transition: { duration: 0.6 }
            }}
          >
            Fresh!
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}