import { ReactNode, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  onRedirect: () => void;
}

export function ProtectedRoute({ children, onRedirect }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      onRedirect();
    }
  }, [isAuthenticated, onRedirect]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
