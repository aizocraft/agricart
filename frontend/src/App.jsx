import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Navbar from './components/Navbar';

// Add this import
import ProtectedRoute from './components/ProtectedRoute';
import FarmerDashboard from './pages/FarmerDashboard';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          
          {/* Example protected route */}
          <Route 
            path="/farmer-dashboard" 
            element={
              <ProtectedRoute roles={['farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
