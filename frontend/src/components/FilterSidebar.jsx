import { useState, useEffect } from 'react';

const FilterSidebar = ({
  categories = [],
  locations = [],
  filters = {},
  onChange,
  onReset,
  sortOptions = [],
  mobile = false,
}) => {
  // Local state for price inputs (controlled inputs separate from global filters)
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || '',
  });

  // Sync local priceRange state with filters prop changes
  useEffect(() => {
    setPriceRange({
      min: filters.minPrice || '',
      max: filters.maxPrice || '',
    });
  }, [filters.minPrice, filters.maxPrice]);

  // Handle typing in price inputs locally
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply price filter only when button clicked (to avoid firing on every keystroke)
  const applyPriceFilter = () => {
    // Convert empty strings to undefined or '' so filter clears properly
    onChange('minPrice', priceRange.min === '' ? '' : priceRange.min);
    onChange('maxPrice', priceRange.max === '' ? '' : priceRange.max);
  };

  return (
    <div className={`${mobile ? '' : 'sticky top-4'}`}>
      <div className="bg-white p-4 rounded-lg shadow">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Filters</h3>
          <button
            onClick={onReset}
            className="text-sm text-green-600 hover:text-green-800"
          >
            Reset all
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search
          </label>
          <input
            type="text"
            id="search"
            name="keyword"
            value={filters.keyword || ''}
            onChange={(e) => onChange('keyword', e.target.value)}
            placeholder="Product name..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Categories
          </h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="category-all"
                name="category"
                type="radio"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                checked={!filters.category}
                onChange={() => onChange('category', '')}
              />
              <label
                htmlFor="category-all"
                className="ml-3 text-sm text-gray-600"
              >
                All Categories
              </label>
            </div>
            {categories.map((category) => (
              <div key={category} className="flex items-center">
                <input
                  id={`category-${category}`}
                  name="category"
                  type="radio"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  checked={filters.category === category}
                  onChange={() => onChange('category', category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="ml-3 text-sm text-gray-600"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
          <select
            value={filters.location || ''}
            onChange={(e) => onChange('location', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Price Range
          </h4>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label htmlFor="minPrice" className="sr-only">
                Min
              </label>
              <input
                type="number"
                id="minPrice"
                name="min"
                placeholder="Min"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={priceRange.min}
                onChange={handlePriceChange}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="maxPrice" className="sr-only">
                Max
              </label>
              <input
                type="number"
                id="maxPrice"
                name="max"
                placeholder="Max"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={priceRange.max}
                onChange={handlePriceChange}
                min="0"
              />
            </div>
          </div>
          <button
            onClick={applyPriceFilter}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Apply Price
          </button>
        </div>

        {/* Organic */}
        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="organic"
              name="organic"
              type="checkbox"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              checked={filters.organic || false}
              onChange={(e) => onChange('organic', e.target.checked)}
            />
            <label
              htmlFor="organic"
              className="ml-3 text-sm text-gray-600"
            >
              Organic Only
            </label>
          </div>
        </div>

        {/* Sort */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sort By</h4>
          <select
            value={filters.sort || ''}
            onChange={(e) => onChange('sort', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
