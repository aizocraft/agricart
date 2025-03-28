import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';

export default function FarmerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:5000/api/products/myproducts', config);
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.token) {
      fetchProducts();
    }
  }, [userInfo]);

  const handleDelete = async (productId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.delete(`http://localhost:5000/api/products/${productId}`, config);
      setProducts(products.filter((p) => p._id !== productId));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Link
          to="/add-product"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition"
        >
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't added any products yet</p>
          <Link
            to="/add-product"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500">No Image</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-primary font-medium">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mt-2">Stock: {product.stock}</p>
                <div className="mt-4 flex space-x-2">
                  <Link
                    to={`/edit-product/${product._id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}