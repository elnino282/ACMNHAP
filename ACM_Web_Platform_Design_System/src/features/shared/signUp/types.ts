/**
 * Sign Up Feature - Type Definitions
 * Matches Sign In pattern for consistency
 */

export type UserRole = 'FARMER' | 'BUYER';

export interface SignUpFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  acceptTerms: boolean;
}

export interface SignUpProps {
  onSignUp: (formData: SignUpFormData) => Promise<void>;
}
