import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

// Add this import
import SearchFilter from '../components/SearchFilter';

export default function Products() {
  const dispatch = useDispatch();
  const { items: products, status, error } = useSelector((state) => state.products);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  if (status === 'loading') return <Loader />;
  if (status === 'failed') return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <SearchFilter />
        </div>
        <div className="md:col-span-3">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Our Products</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
