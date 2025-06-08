export default function SearchFilters({ searchParams, setSearchParams, onSearch }) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Product name"
              className="w-full p-2 border rounded"
              value={searchParams.keyword}
              onChange={(e) => setSearchParams({...searchParams, keyword: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <input
              type="number"
              placeholder="Min"
              className="w-full p-2 border rounded"
              value={searchParams.minPrice}
              onChange={(e) => setSearchParams({...searchParams, minPrice: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
            <input
              type="number"
              placeholder="Max"
              className="w-full p-2 border rounded"
              value={searchParams.maxPrice}
              onChange={(e) => setSearchParams({...searchParams, maxPrice: e.target.value})}
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={onSearch}
              className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-green-600 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    )
  }
