import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogOut, ChevronDown, Sun, Moon } from 'react-feather';
import { useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { cartItems } = useSelector(state => state.cart);
  const { user, isAuthenticated, logout } = useAuth();
  const { darkMode, toggleDarkMode, currentTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  // Animation variants
  const menuVariants = {
    open: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        type: 'spring',
        damping: 20,
        stiffness: 300,
        mass: 0.5
      }
    },
    closed: { 
      opacity: 0, 
      height: 0,
      transition: { 
        duration: 0.2,
        ease: 'easeInOut'
      } 
    }
  };

  const logoVariants = {
    hover: { 
      scale: 1.05,
      rotate: -2,
      transition: { 
        type: 'spring',
        stiffness: 500,
        damping: 15
      }
    },
    tap: { 
      scale: 0.95 
    }
  };

  return (
    <header className={`${currentTheme.glass} shadow-sm sticky top-0 z-50 border-b ${currentTheme.border}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <motion.div
            whileHover="hover"
            whileTap="tap"
            variants={logoVariants}
            onHoverStart={() => setIsHoveringLogo(true)}
            onHoverEnd={() => setIsHoveringLogo(false)}
          >
            <Link 
              to="/" 
              className={`text-2xl font-bold ${darkMode ? 'text-emerald-400' : 'text-green-600'} flex items-center`}
            >
              <span className="hidden sm:inline flex items-center">
                AgriCart
                {isHoveringLogo && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`ml-2 text-xs font-normal bg-gradient-to-r ${darkMode ? 'from-emerald-400 to-teal-400' : 'from-green-500 to-emerald-500'} text-white px-2 py-1 rounded-full`}
                  >
                    Fresh & Local
                  </motion.span>
                )}
              </span>
              <span className="sm:hidden">AC</span>
            </Link>
          </motion.div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 items-center">
            <NavLink to="/products" darkMode={darkMode}>
              Products
            </NavLink>
            
            {isAuthenticated && (
              <NavLink to="/orders" darkMode={darkMode}>
                My Orders
              </NavLink>
            )}
            
            {user?.role === 'farmer' && (
              <NavLink to="/farmer/dashboard" darkMode={darkMode}>
                Farmer Dashboard
              </NavLink>
            )}
            
            {user?.role === 'admin' && (
              <NavLink to="/admin/dashboard" darkMode={darkMode}>
                Admin Dashboard
              </NavLink>
            )}
          </nav>
          
          <div className="flex items-center space-x-3">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors duration-200`}
              aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </motion.button>
            
            <CartIcon cartItems={cartItems} darkMode={darkMode} />
            
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleProfileMenu}
                  className={`flex items-center space-x-2 p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all duration-200`}
                  aria-expanded={profileMenuOpen}
                  aria-label="User menu"
                >
                  <motion.div 
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${currentTheme.avatar} flex items-center justify-center font-medium shadow-inner`}
                    whileHover={{ rotate: 5 }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </motion.div>
                  <span className={`hidden md:inline ${currentTheme.text} font-medium`}>
                    {user.name.split(' ')[0]}
                  </span>
                  <motion.div
                    animate={{ rotate: profileMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </motion.div>
                </motion.button>
                
                <AnimatePresence>
                  {profileMenuOpen && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={menuVariants}
                      className={`absolute right-0 mt-2 w-56 ${currentTheme.card} rounded-xl shadow-lg py-1 z-50 border ${currentTheme.border} overflow-hidden`}
                    >
                      <div className={`px-4 py-3 border-b ${currentTheme.border}`}>
                        <p className={`text-sm font-medium ${currentTheme.text}`}>{user.name}</p>
                        <p className={`text-xs ${currentTheme.lightText}`}>{user.email}</p>
                      </div>
                      
                      <ProfileMenuLink 
                        to="/profile" 
                        onClick={() => setProfileMenuOpen(false)}
                        icon={<User size={16} className={currentTheme.lightText} />}
                        darkMode={darkMode}
                      >
                        Your Profile
                      </ProfileMenuLink>
                      
                      {user.role === 'farmer' && (
                        <ProfileMenuLink 
                          to="/farmer/dashboard" 
                          onClick={() => setProfileMenuOpen(false)}
                          darkMode={darkMode}
                        >
                          Farmer Dashboard
                        </ProfileMenuLink>
                      )}
                      
                      {user.role === 'admin' && (
                        <ProfileMenuLink 
                          to="/admin/dashboard" 
                          onClick={() => setProfileMenuOpen(false)}
                          darkMode={darkMode}
                        >
                          Admin Dashboard
                        </ProfileMenuLink>
                      )}
                      
                      <div className={`border-t ${currentTheme.border} my-1`}></div>
                      
                      <button
                        onClick={handleLogout}
                        className={`w-full px-4 py-2 text-sm ${currentTheme.text} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} flex items-center transition-colors duration-150 group`}
                      >
                        <motion.div
                          whileHover={{ x: 2 }}
                          className="flex items-center"
                        >
                          <LogOut className={`w-4 h-4 mr-2 ${currentTheme.lightText} group-hover:text-red-500 transition-colors`} />
                          Sign out
                        </motion.div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link 
                  to="/login" 
                  className={`px-4 py-2 text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-emerald-400 hover:bg-gray-800' : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'} transition-colors rounded-lg`}
                >
                  Login
                </Link>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    to="/register" 
                    className={`px-4 py-2 text-sm font-medium text-white bg-gradient-to-r ${currentTheme.primary} hover:${currentTheme.primaryHover} rounded-lg transition-all shadow-sm hover:shadow-md flex items-center`}
                  >
                    <span className="relative">
                      Register
                      <motion.span
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        className="absolute bottom-0 left-0 h-0.5 bg-white"
                        transition={{ duration: 0.3 }}
                      />
                    </span>
                  </Link>
                </motion.div>
              </div>
            )}
            
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`md:hidden p-2 rounded-full ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
              onClick={toggleMobileMenu}
              aria-label="Mobile menu"
            >
              <Menu className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </motion.button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className={`md:hidden mt-3 space-y-1 overflow-hidden ${currentTheme.secondaryBg} rounded-lg`}
            >
              <MobileLink to="/products" onClick={toggleMobileMenu} darkMode={darkMode}>
                Products
              </MobileLink>
              
              {isAuthenticated && (
                <MobileLink to="/orders" onClick={toggleMobileMenu} darkMode={darkMode}>
                  My Orders
                </MobileLink>
              )}
              
              {user?.role === 'farmer' && (
                <MobileLink to="/farmer/dashboard" onClick={toggleMobileMenu} darkMode={darkMode}>
                  Farmer Dashboard
                </MobileLink>
              )}
              
              {user?.role === 'admin' && (
                <MobileLink to="/admin/dashboard" onClick={toggleMobileMenu} darkMode={darkMode}>
                  Admin Dashboard
                </MobileLink>
              )}
              
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className={`w-full text-left px-4 py-3 ${currentTheme.text} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded-lg flex items-center transition-colors group`}
                >
                  <motion.div
                    whileHover={{ x: 2 }}
                    className="flex items-center"
                  >
                    <LogOut className={`w-5 h-5 mr-2 ${currentTheme.lightText} group-hover:text-red-500 transition-colors`} />
                    Sign out
                  </motion.div>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

// Reusable components
const NavLink = ({ to, children, darkMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = darkMode ? {
    text: 'text-gray-300 hover:text-emerald-400',
    bg: 'hover:bg-gray-800/50',
    underline: 'bg-emerald-400'
  } : {
    text: 'text-gray-700 hover:text-green-600',
    bg: 'hover:bg-gray-50',
    underline: 'bg-green-600'
  };
  
  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <Link 
        to={to} 
        className={`${theme.text} ${theme.bg} font-medium px-3 py-1.5 rounded-lg flex items-center transition-colors`}
      >
        {children}
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: isHovered ? '100%' : 0 }}
          className={`absolute bottom-0 left-0 h-0.5 ${theme.underline}`}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </Link>
    </motion.div>
  );
};

const ProfileMenuLink = ({ to, onClick, children, icon, darkMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = darkMode ? {
    text: 'text-gray-300',
    bg: 'hover:bg-gray-700',
    underline: 'bg-emerald-400'
  } : {
    text: 'text-gray-700',
    bg: 'hover:bg-gray-50',
    underline: 'bg-green-600'
  };
  
  return (
    <motion.div
      whileHover={{ x: 3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link
        to={to}
        onClick={onClick}
        className={`block px-4 py-2.5 text-sm ${theme.text} ${theme.bg} flex items-center transition-colors duration-150`}
      >
        {icon && <span className="mr-3">{icon}</span>}
        <span className="relative">
          {children}
          <motion.span
            initial={{ width: 0 }}
            animate={{ width: isHovered ? '100%' : 0 }}
            className={`absolute bottom-0 left-0 h-0.5 ${theme.underline}`}
            transition={{ duration: 0.3 }}
          />
        </span>
      </Link>
    </motion.div>
  );
};

const MobileLink = ({ to, onClick, children, darkMode }) => {
  const theme = darkMode ? {
    text: 'text-gray-300',
    bg: 'hover:bg-gray-700'
  } : {
    text: 'text-gray-700',
    bg: 'hover:bg-gray-50'
  };
  
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={to}
        onClick={onClick}
        className={`block px-4 py-3 ${theme.text} ${theme.bg} rounded-lg transition-colors`}
      >
        {children}
      </Link>
    </motion.div>
  );
};

// Animation variants for cart notification
const cartNotificationVariants = {
  hover: { scale: 1.2 },
  initial: { scale: 1 },
};

const CartIcon = ({ cartItems, darkMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const theme = darkMode ? {
    icon: 'text-gray-300 group-hover:text-emerald-400',
    bg: 'hover:bg-gray-800',
    badge: 'bg-emerald-500'
  } : {
    icon: 'text-gray-700 group-hover:text-green-600',
    bg: 'hover:bg-gray-100',
    badge: 'bg-green-600'
  };
  
  return (
    <motion.div
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <Link 
        to="/cart" 
        className={`p-2 rounded-full ${theme.bg} transition-colors group`}
        aria-label="Shopping cart"
      >
        <motion.div
          animate={{ rotate: isHovered ? [0, 10, -10, 0] : 0 }}
          transition={{ duration: 0.5 }}
        >
          <ShoppingCart className={`w-5 h-5 ${theme.icon} transition-colors`} />
        </motion.div>
        
        {itemCount > 0 && (
          <motion.span 
            variants={cartNotificationVariants}
            className={`absolute top-0 right-0 ${theme.badge} text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-sm`}
          >
            {itemCount}
          </motion.span>
        )}
      </Link>
    </motion.div>
  );
};