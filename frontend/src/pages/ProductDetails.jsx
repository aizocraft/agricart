import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchProductById } from '../services/api'
import { toast } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { addToCart } from '../store/cartSlice'

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const { data } = await fetchProductById(id)
        setProduct(data)
      } catch (error) {
        toast.error('Failed to load product')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    }))
    toast.success('Added to cart!')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl mb-4">Product not found</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-96 object-contain"
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl text-primary font-semibold mb-4">${product.price.toFixed(2)}</p>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Stock Status</h2>
            <p className={product.stock > 0 ? 'text-green-500' : 'text-red-500'}>
              {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </p>
          </div>
          
          {product.stock > 0 && (
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 border rounded-l bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1 border-t border-b">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1 border rounded-r bg-gray-100"
                >
                  +
                </button>
              </div>
              
              <button
                onClick={handleAddToCart}
                className="bg-primary text-white px-6 py-2 rounded hover:bg-green-600 transition"
              >
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}