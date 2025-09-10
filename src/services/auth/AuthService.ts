import axios from 'axios';

import { config } from '@/config/axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
  };
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

class AuthService {
  private baseURL = '/api/auth';

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${this.baseURL}/login`, credentials, config);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await axios.post(`${this.baseURL}/register`, data, config);
    return response.data;
  }

  async logout(): Promise<void> {
    await axios.post(`${this.baseURL}/logout`, {}, config);
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await axios.post(`${this.baseURL}/refresh`, { refreshToken }, config);
    return response.data;
  }

  async forgotPassword(email: string): Promise<void> {
    await axios.post(`${this.baseURL}/forgot-password`, { email }, config);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await axios.post(`${this.baseURL}/reset-password`, { token, newPassword }, config);
  }

  async verifyEmail(token: string): Promise<void> {
    await axios.post(`${this.baseURL}/verify-email`, { token }, config);
  }

  async resendVerificationEmail(): Promise<void> {
    await axios.post(`${this.baseURL}/resend-verification`, {}, config);
  }
}

export const authService = new AuthService();
export default authService;
