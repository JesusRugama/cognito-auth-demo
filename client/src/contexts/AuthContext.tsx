import { createContext, useContext, useState, ReactNode } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { User, UserRole } from '../types/auth';

const REGION = import.meta.env.VITE_AWS_REGION ?? 'us-east-1';
const USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID ?? '';
const CUSTOMER_CLIENT_ID = import.meta.env.VITE_COGNITO_CUSTOMER_CLIENT_ID ?? '';
const ADMIN_CLIENT_ID = import.meta.env.VITE_COGNITO_ADMIN_CLIENT_ID ?? '';

export type AppClient = 'customer' | 'admin';

function getClientId(appClient: AppClient): string {
  return appClient === 'admin' ? ADMIN_CLIENT_ID : CUSTOMER_CLIENT_ID;
}

function getUserPool(appClient: AppClient): CognitoUserPool {
  return new CognitoUserPool({
    UserPoolId: USER_POOL_ID,
    ClientId: getClientId(appClient),
  });
}

function decodeGroups(session: CognitoUserSession): string[] {
  try {
    const payload = session.getIdToken().decodePayload();
    return (payload['cognito:groups'] as string[]) ?? [];
  } catch {
    return [];
  }
}

function groupsToRole(groups: string[]): UserRole {
  return groups.includes('admin') ? 'admin' : 'customer';
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, appClient: AppClient) => Promise<void>;
  signUp: (email: string, password: string, appClient: AppClient) => Promise<void>;
  confirmSignUp: (email: string, code: string, appClient: AppClient) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);

  const login = (email: string, password: string, appClient: AppClient): Promise<void> => {
    return new Promise((resolve, reject) => {
      const pool = getUserPool(appClient);
      const cogUser = new CognitoUser({ Username: email, Pool: pool });
      const authDetails = new AuthenticationDetails({ Username: email, Password: password });

      cogUser.authenticateUser(authDetails, {
        onSuccess(session) {
          const groups = decodeGroups(session);
          const role = groupsToRole(groups);
          setUser({ email, role, groups });
          setAccessToken(session.getAccessToken().getJwtToken());
          setCognitoUser(cogUser);
          resolve();
        },
        onFailure(err: Error) {
          reject(new Error(err.message));
        },
        newPasswordRequired(_userAttributes) {
          reject(new Error('Password reset required. Please contact an administrator.'));
        },
      });
    });
  };

  const signUp = (email: string, password: string, appClient: AppClient): Promise<void> => {
    return new Promise((resolve, reject) => {
      const pool = getUserPool(appClient);
      pool.signUp(email, password, [], [], (err) => {
        if (err) {
          reject(new Error(err.message));
        } else {
          resolve();
        }
      });
    });
  };

  const confirmSignUp = (email: string, code: string, appClient: AppClient): Promise<void> => {
    return new Promise((resolve, reject) => {
      const pool = getUserPool(appClient);
      const cogUser = new CognitoUser({ Username: email, Pool: pool });
      cogUser.confirmRegistration(code, true, (err) => {
        if (err) {
          reject(new Error(err.message));
        } else {
          resolve();
        }
      });
    });
  };

  const logout = () => {
    cognitoUser?.signOut();
    setUser(null);
    setAccessToken(null);
    setCognitoUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isAuthenticated: !!user, login, signUp, confirmSignUp, logout }}>
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

export { REGION };
