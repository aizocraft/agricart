import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu } from 'react-feather';
import { useSelector } from 'react-redux';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { cartItems } = useSelector(state => state.cart);
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-green-600">
          AgriCart
        </Link>
        
        <div className="hidden md:flex space-x-6">
          <Link to="/products" className="hover:text-green-600 transition">Products</Link>
          {user && <Link to="/orders" className="hover:text-green-600 transition">My Orders</Link>}
          {user?.role === 'farmer' && <Link to="/farmer/dashboard" className="hover:text-green-600 transition">Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin/dashboard" className="hover:text-green-600 transition">Admin</Link>}
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="relative">
            <ShoppingCart className="w-6 h-6" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-2">
              <Link to="/profile" className="flex items-center">
                <User className="w-5 h-5" />
                <span className="ml-1 hidden sm:inline">{user.name}</span>
              </Link>
            </div>
          ) : (
            <Link to="/login" className="flex items-center space-x-1">
              <User className="w-5 h-5" />
              <span>Login</span>
            </Link>
          )}
          
          <button className="md:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}