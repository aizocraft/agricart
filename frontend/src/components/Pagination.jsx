const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange, className = '' }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
  
    if (totalPages <= 1) return null;
  
    return (
      <div className={`flex justify-center ${className}`}>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            &larr;
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded ${currentPage === page ? 'bg-green-600 text-white' : 'border border-gray-300'}`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
          >
            &rarr;
          </button>
        </nav>
      </div>
    );
  };
  
  export default Pagination;