// Conditional import for Expo Go compatibility
let SecureStore: any = null;

try {
  SecureStore = require('expo-secure-store');
} catch (error) {
  console.log('🔐 expo-secure-store not available in Expo Go');
}

import { User, AuthResponse, LoginCredentials } from '../types/user';
import { apiService } from './ApiService';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

class AuthManager {
  private token: string | null = null;
  private user: User | null = null;
  private isInitialized = false;
  private readonly TOKEN_KEY = 'familybridge_auth_token';
  private readonly USER_KEY = 'familybridge_user_data';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load stored token and user data
      await this.loadStoredAuth();
      this.isInitialized = true;
      console.log('🔐 AuthManager initialized, authenticated:', this.isAuthenticated());
    } catch (error) {
      console.error('🔐 Failed to initialize AuthManager:', error);
      this.isInitialized = true;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login for:', credentials.email);

      const response = await apiService.post<AuthResponse>('/auth/login', credentials);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Login failed');
      }

      const { token, user } = response.data;

      // Store authentication data
      await this.storeAuth(token, user);
      
      // Update instance state
      this.token = token;
      this.user = user;

      console.log('🔐 Login successful for user:', user.name);
      return response.data;
    } catch (error) {
      console.error('🔐 Login failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🔐 Logging out user:', this.user?.name);

      // Call logout endpoint (optional, mainly for server-side cleanup)
      if (this.token) {
        try {
          await apiService.post('/auth/logout', {}, {
            headers: { Authorization: `Bearer ${this.token}` }
          });
        } catch (error) {
          console.log('🔐 Logout endpoint call failed (non-critical):', error);
        }
      }

      // Clear stored data
      await this.clearStoredAuth();
      
      // Update instance state
      this.token = null;
      this.user = null;

      console.log('🔐 Logout successful');
    } catch (error) {
      console.error('🔐 Logout failed:', error);
      // Even if logout fails, clear local data
      await this.clearStoredAuth();
      this.token = null;
      this.user = null;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      if (!this.token) {
        console.log('🔐 No token to refresh');
        return false;
      }

      console.log('🔐 Refreshing token...');

      const response = await apiService.get('/auth/verify', {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      if (response.success) {
        console.log('🔐 Token is still valid');
        return true;
      } else {
        console.log('🔐 Token is invalid, logging out');
        await this.logout();
        return false;
      }
    } catch (error) {
      console.error('🔐 Token refresh failed:', error);
      await this.logout();
      return false;
    }
  }

  async getUserProfile(): Promise<User | null> {
    try {
      if (!this.token) {
        console.log('🔐 No token available for profile request');
        return null;
      }

      console.log('🔐 Fetching user profile...');

      const response = await apiService.get<{ user: User }>('/auth/profile', {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      if (response.success && response.data) {
        this.user = response.data.user;
        await this.storeUserData(response.data.user);
        console.log('🔐 Profile updated:', response.data.user.name);
        return response.data.user;
      } else {
        console.log('🔐 Profile fetch failed:', response.error);
        return null;
      }
    } catch (error) {
      console.error('🔐 Profile fetch failed:', error);
      return null;
    }
  }

  // Getters
  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!(this.token && this.user);
  }

  getAuthState(): AuthState {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.user,
      token: this.token,
      isLoading: !this.isInitialized,
    };
  }

  // Private methods
  private async loadStoredAuth(): Promise<void> {
    try {
      if (!SecureStore) {
        console.log('🔐 SecureStore not available, using fallback storage');
        return;
      }

      const [token, userData] = await Promise.all([
        SecureStore.getItemAsync(this.TOKEN_KEY),
        SecureStore.getItemAsync(this.USER_KEY),
      ]);

      if (token && userData) {
        this.token = token;
        this.user = JSON.parse(userData);
        console.log('🔐 Loaded stored auth data for user:', this.user?.name);
      }
    } catch (error) {
      console.error('🔐 Failed to load stored auth:', error);
    }
  }

  private async storeAuth(token: string, user: User): Promise<void> {
    try {
      if (!SecureStore) {
        console.log('🔐 SecureStore not available, skipping secure storage');
        return;
      }

      await Promise.all([
        SecureStore.setItemAsync(this.TOKEN_KEY, token),
        SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user)),
      ]);

      console.log('🔐 Auth data stored securely');
    } catch (error) {
      console.error('🔐 Failed to store auth data:', error);
    }
  }

  private async storeUserData(user: User): Promise<void> {
    try {
      if (!SecureStore) {
        console.log('🔐 SecureStore not available, skipping user data storage');
        return;
      }

      await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
      console.log('🔐 User data updated');
    } catch (error) {
      console.error('🔐 Failed to store user data:', error);
    }
  }

  private async clearStoredAuth(): Promise<void> {
    try {
      if (!SecureStore) {
        console.log('🔐 SecureStore not available, skipping auth cleanup');
        return;
      }

      await Promise.all([
        SecureStore.deleteItemAsync(this.TOKEN_KEY),
        SecureStore.deleteItemAsync(this.USER_KEY),
      ]);

      console.log('🔐 Stored auth data cleared');
    } catch (error) {
      console.error('🔐 Failed to clear stored auth:', error);
    }
  }

  // For testing - clear all auth data
  async clearAllAuth(): Promise<void> {
    await this.clearStoredAuth();
    this.token = null;
    this.user = null;
    console.log('🔐 All auth data cleared');
  }
}

// Export singleton instance
export const authManager = new AuthManager();
