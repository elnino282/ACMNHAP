/**
 * Business logic and state management for SignIn feature
 */

import { useState } from "react";
import { toast } from "sonner";
import { useAuthSignIn } from '@/entities/session';
import type { Portal } from "../types";
import { INITIAL_FORM_STATE, MESSAGES } from "../constants";

interface UseSignInProps {
    onSignIn: (email: string, password: string, role: Portal) => void;
}

export function useSignIn({ onSignIn }: UseSignInProps) {
    const [email, setEmail] = useState(INITIAL_FORM_STATE.email);
    const [password, setPassword] = useState(INITIAL_FORM_STATE.password);
    const [keepLoggedIn, setKeepLoggedIn] = useState(
        INITIAL_FORM_STATE.keepLoggedIn,
    );
    const [showPassword, setShowPassword] = useState(false);

    const { mutate: signIn, isPending } = useAuthSignIn({
        onSuccess: (response) => {
            // Store token in the format expected by HTTP client interceptor
            const storedAuth = {
                token: response.result.token,
                refreshToken: "", // Backend doesn't return refreshToken yet
                expiresAt: Date.now() + 3600 * 1000, // Default 1 hour
            };

            localStorage.setItem("acm_auth", JSON.stringify(storedAuth));

            if (keepLoggedIn) {
                localStorage.setItem("keepLoggedIn", "true");
            }

            // Get role from response (roles is an array, take the first one)
            const roleFromAPI = response.result.roles[0]; // e.g., "FARMER", "BUYER", "ADMIN"

            // Map the role from API to Portal type
            let role: Portal = "ADMIN";
            if (roleFromAPI === "FARMER" || roleFromAPI === "ROLE_FARMER") {
                role = "FARMER";
            } else if (roleFromAPI === "BUYER" || roleFromAPI === "ROLE_BUYER") {
                role = "BUYER";
            } else if (roleFromAPI === "ADMIN" || roleFromAPI === "ROLE_ADMIN") {
                role = "ADMIN";
            }

            // Show success toast
            toast.success("Sign in successful", {
                description: `Welcome back, ${response.result.username}!`,
            });

            // Call the onSignIn callback with the correct role
            onSignIn(email, password, role);
        },
        onError: (error) => {
            toast.error(MESSAGES.invalidCredentials.title, {
                description: error.message || MESSAGES.invalidCredentials.description,
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form inputs
        if (!email || !password) {
            toast.error("Validation Error", {
                description: "Please fill in all required fields",
            });
            return;
        }

        // Call the API
        signIn({
            username: email,
            password: password,
        });
    };

    const handleGoogleSignIn = () => {
        toast.info(MESSAGES.googleSignIn.title, {
            description: MESSAGES.googleSignIn.description,
        });
    };

    const toggleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const toggleKeepLoggedIn = () => {
        setKeepLoggedIn((prev) => !prev);
    };

    return {
        // Form state
        email,
        password,
        keepLoggedIn,
        showPassword,
        isLoading: isPending,

        // State setters
        setEmail,
        setPassword,

        // Handlers
        handleSubmit,
        handleGoogleSignIn,
        toggleShowPassword,
        toggleKeepLoggedIn,
    };
}
