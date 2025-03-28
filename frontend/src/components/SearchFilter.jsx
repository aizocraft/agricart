import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';

export default function SearchFilter() {
  const [keyword, setKeyword] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const dispatch = useDispatch();

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchProducts({ keyword, minPrice: priceRange[0], maxPrice: priceRange[1] }));
  };

  return (
    <div className="bg-white p-4 rounded shadow-md mb-8">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Product name..."
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], e.target.value])}
              className="w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-primary text-white rounded hover:bg-secondary transition"
        >
          Apply Filters
        </button>
      </form>
    </div>
  );
}