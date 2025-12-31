/**
 * Sign Up Feature - Constants and Configuration
 */

import { UserRole } from './types';

export const ROLE_OPTIONS: Array<{ value: UserRole; label: string; description: string }> = [
  {
    value: 'FARMER',
    label: 'Farmer',
    description: 'I want to sell agricultural products',
  },
  {
    value: 'BUYER',
    label: 'Buyer',
    description: 'I want to purchase agricultural products',
  },
];

export const VALIDATION_MESSAGES = {
  FULL_NAME_REQUIRED: 'Full name is required',
  FULL_NAME_MIN_LENGTH: 'Full name must be at least 2 characters',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PHONE_INVALID: 'Please enter a valid phone number',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  CONFIRM_PASSWORD_REQUIRED: 'Please confirm your password',
  PASSWORD_MISMATCH: 'Passwords do not match',
  ROLE_REQUIRED: 'Please select your role',
  TERMS_REQUIRED: 'You must accept the terms and conditions',
};

export const FORM_CONFIG = {
  MIN_NAME_LENGTH: 2,
  MIN_PASSWORD_LENGTH: 8,
  PHONE_PATTERN: /^[0-9+\-\s()]*$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};
