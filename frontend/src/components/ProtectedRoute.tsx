import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;