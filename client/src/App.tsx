import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<'auth' | 'dashboard'>('auth');
  const { isAuthenticated } = useAuth();

  const navigateToDashboard = () => setCurrentRoute('dashboard');
  const navigateToAuth = () => setCurrentRoute('auth');

  if (currentRoute === 'dashboard' && isAuthenticated) {
    return (
      <ProtectedRoute onRedirect={navigateToAuth}>
        <Dashboard onLogout={navigateToAuth} />
      </ProtectedRoute>
    );
  }

  return <Auth onLoginSuccess={navigateToDashboard} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
