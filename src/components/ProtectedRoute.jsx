import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

function ProtectedRoute() {
  // Use our utility function to check authentication
  const authenticated = isAuthenticated();
  
  // If not authenticated, redirect to login
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
}

export default ProtectedRoute;
