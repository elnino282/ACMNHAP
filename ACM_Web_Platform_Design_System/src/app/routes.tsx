import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { SignInPage } from '@/pages/shared/SignInPage';
import { SignUpPage } from '@/pages/shared/SignUpPage';
import { AdminPortalWithShell } from '@/features/admin/portal';
import { useAuth } from '@/features/auth';
import { ErrorBoundary } from '@/shared/ui';

/**
 * Root redirect - redirects to signin or admin portal based on auth state
 */
function RootRedirect() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <Navigate to="/admin/dashboard" replace />;
}

/**
 * AppRoutes Component
 * 
 * Defines all application routes with:
 * - Role-based protection via ProtectedRoute
 * - Route-level ErrorBoundary for admin portal
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Admin Routes - Protected with ErrorBoundary */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <ErrorBoundary>
              <AdminPortalWithShell />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Catch all - redirect to signin */}
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}