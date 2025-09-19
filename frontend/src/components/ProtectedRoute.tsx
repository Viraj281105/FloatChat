import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // ✅ Keep showing loading while auth state is being determined
  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // ✅ Render children if authenticated, else redirect to signin
  return user ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
