/**
 * Type definitions for SignIn feature
 */

export type Portal = "ADMIN" | "FARMER" | "BUYER";

export interface SignInProps {
    onSignIn: (email: string, password: string, role: Portal) => void;
}

export interface SignInFormData {
    email: string;
    password: string;
    keepLoggedIn: boolean;
}
