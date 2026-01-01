import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { env } from './env.validation';
import { logger } from './logger';
import { navigateTo } from './navigation';
import { refreshAccessToken } from './token-refresh';
import { tokenStorage } from './token-storage';

/**
 * Create axios instance with base URL
 */
export const httpClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Queue type for failed requests waiting for token refresh
 */
type QueuedRequest = {
  resolve: (value: string) => void;
  reject: (reason: Error) => void;
};

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

/**
 * Process queued requests after token refresh
 * @param error - Error if refresh failed, null if successful
 * @param token - New token if refresh successful, null if failed
 */
const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Queue a request to be retried after token refresh
 * @param originalRequest - Original axios request config
 * @returns Promise that resolves when request is retried
 */
const queueRequest = (originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }): Promise<AxiosResponse> => {
  return new Promise<string>((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  })
    .then((token: string) => {
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return httpClient(originalRequest);
    })
    .catch((err: Error) => {
      throw err;
    });
};

/**
 * Handle token refresh and retry original request
 * @param originalRequest - Original axios request config
 * @returns Promise that resolves when request is retried
 */
const handleTokenRefresh = async (
  originalRequest: InternalAxiosRequestConfig & { _retry?: boolean }
): Promise<AxiosResponse> => {
  originalRequest._retry = true;
  isRefreshing = true;

  try {
    const newToken = await refreshAccessToken();
    processQueue(null, newToken);
    originalRequest.headers = originalRequest.headers || {};
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return httpClient(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError as Error, null);
    tokenStorage.clear();
    logger.warn('Token refresh failed, redirecting to login', {
      url: originalRequest?.url,
    });
    navigateTo('/auth/login');
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
};

/**
 * Request interceptor - Add token to header
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors and token refresh
 */
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return queueRequest(originalRequest);
      }

      // Start token refresh process
      return handleTokenRefresh(originalRequest);
    }

    // Handle other errors
    const message = error.response?.data?.message || error.message || 'An error occurred';

    logger.error('API request failed', error, {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
    });

    return Promise.reject(new Error(message));
  }
);
