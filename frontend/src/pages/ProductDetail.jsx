import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (!product) return <div className="text-center mt-8">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-96 bg-gray-100 flex items-center justify-center">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-gray-500">No Image Available</span>
            )}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-2xl text-primary mt-2">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 mt-4">{product.description}</p>
          
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Stock:</span> {product.stock}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium">Sold by:</span> {product.farmer?.name}
            </p>
          </div>

          <div className="mt-8 flex space-x-4">
            <button className="px-6 py-2 bg-primary text-white rounded hover:bg-secondary transition">
              Add to Cart
            </button>
            <button className="px-6 py-2 border border-primary text-primary rounded hover:bg-gray-50 transition">
              Contact Farmer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}