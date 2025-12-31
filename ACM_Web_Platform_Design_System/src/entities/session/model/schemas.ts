import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// SIGN UP
// ═══════════════════════════════════════════════════════════════

export const AuthSignUpRequestSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["BUYER", "FARMER"], {
        errorMap: () => ({ message: "Role must be either BUYER or FARMER" }),
    }),
}).strict();

export const AuthSignUpResponseSchema = z.object({
    id: z.number().positive("User ID must be a positive number"),
    username: z.string(),
    role: z.string(),
    token: z.string().min(1, "Token cannot be empty"),
});

export type AuthSignUpRequest = z.infer<typeof AuthSignUpRequestSchema>;
export type AuthSignUpResponse = z.infer<typeof AuthSignUpResponseSchema>;

// ═══════════════════════════════════════════════════════════════
// SIGN IN
// ═══════════════════════════════════════════════════════════════

export const AuthSignInRequestSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
}).strict();

export const AuthSignInResponseSchema = z.object({
    status: z.number(),
    code: z.string(),
    message: z.string(),
    result: z.object({
        token: z.string().min(1, "Access token cannot be empty"),
        authenticated: z.boolean(),
        username: z.string(),
        roles: z.array(z.string()).min(1, "At least one role is required"),
    }),
});

export type AuthSignInRequest = z.infer<typeof AuthSignInRequestSchema>;
export type AuthSignInResponse = z.infer<typeof AuthSignInResponseSchema>;

// ═══════════════════════════════════════════════════════════════
// SIGN OUT
// ═══════════════════════════════════════════════════════════════

export const AuthSignOutRequestSchema = z.object({
    token: z.string().min(1, "Token is required"),
}).strict();

export type AuthSignOutRequest = z.infer<typeof AuthSignOutRequestSchema>;

// ═══════════════════════════════════════════════════════════════
// REFRESH
// ═══════════════════════════════════════════════════════════════

export const AuthRefreshRequestSchema = z.object({
    token: z.string().min(1, "Refresh token is required"),
}).strict();

export const AuthRefreshResponseSchema = z.object({
    token: z.string().min(1, "Access token cannot be empty"),
    refreshToken: z.string().min(1, "Refresh token cannot be empty"),
    expiresIn: z.number().positive("Expiration time must be positive"),
});

export type AuthRefreshRequest = z.infer<typeof AuthRefreshRequestSchema>;
export type AuthRefreshResponse = z.infer<typeof AuthRefreshResponseSchema>;

// ═══════════════════════════════════════════════════════════════
// RESET PASSWORD
// ═══════════════════════════════════════════════════════════════

export const AuthResetPasswordRequestSchema = z.object({
    username: z.string().min(1, "Username is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
}).strict();

export type AuthResetPasswordRequest = z.infer<typeof AuthResetPasswordRequestSchema>;

// ═══════════════════════════════════════════════════════════════
// INTROSPECT
// ═══════════════════════════════════════════════════════════════

export const AuthIntrospectRequestSchema = z.object({
    token: z.string().min(1, "Token is required"),
}).strict();

export const AuthIntrospectResponseSchema = z.object({
    active: z.boolean(),
    username: z.string(),
    role: z.string(),
    exp: z.number().positive("Expiration timestamp must be positive"),
});

export type AuthIntrospectRequest = z.infer<typeof AuthIntrospectRequestSchema>;
export type AuthIntrospectResponse = z.infer<typeof AuthIntrospectResponseSchema>;
