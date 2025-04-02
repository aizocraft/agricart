import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-xl mb-6">The page you're looking for doesn't exist.</p>
      <Link 
        to="/" 
        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
      >
        Go Back Home
      </Link>
    </div>
  )
}