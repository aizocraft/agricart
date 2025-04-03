import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogOut } from 'react-feather';
import { useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Navbar() {
  const { cartItems } = useSelector(state => state.cart);
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setProfileMenuOpen(!profileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-600 flex items-center">
            <span className="hidden sm:inline">AgriCart</span>
            <span className="sm:hidden">AC</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/products" className="text-gray-700 hover:text-green-600 transition font-medium">
              Products
            </Link>
            
            {isAuthenticated && (
              <Link to="/orders" className="text-gray-700 hover:text-green-600 transition font-medium">
                My Orders
              </Link>
            )}
            
            {user?.role === 'farmer' && (
              <Link to="/farmer/dashboard" className="text-gray-700 hover:text-green-600 transition font-medium">
                Farmer Dashboard
              </Link>
            )}
            
            {user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="text-gray-700 hover:text-green-600 transition font-medium">
                Admin Dashboard
              </Link>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline ml-1 text-gray-700">{user.name}</span>
                </button>
                
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    {user.role === 'farmer' && (
                      <Link 
                        to="/farmer/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Farmer Dashboard
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin/dashboard" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link 
                  to="/login" 
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-green-600 transition"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition"
                >
                  Register
                </Link>
              </div>
            )}
            
            <button 
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition"
              onClick={toggleMobileMenu}
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <Link 
              to="/products" 
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={toggleMobileMenu}
            >
              Products
            </Link>
            
            {isAuthenticated && (
              <Link 
                to="/orders" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={toggleMobileMenu}
              >
                My Orders
              </Link>
            )}
            
            {user?.role === 'farmer' && (
              <Link 
                to="/farmer/dashboard" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={toggleMobileMenu}
              >
                Farmer Dashboard
              </Link>
            )}
            
            {user?.role === 'admin' && (
              <Link 
                to="/admin/dashboard" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={toggleMobileMenu}
              >
                Admin Dashboard
              </Link>
            )}
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}