/**
 * Sign Up Business Logic Hook
 * Manages form state, validation, and API integration
 * Matches Sign In hook pattern
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { SignUpFormData, SignUpProps } from '../types';
import { VALIDATION_MESSAGES, FORM_CONFIG } from '../constants';

export function useSignUp({ onSignUp }: SignUpProps) {
  // Form state
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: '' as any, // Will be set by user selection
    acceptTerms: false,
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation helpers
  const validateFullName = (name: string): boolean => {
    if (!name.trim()) {
      toast.error('Validation Error', {
        description: VALIDATION_MESSAGES.FULL_NAME_REQUIRED,
      });
      return false;
    }
    if (name.trim().length < FORM_CONFIG.MIN_NAME_LENGTH) {
      toast.error('Validation Error', {
        description: VALIDATION_MESSAGES.FULL_NAME_MIN_LENGTH,
      });
      return false;
    }
    return true;
  };

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      toast.error('Validation Error', {
        description: VALIDATION_MESSAGES.EMAIL_REQUIRED,
      });
      return false;
    }
    if (!FORM_CONFIG.EMAIL_PATTERN.test(email)) {
      toast.error('Validation Error', {
        description: VALIDATION_MESSAGES.EMAIL_INVALID,
      });
      return false;
    }
    return true;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    if (phone && !FORM_CONFIG.PHONE_PATTERN.test(phone)) {
      toast.error('Validation Error', {
        description: VALIDATION_MESSAGES.PHONE_INVALID,
      });
      return false;
    }
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      toast.error('Validation Error', {
        description: VALIDATION_MESSAGES.PASSWORD_REQUIRED,
      });
      return false;
    }
    if (password.length < FORM_CONFIG.MIN_PASSWORD_LENGTH) {
      toast.error('Validation Error', {
        description: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH,
      });
      return false;
    }
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): boolean => {
    if (!confirmPassword) {
      toast.error('Validation Error', {
        description: VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED,
      });
      return false;
    }
    if (confirmPassword !== password) {
      toast.error('Validation Error', {
        description: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
      });
      return false;
    }
    return true;
  };

  const validateRole = (role: string): boolean => {
    if (!role) {
      toast.error('Validation Error', {
        description: VALIDATION_MESSAGES.ROLE_REQUIRED,
      });
      return false;
    }
    return true;
  };

  const validateTerms = (accepted: boolean): boolean => {
    if (!accepted) {
      toast.error('Validation Error', {
        description: VALIDATION_MESSAGES.TERMS_REQUIRED,
      });
      return false;
    }
    return true;
  };

  // Form handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isFullNameValid = validateFullName(formData.fullName);
    const isEmailValid = validateEmail(formData.email);
    const isPhoneValid = validatePhoneNumber(formData.phoneNumber);
    const isPasswordValid = validatePassword(formData.password);
    const isConfirmPasswordValid = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );
    const isRoleValid = validateRole(formData.role);
    const isTermsValid = validateTerms(formData.acceptTerms);

    if (
      !isFullNameValid ||
      !isEmailValid ||
      !isPhoneValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid ||
      !isRoleValid ||
      !isTermsValid
    ) {
      return;
    }

    // Call the onSignUp callback
    try {
      await onSignUp(formData);
    } catch (error) {
      // Error handling is done in the page wrapper
      console.error('Sign up error:', error);
    }
  };

  const handleGoogleSignUp = () => {
    toast.info('Google Sign Up', {
      description: 'Google OAuth integration coming soon!',
    });
  };

  // Field setters
  const setFullName = (value: string) => {
    setFormData((prev) => ({ ...prev, fullName: value }));
  };

  const setEmail = (value: string) => {
    setFormData((prev) => ({ ...prev, email: value }));
  };

  const setPhoneNumber = (value: string) => {
    setFormData((prev) => ({ ...prev, phoneNumber: value }));
  };

  const setPassword = (value: string) => {
    setFormData((prev) => ({ ...prev, password: value }));
  };

  const setConfirmPassword = (value: string) => {
    setFormData((prev) => ({ ...prev, confirmPassword: value }));
  };

  const setRole = (role: 'FARMER' | 'BUYER') => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const toggleAcceptTerms = () => {
    setFormData((prev) => ({ ...prev, acceptTerms: !prev.acceptTerms }));
  };

  return {
    formData,
    showPassword,
    showConfirmPassword,
    setFullName,
    setEmail,
    setPhoneNumber,
    setPassword,
    setConfirmPassword,
    setRole,
    handleSubmit,
    handleGoogleSignUp,
    toggleShowPassword,
    toggleShowConfirmPassword,
    toggleAcceptTerms,
  };
}
