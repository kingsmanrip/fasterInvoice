import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

function ProtectedRoute() {
  // Use our utility function to check authentication
  const authenticated = isAuthenticated();
  const location = useLocation();
  
  // If not authenticated, redirect to login
  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
}

export default ProtectedRoute;
