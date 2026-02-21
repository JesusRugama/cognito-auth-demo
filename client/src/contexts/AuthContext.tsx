import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, GROUP_CONFIGS } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: UserRole) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('cognito_demo_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, password: string, role: UserRole = 'customer'): boolean => {
    if (email === 'user@demo.com' && password === 'Demo123!') {
      const newUser: User = {
        email,
        role,
        groups: GROUP_CONFIGS[role],
      };
      setUser(newUser);
      localStorage.setItem('cognito_demo_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cognito_demo_user');
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        role,
        groups: GROUP_CONFIGS[role],
      };
      setUser(updatedUser);
      localStorage.setItem('cognito_demo_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
