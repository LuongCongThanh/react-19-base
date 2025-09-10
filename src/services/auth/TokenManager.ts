interface TokenData {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

class TokenManager {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly EXPIRES_AT_KEY = 'token_expires_at';

  setTokens(token: string, refreshToken: string, expiresIn: number): void {
    const expiresAt = Date.now() + (expiresIn * 1000);
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt.toString());
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getTokenData(): TokenData | null {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);

    if (!token || !refreshToken || !expiresAt) {
      return null;
    }

    return {
      token,
      refreshToken,
      expiresAt: parseInt(expiresAt, 10),
    };
  }

  isTokenExpired(): boolean {
    const tokenData = this.getTokenData();
    if (!tokenData) {return true;}

    return Date.now() >= tokenData.expiresAt;
  }

  isTokenExpiringSoon(thresholdMinutes: number = 5): boolean {
    const tokenData = this.getTokenData();
    if (!tokenData) {return true;}

    const thresholdMs = thresholdMinutes * 60 * 1000;
    return Date.now() >= (tokenData.expiresAt - thresholdMs);
  }

  clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired();
  }
}

export const tokenManager = new TokenManager();
export default tokenManager;
