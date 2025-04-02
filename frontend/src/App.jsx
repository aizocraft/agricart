import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OrderDetails from './pages/OrderDetails';
import ProductDetails from './pages/ProductDetails';
import FarmerDashboard from './pages/farmer/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import ProductForm from './pages/farmer/ProductForm';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/farmer/dashboard" 
            element={
              <ProtectedRoute roles={['farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/farmer/products/new" 
            element={
              <ProtectedRoute roles={['farmer']}>
                <ProductForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/farmer/products/:id/edit" 
            element={
              <ProtectedRoute roles={['farmer']}>
                <ProductForm />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;