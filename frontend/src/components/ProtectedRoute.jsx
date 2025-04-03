import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function ProtectedRoute({ children, roles = [], redirectUnauthorized = true }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (redirectUnauthorized) {
      toast.error('Please login to access this page');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return null;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    if (redirectUnauthorized) {
      toast.error('You do not have permission to access this page');
      return <Navigate to="/" replace />;
    }
    return null;
  }

  return children;
}