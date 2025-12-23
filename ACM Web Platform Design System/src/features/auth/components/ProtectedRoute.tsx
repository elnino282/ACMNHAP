import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication and/or specific roles.
 * Redirects to /signin if not authenticated.
 * Redirects to appropriate portal if role doesn't match.
 */
export function ProtectedRoute({ 
  children, 
  requiredRole,
  allowedRoles 
}: ProtectedRouteProps) {
  const { isAuthenticated, getUserRole } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check role requirements
  const userRole = getUserRole();
  
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to user's portal
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to user's portal
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return <>{children}</>;
}
