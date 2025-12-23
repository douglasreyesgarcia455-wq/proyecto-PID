import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.rol?.toLowerCase() !== requiredRole.toLowerCase()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">
          No tienes permisos para acceder a esta página
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
