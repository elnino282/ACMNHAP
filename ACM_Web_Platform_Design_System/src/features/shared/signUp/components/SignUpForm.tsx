/**
 * Sign Up Form Component
 * Main form with all input fields
 * Matches Sign In form styling exactly
 */

import { useNavigate } from 'react-router-dom';
import { UserRole, SignUpFormData } from '../types';
import { RoleSelector } from './RoleSelector';

// SVG path data for icons
const EYE_ICON_PATH = "M10 4.16663C5.83334 4.16663 2.27501 6.73329 0.833344 10.4166C2.27501 14.1 5.83334 16.6666 10 16.6666C14.1667 16.6666 17.725 14.1 19.1667 10.4166C17.725 6.73329 14.1667 4.16663 10 4.16663ZM10 14.5833C7.70001 14.5833 5.83334 12.7166 5.83334 10.4166C5.83334 8.11663 7.70001 6.24996 10 6.24996C12.3 6.24996 14.1667 8.11663 14.1667 10.4166C14.1667 12.7166 12.3 14.5833 10 14.5833ZM10 7.91663C8.61668 7.91663 7.50001 9.03329 7.50001 10.4166C7.50001 11.8 8.61668 12.9166 10 12.9166C11.3833 12.9166 12.5 11.8 12.5 10.4166C12.5 9.03329 11.3833 7.91663 10 7.91663Z";
const CHECKMARK_PATH = "M6.00001 11.17L1.83001 7L0.410011 8.41L6.00001 14L18 2.00001L16.59 0.590012L6.00001 11.17Z";

interface SignUpFormProps {
  formData: SignUpFormData;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onRoleChange: (role: UserRole) => void;
  onToggleShowPassword: () => void;
  onToggleShowConfirmPassword: () => void;
  onToggleAcceptTerms: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function SignUpForm({
  formData,
  showPassword,
  showConfirmPassword,
  onFullNameChange,
  onEmailChange,
  onPhoneNumberChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onRoleChange,
  onToggleShowPassword,
  onToggleShowConfirmPassword,
  onToggleAcceptTerms,
  onSubmit,
}: SignUpFormProps) {
  const navigate = useNavigate();

  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/signin');
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      {/* Full Name Field */}
      <div className="mb-[24px]">
        <p
          className="font-['DM_Sans:Medium',sans-serif] font-medium leading-none text-[#2b3674] text-[14px] tracking-[-0.28px] mb-[11px]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          <span>Full Name</span>
          <span className="text-[#4318ff]">*</span>
        </p>
        <div className="relative h-[50px] w-full">
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            placeholder="John Doe"
            className="w-full h-full px-[24px] rounded-[16px] border border-[#e0e5f2] border-solid font-['DM_Sans:Regular',sans-serif] font-normal text-[14px] text-[#2b3674] placeholder:text-[#a3aed0] tracking-[-0.28px] focus:outline-none focus:border-[#3ba55d]"
            style={{ fontVariationSettings: "'opsz' 14" }}
            required
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="mb-[24px]">
        <p
          className="font-['DM_Sans:Medium',sans-serif] font-medium leading-none text-[#2b3674] text-[14px] tracking-[-0.28px] mb-[11px]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          <span>Email</span>
          <span className="text-[#4318ff]">*</span>
        </p>
        <div className="relative h-[50px] w-full">
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="john.doe@example.com"
            className="w-full h-full px-[24px] rounded-[16px] border border-[#e0e5f2] border-solid font-['DM_Sans:Regular',sans-serif] font-normal text-[14px] text-[#2b3674] placeholder:text-[#a3aed0] tracking-[-0.28px] focus:outline-none focus:border-[#3ba55d]"
            style={{ fontVariationSettings: "'opsz' 14" }}
            required
          />
        </div>
      </div>

      {/* Phone Number Field */}
      <div className="mb-[24px]">
        <p
          className="font-['DM_Sans:Medium',sans-serif] font-medium leading-none text-[#2b3674] text-[14px] tracking-[-0.28px] mb-[11px]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          <span>Phone Number</span>
        </p>
        <div className="relative h-[50px] w-full">
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            placeholder="+84 123 456 789"
            className="w-full h-full px-[24px] rounded-[16px] border border-[#e0e5f2] border-solid font-['DM_Sans:Regular',sans-serif] font-normal text-[14px] text-[#2b3674] placeholder:text-[#a3aed0] tracking-[-0.28px] focus:outline-none focus:border-[#3ba55d]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          />
        </div>
      </div>

      {/* Role Selector */}
      <RoleSelector
        selectedRole={formData.role}
        onRoleChange={onRoleChange}
      />

      {/* Password Field */}
      <div className="mb-[24px]">
        <p
          className="font-['DM_Sans:Medium',sans-serif] font-medium leading-none text-[#2b3674] text-[14px] tracking-[-0.28px] mb-[11px]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          <span>Password</span>
          <span className="text-[#4318ff]">*</span>
        </p>
        <div className="relative h-[50px] w-full">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full h-full px-[24px] pr-[52px] rounded-[16px] border border-[#e0e5f2] border-solid font-['DM_Sans:Regular',sans-serif] font-normal text-[14px] text-[#2b3674] placeholder:text-[#a3aed0] tracking-[-0.28px] focus:outline-none focus:border-[#3ba55d]"
            style={{ fontVariationSettings: "'opsz' 14" }}
            required
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            className="absolute right-[18px] top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            aria-label="Toggle password visibility"
          >
            <svg
              className="w-[20px] h-[20px]"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 20 20"
            >
              <g clipPath="url(#clip0_password)">
                <g></g>
                <path d={EYE_ICON_PATH} fill="#A3AED0" />
              </g>
              <defs>
                <clipPath id="clip0_password">
                  <rect fill="white" height="20" width="20" />
                </clipPath>
              </defs>
            </svg>
          </button>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className="mb-[24px]">
        <p
          className="font-['DM_Sans:Medium',sans-serif] font-medium leading-none text-[#2b3674] text-[14px] tracking-[-0.28px] mb-[11px]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          <span>Confirm Password</span>
          <span className="text-[#4318ff]">*</span>
        </p>
        <div className="relative h-[50px] w-full">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full h-full px-[24px] pr-[52px] rounded-[16px] border border-[#e0e5f2] border-solid font-['DM_Sans:Regular',sans-serif] font-normal text-[14px] text-[#2b3674] placeholder:text-[#a3aed0] tracking-[-0.28px] focus:outline-none focus:border-[#3ba55d]"
            style={{ fontVariationSettings: "'opsz' 14" }}
            required
          />
          <button
            type="button"
            onClick={onToggleShowConfirmPassword}
            className="absolute right-[18px] top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            aria-label="Toggle confirm password visibility"
          >
            <svg
              className="w-[20px] h-[20px]"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 20 20"
            >
              <g clipPath="url(#clip0_confirm_password)">
                <g></g>
                <path d={EYE_ICON_PATH} fill="#A3AED0" />
              </g>
              <defs>
                <clipPath id="clip0_confirm_password">
                  <rect fill="white" height="20" width="20" />
                </clipPath>
              </defs>
            </svg>
          </button>
        </div>
      </div>

      {/* Terms and Conditions Checkbox */}
      <div className="mb-[33px]">
        <label className="flex items-start gap-[11px] cursor-pointer">
          <div
            className={`w-[18px] h-[18px] rounded-[2px] border border-solid flex items-center justify-center transition-colors flex-shrink-0 mt-[1px] ${formData.acceptTerms
              ? 'bg-[#3ba55d] border-[#3ba55d]'
              : 'bg-white border-[#e0e5f2]'
              }`}
            onClick={onToggleAcceptTerms}
          >
            {formData.acceptTerms && (
              <svg
                className="w-[16px] h-[16px]"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path d={CHECKMARK_PATH} fill="white" />
              </svg>
            )}
          </div>
          <span
            className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[20px] text-[#2b3674] text-[14px] tracking-[-0.28px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            I agree to the{' '}
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#3ba55d] hover:underline">
              Terms and Conditions
            </span>{' '}
            and{' '}
            <span className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#3ba55d] hover:underline">
              Privacy Policy
            </span>
            <span className="text-[#4318ff]">*</span>
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-[#3ba55d] h-[54px] rounded-[16px] flex items-center justify-center px-[8px] py-[10px] hover:bg-[#2F9E44] transition-colors"
      >
        <p
          className="font-['DM_Sans:Bold',sans-serif] font-bold leading-none text-[14px] text-center text-white tracking-[-0.28px]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          Create Account
        </p>
      </button>

      {/* Already have account link */}
      <p
        className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[26px] text-[#2b3674] text-[14px] text-center tracking-[-0.28px] mt-[28px]"
        style={{ fontVariationSettings: "'opsz' 14" }}
      >
        Already have an account?{' '}
        <span
          onClick={handleSignIn}
          className="font-['DM_Sans:Bold',sans-serif] font-bold text-[#3ba55d] cursor-pointer hover:underline"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          Sign In
        </span>
      </p>
    </form>
  );
}
