import { apiService } from '../../src/app/services/ApiService';

// Mock fetch
global.fetch = jest.fn();

describe('ApiService', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should make GET request successfully', async () => {
    const mockResponse = { success: true, data: { message: 'Hello' } };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await apiService.get('/test');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/test',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResponse);
  });

  it('should make POST request with body', async () => {
    const mockResponse = { success: true, data: { id: 1 } };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const body = { name: 'Test' };
    const result = await apiService.post('/test', body);

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(result.success).toBe(true);
  });

  it('should handle 401 error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    const result = await apiService.get('/test');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Authentication required. Please log in.');
  });

  it('should handle 500 error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ error: 'Server error' }),
    });

    const result = await apiService.get('/test');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Server error. Please try again later.');
  });

  it('should handle network timeout', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('timeout'));

    const result = await apiService.get('/test');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Request timed out. Please check your connection.');
  });

  it('should handle network error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network request failed'));

    const result = await apiService.get('/test');

    expect(result.success).toBe(false);
    expect(result.error).toBe('No internet connection. Please check your network.');
  });

  it('should retry on failure', async () => {
    (fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    const result = await apiService.get('/test');

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
  });

  it('should check health endpoint', async () => {
    const mockResponse = { status: 'ok' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await apiService.checkHealth();

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/health',
      expect.any(Object)
    );
    expect(result.success).toBe(true);
  });

  it('should set and get base URL', () => {
    const newUrl = 'https://api.example.com';
    apiService.setBaseUrl(newUrl);
    expect(apiService.getBaseUrl()).toBe(newUrl);
  });
});
