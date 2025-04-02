import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getFarmerProducts } from '../../services/api'
import { toast } from 'react-hot-toast'

export default function FarmerDashboard() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const { data } = await getFarmerProducts()
        setProducts(data)
      } catch (error) {
        toast.error('Failed to load products')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    if (user?.role === 'farmer') {
      fetchProducts()
    }
  }, [user])

  if (user?.role !== 'farmer') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl mb-4">Farmer access only</h1>
        <p className="mb-4">You need to be logged in as a farmer to access this page</p>
        <Link 
          to="/login" 
          className="bg-primary text-white px-6 py-2 rounded hover:bg-green-600 transition"
        >
          Login
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
        <Link 
          to="/farmer/products/new"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Add Product
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg mb-4">You haven't added any products yet</p>
          <Link 
            to="/farmer/products/new"
            className="bg-primary text-white px-6 py-2 rounded hover:bg-green-600 transition"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 p-4 font-semibold">
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Actions</div>
          </div>
          
          {products.map(product => (
            <div key={product._id} className="grid grid-cols-12 p-4 border-b items-center">
              <div className="col-span-4 flex items-center">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-12 h-12 object-cover rounded mr-3"
                />
                <span>{product.name}</span>
              </div>
              <div className="col-span-2">${product.price.toFixed(2)}</div>
              <div className="col-span-2">{product.stock}</div>
              <div className="col-span-2">
                {product.stock > 0 ? (
                  <span className="text-green-500">Active</span>
                ) : (
                  <span className="text-red-500">Out of stock</span>
                )}
              </div>
              <div className="col-span-2">
                <Link 
                  to={`/farmer/products/${product._id}/edit`}
                  className="text-primary hover:underline mr-3"
                >
                  Edit
                </Link>
                <button className="text-red-500 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}