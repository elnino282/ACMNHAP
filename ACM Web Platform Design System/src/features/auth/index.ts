// Export auth feature components and hooks
export { AuthProvider, useAuth } from './context/AuthContext';
export { ProtectedRoute } from './components/ProtectedRoute';
export type { User, UserRole, AuthContextType } from './context/AuthContext';