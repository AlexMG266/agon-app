import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const SERVICE_TOKEN_NAME = 'serviceToken';

// Retrieve base URL from environment variables
const baseURL = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:8080';

export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Automatically injected JWT token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(SERVICE_TOKEN_NAME) || sessionStorage.getItem(SERVICE_TOKEN_NAME);
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle global errors (like 401 Unauthorized)
let reauthenticationCallback: (() => void) | null = null;

export const setReauthenticationCallback = (callback: () => void) => {
    reauthenticationCallback = callback;
};

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response) {
            const { status } = error.response;
            if (status === 401) {
                localStorage.removeItem(SERVICE_TOKEN_NAME);
                sessionStorage.removeItem(SERVICE_TOKEN_NAME);
                if (reauthenticationCallback) {
                    reauthenticationCallback();
                }
            }
        }
        return Promise.reject(error);
    }
);
