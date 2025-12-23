import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sessionApi, type AuthSignInResponse } from '@/entities/session';

export type UserRole = 'admin' | 'farmer' | 'buyer';

export interface User {
  id?: number; // User ID from JWT token
  username: string;
  role: UserRole;
  email?: string; // Optional for backwards compatibility
}

interface AuthStorageShape {
  token: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  getUserRole: () => UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'acm_auth';

/**
 * Decode JWT token to extract user information
 */
function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

function loadStoredAuth(): AuthStorageShape | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthStorageShape;
    if (!parsed.token || !parsed.refreshToken || !parsed.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveStoredAuth(data: AuthStorageShape) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

function clearStoredAuth() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * AuthProvider Component
 * 
 * Provides authentication context to the entire application.
 * Manages user state, login/logout, and session persistence.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = loadStoredAuth();
      if (stored && stored.expiresAt > Date.now()) {
        setUser(stored.user);
      } else if (stored && stored.expiresAt <= Date.now()) {
        clearStoredAuth();
      }
    } catch (error) {
      console.error('Failed to load auth from localStorage:', error);
      clearStoredAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 1. Call backend to obtain tokens
      const authResponse: AuthSignInResponse = await sessionApi.signIn({
        username: email,
        password,
      });

      // 2. Extract user info directly from the sign-in response
      const { token, username, roles } = authResponse.result;

      // Decode JWT to get user ID
      const jwtPayload = decodeJwtPayload(token);
      const userId = jwtPayload?.user_id || jwtPayload?.userId || jwtPayload?.sub;

      // Map the first role to UserRole (assuming roles[0] is the primary role)
      const primaryRole = roles[0]?.toLowerCase() as UserRole;

      const mappedUser: User = {
        id: userId ? Number(userId) : undefined,
        username,
        role: primaryRole,
        email, // Store the email used for login
      };

      const storage: AuthStorageShape = {
        token,
        refreshToken: token, // Using same token as refresh for now
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours default
        user: mappedUser,
      };

      setUser(mappedUser);
      saveStoredAuth(storage);

      return true;
    } catch (error) {
      console.error('Failed to login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    clearStoredAuth();
  };

  const getUserRole = (): UserRole | null => {
    return user?.role || null;
  };

  // Show loading UI while checking authentication state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#3BA55D] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#333333]/70 text-sm">Loading application...</p>
        </div>
      </div>
    );
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    getUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * 
 * Custom hook to access authentication context
 * Throws error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
