import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await fetchProducts({ limit: 4, featured: true });
        setFeaturedProducts(data);
      } catch (err) {
        console.error('Failed to load featured products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadFeaturedProducts();
  }, []);

  return (
    <div className="pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              Fresh Farm Produce <br />Direct to Your Doorstep
            </h1>
            <p className="text-lg text-gray-600">
              Connect with local farmers and enjoy the freshest agricultural products at competitive prices.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link 
                to="/products" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 transition"
              >
                Browse Products
              </Link>
              {user?.role === 'farmer' && (
                <Link 
                  to="/farmer/dashboard" 
                  className="inline-flex items-center px-6 py-3 border border-green-600 text-base font-medium rounded-lg shadow-sm text-green-600 bg-white hover:bg-green-50 transition"
                >
                  Farmer Dashboard
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link 
                  to="/admin/dashboard" 
                  className="inline-flex items-center px-6 py-3 border border-green-600 text-base font-medium rounded-lg shadow-sm text-green-600 bg-white hover:bg-green-50 transition"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
              alt="Fresh farm produce"
              className="rounded-xl shadow-xl w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our selection of fresh, high-quality products from trusted local farmers
          </p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                className="hover:shadow-lg transition-shadow duration-300"
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link 
            to="/products" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 transition"
          >
            View All Products
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}