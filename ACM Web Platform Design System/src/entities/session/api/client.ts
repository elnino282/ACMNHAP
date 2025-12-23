import httpClient from '@/shared/api/http';
import {
    AuthSignUpRequestSchema,
    AuthSignUpResponseSchema,
    AuthSignInRequestSchema,
    AuthSignInResponseSchema,
    AuthSignOutRequestSchema,
    AuthRefreshRequestSchema,
    AuthRefreshResponseSchema,
    AuthResetPasswordRequestSchema,
    AuthIntrospectRequestSchema,
    AuthIntrospectResponseSchema,
} from '../model/schemas';
import type {
    AuthSignUpRequest,
    AuthSignUpResponse,
    AuthSignInRequest,
    AuthSignInResponse,
    AuthSignOutRequest,
    AuthRefreshRequest,
    AuthRefreshResponse,
    AuthResetPasswordRequest,
    AuthIntrospectRequest,
    AuthIntrospectResponse,
} from '../model/types';

// ═══════════════════════════════════════════════════════════════
// SESSION API CLIENT
// Pure Axios calls with Zod validation (no React dependencies)
// ═══════════════════════════════════════════════════════════════

export const sessionApi = {
    signUp: async (data: AuthSignUpRequest): Promise<AuthSignUpResponse> => {
        const validatedPayload = AuthSignUpRequestSchema.parse(data);
        const response = await httpClient.post('/api/v1/auth/sign-up', validatedPayload);
        return AuthSignUpResponseSchema.parse(response.data);
    },

    signIn: async (data: AuthSignInRequest): Promise<AuthSignInResponse> => {
        const validatedPayload = AuthSignInRequestSchema.parse(data);
        const response = await httpClient.post('/api/v1/auth/sign-in', validatedPayload);
        return AuthSignInResponseSchema.parse(response.data);
    },

    signOut: async (data: AuthSignOutRequest): Promise<void> => {
        await httpClient.post('/api/v1/auth/sign-out', AuthSignOutRequestSchema.parse(data));
    },

    refresh: async (data: AuthRefreshRequest): Promise<AuthRefreshResponse> => {
        const validatedPayload = AuthRefreshRequestSchema.parse(data);
        const response = await httpClient.post('/api/v1/auth/refresh', validatedPayload);
        return AuthRefreshResponseSchema.parse(response.data);
    },

    resetPassword: async (data: AuthResetPasswordRequest): Promise<void> => {
        await httpClient.post('/api/v1/auth/reset-password', AuthResetPasswordRequestSchema.parse(data));
    },

    introspect: async (data: AuthIntrospectRequest): Promise<AuthIntrospectResponse> => {
        const validatedPayload = AuthIntrospectRequestSchema.parse(data);
        const response = await httpClient.post('/api/v1/auth/introspect', validatedPayload);
        return AuthIntrospectResponseSchema.parse(response.data);
    },
};
