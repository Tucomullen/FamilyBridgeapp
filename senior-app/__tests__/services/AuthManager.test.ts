import { authManager } from '../../src/app/services/AuthManager';
import { apiService } from '../../src/app/services/ApiService';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock apiService
jest.mock('../../src/app/services/ApiService', () => ({
  apiService: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('AuthManager', () => {
  beforeEach(async () => {
    await authManager.clearAllAuth();
    jest.clearAllMocks();
  });

  it('should initialize successfully', async () => {
    await authManager.initialize();
    expect(authManager.isAuthenticated()).toBe(false);
  });

  it('should login successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'senior',
          familyId: 'family-001',
        },
        expiresIn: '24h',
      },
    };

    (apiService.post as jest.Mock).mockResolvedValueOnce(mockResponse);

    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = await authManager.login(credentials);

    expect(apiService.post).toHaveBeenCalledWith('/auth/login', credentials);
    expect(result.token).toBe('mock-jwt-token');
    expect(result.user.name).toBe('Test User');
    expect(authManager.isAuthenticated()).toBe(true);
  });

  it('should handle login failure', async () => {
    (apiService.post as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials',
    });

    const credentials = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    await expect(authManager.login(credentials)).rejects.toThrow('Invalid credentials');
    expect(authManager.isAuthenticated()).toBe(false);
  });

  it('should logout successfully', async () => {
    // First login
    const mockLoginResponse = {
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'senior',
          familyId: 'family-001',
        },
        expiresIn: '24h',
      },
    };

    (apiService.post as jest.Mock).mockResolvedValueOnce(mockLoginResponse);
    await authManager.login({ email: 'test@example.com', password: 'password123' });

    expect(authManager.isAuthenticated()).toBe(true);

    // Then logout
    (apiService.post as jest.Mock).mockResolvedValueOnce({ success: true });
    await authManager.logout();

    expect(authManager.isAuthenticated()).toBe(false);
    expect(authManager.getToken()).toBe(null);
    expect(authManager.getUser()).toBe(null);
  });

  it('should refresh token successfully', async () => {
    // First login
    const mockLoginResponse = {
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'senior',
          familyId: 'family-001',
        },
        expiresIn: '24h',
      },
    };

    (apiService.post as jest.Mock).mockResolvedValueOnce(mockLoginResponse);
    await authManager.login({ email: 'test@example.com', password: 'password123' });

    // Mock successful token verification
    (apiService.get as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { user: mockLoginResponse.data.user },
    });

    const result = await authManager.refreshToken();

    expect(apiService.get).toHaveBeenCalledWith('/auth/verify', {
      headers: { Authorization: 'Bearer mock-jwt-token' },
    });
    expect(result).toBe(true);
  });

  it('should handle token refresh failure', async () => {
    // First login
    const mockLoginResponse = {
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'senior',
          familyId: 'family-001',
        },
        expiresIn: '24h',
      },
    };

    (apiService.post as jest.Mock).mockResolvedValueOnce(mockLoginResponse);
    await authManager.login({ email: 'test@example.com', password: 'password123' });

    // Mock failed token verification
    (apiService.get as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'Invalid token',
    });

    const result = await authManager.refreshToken();

    expect(result).toBe(false);
    expect(authManager.isAuthenticated()).toBe(false);
  });

  it('should get user profile', async () => {
    // First login
    const mockLoginResponse = {
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'senior',
          familyId: 'family-001',
        },
        expiresIn: '24h',
      },
    };

    (apiService.post as jest.Mock).mockResolvedValueOnce(mockLoginResponse);
    await authManager.login({ email: 'test@example.com', password: 'password123' });

    // Mock profile response
    const mockProfileResponse = {
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Updated User',
          role: 'senior',
          familyId: 'family-001',
        },
      },
    };

    (apiService.get as jest.Mock).mockResolvedValueOnce(mockProfileResponse);

    const user = await authManager.getUserProfile();

    expect(apiService.get).toHaveBeenCalledWith('/auth/profile', {
      headers: { Authorization: 'Bearer mock-jwt-token' },
    });
    expect(user?.name).toBe('Updated User');
  });

  it('should return correct auth state', async () => {
    await authManager.initialize();
    
    let state = authManager.getAuthState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBe(null);
    expect(state.token).toBe(null);
    expect(state.isLoading).toBe(false);

    // After login
    const mockResponse = {
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'senior',
          familyId: 'family-001',
        },
        expiresIn: '24h',
      },
    };

    (apiService.post as jest.Mock).mockResolvedValueOnce(mockResponse);
    await authManager.login({ email: 'test@example.com', password: 'password123' });

    state = authManager.getAuthState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe('Test User');
    expect(state.token).toBe('mock-jwt-token');
  });
});
