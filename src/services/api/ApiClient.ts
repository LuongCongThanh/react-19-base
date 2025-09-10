import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { securityService } from '../auth/SecurityService';
import { tokenManager } from '../auth/TokenManager';

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token
        const token = tokenManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token
        const csrfToken = securityService.generateCSRFToken();
        config.headers['X-CSRF-Token'] = csrfToken;

        // Log request
        if (process.env.NODE_ENV === 'development') {
          console.log('API Request:', config.method?.toUpperCase(), config.url);
        }

        return config;
      },
      (error) => {
        securityService.logSecurityEvent({
          type: 'auth',
          message: 'Request interceptor error',
          severity: 'medium',
          metadata: { error: error.message }
        });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful response
        if (process.env.NODE_ENV === 'development') {
          console.log('API Response:', response.status, response.config.url);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = tokenManager.getRefreshToken();
            if (refreshToken) {
              // Try to refresh token
              const response = await this.client.post('/auth/refresh', {
                refreshToken
              });

              const { token, refreshToken: newRefreshToken } = response.data;
              tokenManager.setTokens(token, newRefreshToken, 3600); // 1 hour

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            tokenManager.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Log security events for certain error types
        if (error.response?.status === 403) {
          securityService.logSecurityEvent({
            type: 'permission',
            message: 'Access forbidden',
            severity: 'medium',
            metadata: { url: originalRequest.url, status: error.response.status }
          });
        }

        if (error.response?.status === 429) {
          securityService.logSecurityEvent({
            type: 'rate_limit',
            message: 'Rate limit exceeded',
            severity: 'medium',
            metadata: { url: originalRequest.url, status: error.response.status }
          });
        }

        return Promise.reject(error);
      }
    );
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // Utility methods
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
    this.client.defaults.baseURL = baseURL;
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  setAuthToken(token: string): void {
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.client.defaults.headers.Authorization;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
