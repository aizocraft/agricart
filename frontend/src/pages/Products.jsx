import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Pagination from '../components/Pagination';
import FilterSidebar from '../components/FilterSidebar';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { useDocumentMetadata } from '../hooks/useDocumentMetadata';

const categories = [
  'Fruits',
  'Vegetables',
  'Dairy',
  'Grains',
  'Meat',
  'Poultry',
  'Seafood',
  'Herbs',
  'Spices',
  'Other'
];

const locations = [
  'Nyeri',
  'Embu',
  'Kiambu',
  'Mombasa',
  'Nairobi',
  'Kisumu',
  'Eldoret',
  'Thika',
  'Nakuru'
];

const sortOptions = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'location', label: 'Nearest First' }
];

export default function Products() {
    useDocumentMetadata({
      title: 'Product Listing',
      description: 'Browse various farm products by category, price, and location'
    });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(state => state.cart.cartItems);

  // Get current filters from URL
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const organic = searchParams.get('organic') === 'true';
  const locationFilter = searchParams.get('location') || '';
  const sort = searchParams.get('sort') || 'newest';
  const limit = 12;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        
        const params = {
          page: currentPage,
          limit,
          search: keyword,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          organic: organic || undefined,
          location: locationFilter || undefined,
          sort
        };

        let response;
        if (category) {
          response = await productAPI.getProductsByCategory(category, params);
        } else {
          response = await productAPI.getProducts(params);
        }

        setProducts(response.data.products || response.data);
        setTotalProducts(response.data.total || response.total || 0);
      } catch (error) {
        toast.error('Failed to load products');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, keyword, category, minPrice, maxPrice, organic, locationFilter, sort]);

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/auth/login');
      return;
    }

    const cartItem = {
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      stock: product.stock,
      quantity: 1,
      unit: product.unit,
      farmer: product.farmer,
      farmName: product.farmName || 'Local Farm',
      location: product.location
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart`);
  };

  const handleFilterChange = (name, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    
    // Reset to page 1 when filters change
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setSearchParams({ page: '1' });
  };

  const activeFilters = [
    ...(keyword ? [`Search: "${keyword}"`] : []),
    ...(category ? [`Category: ${category}`] : []),
    ...(minPrice ? [`Min Price: KSh${minPrice}`] : []),
    ...(maxPrice ? [`Max Price: KSh${maxPrice}`] : []),
    ...(organic ? ['Organic Only'] : []),
    ...(locationFilter ? [`Location: ${locationFilter}`] : []),
    ...(sort !== 'newest' ? [`Sorted: ${sortOptions.find(o => o.value === sort)?.label}`] : [])
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {category ? `${category} Products` : 'All Products'}
            {locationFilter && ` from ${locationFilter}`}
          </h1>
          {user?.role === 'farmer' && (
            <Link
              to="/farmer/products/new"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Product
            </Link>
          )}
        </div>

        {/* Mobile filter dialog */}
        <div className="lg:hidden mb-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Filters
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              categories={categories}
              locations={locations}
              filters={{
                keyword,
                category,
                minPrice,
                maxPrice,
                organic,
                location: locationFilter,
                sort
              }}
              onChange={handleFilterChange}
              onReset={resetFilters}
              sortOptions={sortOptions}
            />
          </div>

          {/* Product grid */}
          <div className="lg:col-span-3">
            {/* Active filters */}
            {activeFilters.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {filter}
                    <button
                      type="button"
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500"
                      onClick={() => {
                        const filterName = filter.split(':')[0].toLowerCase().trim();
                        if (filterName === 'search') {
                          handleFilterChange('keyword', '');
                        } else if (filterName === 'category') {
                          handleFilterChange('category', '');
                        } else if (filterName === 'min price') {
                          handleFilterChange('minPrice', '');
                        } else if (filterName === 'max price') {
                          handleFilterChange('maxPrice', '');
                        } else if (filterName === 'organic only') {
                          handleFilterChange('organic', '');
                        } else if (filterName === 'location') {
                          handleFilterChange('location', '');
                        } else if (filterName === 'sorted') {
                          handleFilterChange('sort', 'newest');
                        }
                      }}
                    >
                      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  </span>
                ))}
                <button
                  onClick={resetFilters}
                  className="text-sm text-green-600 hover:text-green-800 ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-gray-500">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <div className="mt-6">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const isInCart = cartItems.some(item => item.product === product._id);
                    return (
                      <ProductCard 
                        key={product._id} 
                        product={product} 
                        className="hover:shadow-lg transition-shadow duration-300"
                        onAddToCart={() => handleAddToCart(product)}
                        isInCart={isInCart}
                      />
                    );
                  })}
                </div>
                
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalProducts}
                  itemsPerPage={limit}
                  onPageChange={handlePageChange}
                  className="mt-8"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter dialog */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative bg-white w-full max-w-xs h-full ml-auto shadow-xl">
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <button
                type="button"
                className="-mr-2 w-10 h-10 bg-white p-2 rounded-md text-gray-400 hover:text-gray-500"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
              <FilterSidebar
                categories={categories}
                locations={locations}
                filters={{
                  keyword,
                  category,
                  minPrice,
                  maxPrice,
                  organic,
                  location: locationFilter,
                  sort
                }}
                onChange={(name, value) => {
                  handleFilterChange(name, value);
                  setMobileFiltersOpen(false);
                }}
                onReset={() => {
                  resetFilters();
                  setMobileFiltersOpen(false);
                }}
                sortOptions={sortOptions}
                mobile
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}