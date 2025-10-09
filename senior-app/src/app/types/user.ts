export interface User {
  id: string;
  email: string;
  name: string;
  role: 'senior' | 'family';
  familyId: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  expiresIn: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PhotoMetadata {
  id: string;
  title: string;
  uri: string;
  timestamp: string;
  size: number;
  width: number;
  height: number;
  isLocal: boolean;
  familyId: string;
  uploadedBy: string;
}

export interface TelemetryEvent {
  id: string;
  name: string;
  payload: Record<string, any>;
  timestamp: string;
  sessionId: string;
  userId: string;
  familyId: string;
  receivedAt: string;
}
