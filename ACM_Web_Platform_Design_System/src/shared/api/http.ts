/// <reference types="vite/client" />
// Shared HTTP Client with Axios Interceptors and JWT Handling
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const httpClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

const AUTH_STORAGE_KEY = 'acm_auth';

type StoredAuth = {
    token: string;
    refreshToken: string;
    expiresAt: number;
};

function getStoredAuth(): StoredAuth | null {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as StoredAuth;
    } catch {
        return null;
    }
}

function setStoredAuth(data: StoredAuth) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
}

function clearStoredAuth() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Add request interceptor for JWT token
httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const stored = getStoredAuth();

        if (stored?.token && !config.headers['Authorization']) {
            // Attach Authorization header if not already set
            config.headers['Authorization'] = `Bearer ${stored.token}`;
        }

        return config;

    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
    const stored = getStoredAuth();
    if (!stored?.refreshToken) return null;

    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            const response = await httpClient.post('/api/v1/auth/refresh', {
                token: stored.refreshToken,
            });

            const { token, refreshToken, expiresIn } = response.data as {
                token: string;
                refreshToken: string;
                expiresIn: number;
            };

            const updated: StoredAuth = {
                token,
                refreshToken,
                expiresAt: Date.now() + expiresIn * 1000,
            };

            setStoredAuth(updated);

            return token;
        } catch {
            clearStoredAuth();
            return null;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

// Add response interceptor for error handling
httpClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        const status = error.response?.status;

        if (
            originalRequest &&
            status === 401 &&
            !originalRequest._retry &&
            typeof window !== 'undefined'
        ) {
            originalRequest._retry = true;

            const newToken = await refreshAccessToken();

            if (newToken) {
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return httpClient(originalRequest);
            }

            // If refresh failed, optionally redirect to sign-in
            clearStoredAuth();
            if (window.location.pathname !== '/signin') {
                window.location.href = '/signin';
            }
        }

        return Promise.reject(error);
    }
);

export default httpClient;
