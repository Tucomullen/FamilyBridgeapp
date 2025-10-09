import { ApiResponse } from '../types/user';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export interface NetworkError {
  type: 'timeout' | 'offline' | 'server' | 'client' | 'unknown';
  message: string;
  statusCode?: number;
  originalError?: Error;
}

class ApiService {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetries: number;

  constructor() {
    // In production, this would come from environment variables
    this.baseUrl = 'http://localhost:4000';
    this.defaultTimeout = 10000; // 10 seconds
    this.defaultRetries = 2;
  }

  private async makeRequest<T = any>(
    method: HttpMethod,
    path: string,
    body?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      headers = {},
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
    } = options;

    const url = `${this.baseUrl}${path}`;
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout,
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`🌐 API ${method} ${path} (attempt ${attempt + 1}/${retries + 1})`);

        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log(`✅ API ${method} ${path} - Success`);
        return {
          success: true,
          data,
        };
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ API ${method} ${path} - Attempt ${attempt + 1} failed:`, error);

        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    const networkError = this.classifyError(lastError!);
    console.error(`💥 API ${method} ${path} - All attempts failed:`, networkError);

    return {
      success: false,
      error: networkError.message,
    };
  }

  private classifyError(error: Error): NetworkError {
    const message = error.message.toLowerCase();

    if (message.includes('timeout') || message.includes('timed out')) {
      return {
        type: 'timeout',
        message: 'Request timed out. Please check your connection.',
        originalError: error,
      };
    }

    if (message.includes('network') || message.includes('fetch')) {
      return {
        type: 'offline',
        message: 'No internet connection. Please check your network.',
        originalError: error,
      };
    }

    if (message.includes('http 5')) {
      return {
        type: 'server',
        message: 'Server error. Please try again later.',
        originalError: error,
      };
    }

    if (message.includes('http 4')) {
      const statusCode = parseInt(message.match(/http (\d+)/)?.[1] || '400');
      return {
        type: 'client',
        message: this.getClientErrorMessage(statusCode),
        statusCode,
        originalError: error,
      };
    }

    return {
      type: 'unknown',
      message: 'An unexpected error occurred. Please try again.',
      originalError: error,
    };
  }

  private getClientErrorMessage(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. You don\'t have permission.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. The resource already exists.';
      case 429:
        return 'Too many requests. Please wait before trying again.';
      default:
        return `Request failed with status ${statusCode}.`;
    }
  }

  // Public API methods
  async get<T = any>(path: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', path, undefined, options);
  }

  async post<T = any>(path: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', path, body, options);
  }

  async put<T = any>(path: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', path, body, options);
  }

  async delete<T = any>(path: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', path, undefined, options);
  }

  // Health check
  async checkHealth(): Promise<ApiResponse> {
    return this.get('/health');
  }

  // Set base URL (for testing or different environments)
  setBaseUrl(url: string): void {
    this.baseUrl = url;
    console.log(`🌐 API base URL set to: ${url}`);
  }

  // Get current base URL
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const apiService = new ApiService();
