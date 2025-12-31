import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { SignInPage } from '@/pages/shared/SignInPage';
import { SignUpPage } from '@/pages/shared/SignUpPage';
import { AdminPortalWithShell } from '@/features/admin/portal';
import { FarmerPortalWithShell } from '@/features/farmer/portal';
import { useAuth } from '@/features/auth';
import { ErrorBoundary } from '@/shared/ui';
import { SeasonProvider } from '@/shared/contexts';

// Farmer feature imports
import { CropManagement } from '@/features/farmer/crops';
import { FarmerDashboard } from '@/features/farmer/dashboard';
import { HarvestManagement } from '@/features/farmer/harvests';
import { PlotManagement } from '@/features/farmer/plots';
import { SaleManagement } from '@/features/farmer/sales';
import { SeasonManagement } from '@/features/farmer/seasons';
import { Documents } from '@/features/farmer/documents';
import { ExpenseManagement } from '@/features/farmer/expense-management';
import { Reports } from '@/features/farmer/reports';
import { TaskWorkspace } from '@/features/farmer/tasks';
import { FarmerProfile } from '@/features/farmer/profile';
import { FarmsListPage, FarmDetailPage } from '@/features/farmer/farm-management';
import { FieldLogsPage } from '@/pages/farmer/FieldLogsPage';
import { InventoryPage } from '@/pages/farmer/InventoryPage';
import { IncidentsPage } from '@/pages/farmer/IncidentsPage';
import { SuppliersSuppliesPage } from '@/pages/farmer/SuppliersSuppliesPage';
import { AiAssistantPage } from '@/pages/farmer/AiAssistantPage';

/**
 * Root redirect - redirects to signin or user's portal based on auth state
 */
function RootRedirect() {
  const { isAuthenticated, getUserRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  const role = getUserRole();
  if (role) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <Navigate to="/signin" replace />;
}

/**
 * AppRoutes Component
 * 
 * Defines all application routes with:
 * - Role-based protection via ProtectedRoute
 * - Route-level ErrorBoundary for each portal
 * - SeasonProvider for farmer routes (tasks/harvests)
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

      {/* Farmer Routes - Protected with SeasonProvider and ErrorBoundary */}
      <Route
        path="/farmer"
        element={
          <ProtectedRoute requiredRole="farmer">
            <ErrorBoundary>
              <SeasonProvider>
                <FarmerPortalWithShell />
              </SeasonProvider>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        {/* Redirect /farmer to /farmer/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Farmer Dashboard */}
        <Route path="dashboard" element={<FarmerDashboard />} />

        {/* Farm Management with nested routes */}
        <Route path="farms">
          <Route index element={<FarmsListPage />} />
          <Route path=":id" element={<FarmDetailPage />} />
        </Route>

        {/* Other Farmer Features */}
        <Route path="plots" element={<PlotManagement />} />
        <Route path="seasons" element={<SeasonManagement />} />
        <Route path="tasks" element={<TaskWorkspace />} />
        <Route path="crops" element={<CropManagement />} />
        <Route path="expenses" element={<ExpenseManagement />} />
        <Route path="harvest" element={<HarvestManagement />} />
        <Route path="sales" element={<SaleManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="documents" element={<Documents />} />
        <Route path="field-logs" element={<FieldLogsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="suppliers-supplies" element={<SuppliersSuppliesPage />} />
        <Route path="ai-assistant" element={<AiAssistantPage />} />
        <Route path="profile" element={<FarmerProfile />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Catch all - redirect to signin */}
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}