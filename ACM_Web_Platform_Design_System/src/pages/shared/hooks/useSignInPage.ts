/**
 * Page-level hook for SignIn page
 * Handles navigation, redirects, and orchestrates the sign-in flow
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import type { Portal } from '@/features/shared/signIn/types';

export function useSignInPage() {
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

            if (from && from !== '/signin') {
                navigate(from, { replace: true });
            } else {
                navigate(`/${user.role}/dashboard`, { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate, location]);

    const handleSignIn = async (email: string, password: string, role: Portal) => {
        const success = await login(email, password);

        if (success) {
            toast.success('Welcome back!', {
                description: `Signed in as ${email}`,
            });

            // Redirect to the portal based on role, or to the originally requested page
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

            if (from && from !== '/signin') {
                navigate(from, { replace: true });
            } else {
                // Convert Portal type (ADMIN/FARMER/BUYER) to route (admin/farmer/buyer)
                navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
            }
        } else {
            toast.error('Invalid credentials', {
                description: 'Please check your email and password',
            });
        }
    };

    return {
        isAuthenticated,
        handleSignIn,
    };
}
