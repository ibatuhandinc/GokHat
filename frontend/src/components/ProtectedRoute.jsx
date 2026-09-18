import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Korumalı route wrapper.
 * Oturum açılmamışsa /login'e yönlendirir.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}