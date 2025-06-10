import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { productAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ErrorBoundary } from 'react-error-boundary';
import { useTheme } from '../contexts/ThemeContext';
import HeroSection from './home/HeroSection';
import KenyanFactsCarousel from './home/KenyanFactsCarousel';
import CategoriesSection from './home/CategoriesSection';
import LatestProducts from './home/LatestProducts';
import BenefitsSection from './home/BenefitsSection';
import ErrorFallback from './home/ErrorFallback';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDocumentMetadata } from '../hooks/useDocumentMetadata';

export default function Home() {
  useDocumentMetadata({
    title: 'Home Page',
    description: 'Explore products, latest arrivals, and special offers'
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.cartItems);
  const { currentTheme } = useTheme();

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productAPI.getProducts({
        limit: 12,
        sort: '-createdAt'
      });

      const loadedProducts = Array.isArray(response?.data?.products) ? 
        response.data.products : 
        (Array.isArray(response?.data) ? response.data : []);
      
      setProducts(loadedProducts);
      
      if (loadedProducts.length === 0) {
        setError('No products available. Check back later!');
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(err.response?.data?.message || 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAddToCart = (product) => {
    if (!user) return;

    const cartItem = {
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      stock: product.stock,
      quantity: 1,
      unit: product.unit,
      farmer: product.farmer,
      farmName: product.farmer?.farmName || 'Local Farm',
      location: product.location
    };

    dispatch(addToCart(cartItem));
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className={`min-h-screen bg-gradient-to-b ${currentTheme.secondaryBg} ${currentTheme.bg}`}>
        <HeroSection user={user} currentTheme={currentTheme} />
        <KenyanFactsCarousel currentTheme={currentTheme} />
        <CategoriesSection currentTheme={currentTheme} />
        <LatestProducts 
          products={products}
          loading={loading}
          error={error}
          cartItems={cartItems}
          handleAddToCart={handleAddToCart}
          loadProducts={loadProducts}
          currentTheme={currentTheme}
        />
        <BenefitsSection currentTheme={currentTheme} />
      </div>
    </ErrorBoundary>
  );
}