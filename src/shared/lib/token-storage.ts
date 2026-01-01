/**
 * Secure token storage utility
 * Uses sessionStorage by default for better security (cleared on tab close)
 * Can be configured to use localStorage if needed
 */

type StorageType = 'localStorage' | 'sessionStorage';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Token storage interface
 */
export interface TokenStorageInstance {
  getToken: () => string | null;
  setToken: (token: string) => void;
  getRefreshToken: () => string | null;
  setRefreshToken: (token: string) => void;
  clear: () => void;
  hasToken: () => boolean;
}

/**
 * Factory function to create a token storage instance
 * @param storageType - Type of storage to use ('localStorage' or 'sessionStorage')
 * @returns Token storage instance
 */
export const createTokenStorage = (storageType: StorageType = 'sessionStorage'): TokenStorageInstance => {
  const getStorage = (): Storage => {
    return storageType === 'localStorage' ? localStorage : sessionStorage;
  };

  return {
    /**
     * Get access token
     */
    getToken: (): string | null => {
      try {
        return getStorage().getItem(TOKEN_KEY);
      } catch (_error) {
        // Handle storage access errors (e.g., in private browsing mode)
        return null;
      }
    },

    /**
     * Set access token
     */
    setToken: (token: string): void => {
      if (!token || typeof token !== 'string') {
        throw new Error('Token must be a non-empty string');
      }

      try {
        getStorage().setItem(TOKEN_KEY, token);
      } catch (error) {
        // Handle storage quota exceeded or other errors
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          throw new Error('Storage quota exceeded. Failed to store token.');
        }
        throw new Error(`Failed to store token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get refresh token
     */
    getRefreshToken: (): string | null => {
      try {
        return getStorage().getItem(REFRESH_TOKEN_KEY);
      } catch (_error) {
        return null;
      }
    },

    /**
     * Set refresh token
     */
    setRefreshToken: (token: string): void => {
      if (!token || typeof token !== 'string') {
        throw new Error('Refresh token must be a non-empty string');
      }

      try {
        getStorage().setItem(REFRESH_TOKEN_KEY, token);
      } catch (error) {
        // Handle storage quota exceeded or other errors
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          throw new Error('Storage quota exceeded. Failed to store refresh token.');
        }
        throw new Error(`Failed to store refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Remove all tokens
     */
    clear: (): void => {
      try {
        const storage = getStorage();
        storage.removeItem(TOKEN_KEY);
        storage.removeItem(REFRESH_TOKEN_KEY);
      } catch (_error) {
        // Ignore errors during cleanup
      }
    },

    /**
     * Check if token exists
     */
    hasToken: (): boolean => {
      return getStorage().getItem(TOKEN_KEY) !== null;
    },
  };
};

// Export default singleton instance for backward compatibility
export const tokenStorage = createTokenStorage('sessionStorage');

// Export factory function for creating custom instances (e.g., for testing)
export { createTokenStorage as createTokenStorageInstance };
