export enum AppClient {
  Customer = 'customer',
  Admin = 'admin',
}

export type UserRole = 'customer' | 'admin';

export interface User {
  email: string;
  role: UserRole;
  groups: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const GROUP_CONFIGS: Record<UserRole, string[]> = {
  customer: ['endpoint1', 'endpoint2'],
  admin: ['endpoint1', 'endpoint2', 'endpoint3', 'endpoint4'],
};
