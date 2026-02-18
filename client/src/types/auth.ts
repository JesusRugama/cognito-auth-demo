export type UserRole = 'viewer' | 'admin';

export interface User {
  email: string;
  role: UserRole;
  scopes: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const DEMO_CREDENTIALS = {
  email: 'user@demo.com',
  password: 'Admin123!',
};

export const SCOPE_CONFIGS = {
  viewer: ['openid', 'profile', 'myapi/read'],
  admin: ['openid', 'profile', 'myapi/read', 'myapi/write', 'myapi/admin'],
};
