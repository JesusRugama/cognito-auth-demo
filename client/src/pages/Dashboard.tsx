import { useNavigate } from 'react-router-dom';
import { LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EndpointCard } from '../components/EndpointCard';
import { API_ENDPOINTS } from '../types/endpoints';

const isAdminMode = () => {
  const hostname = window.location.hostname;
  const envIsAdmin = import.meta.env.VITE_IS_ADMIN === 'true';
  return hostname.startsWith('admin.') || envIsAdmin;
};

export function Dashboard() {
  const isAdmin = isAdminMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-theme-bg-page">
      <header className="bg-theme-bg-card/80 border-b border-theme-border backdrop-blur-sm sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/50">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-theme-text-primary">Cognito Auth Demo{isAdmin && ': Admin'}</h1>
                <p className="text-xs text-theme-text-secondary">Groups-based Authorization</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-theme-text-secondary font-medium">{user?.email}</p>
                <p className="text-xs text-theme-text-muted capitalize">
                  Role: <span className="text-blue-500">{user?.role}</span>
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-theme-bg-card-alt hover:opacity-80 text-theme-text-primary rounded-lg transition-colors border border-theme-border"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="bg-theme-bg-card border border-theme-border rounded-xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-theme-text-primary mb-3">
            Welcome to the Cognito Auth Demo
          </h2>
          <p className="text-theme-text-secondary leading-relaxed max-w-3xl">
            This demo shows how Cognito <span className="font-semibold text-blue-500">groups</span> and{' '}
            <span className="font-semibold text-blue-500">app clients</span> control access to API
            endpoints. Any authenticated user can access customer endpoints (1 & 2). Only users in
            the <span className="font-semibold text-purple-500">admin</span> group, signed in through
            the admin client, can access admin endpoints (3 & 4). A Lambda authorizer checks both
            your group and client on every request.
          </p>
        </section>

        <section className="bg-theme-bg-card border border-theme-border rounded-xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-theme-text-primary mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Your Current Groups
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {user?.groups?.map((scope) => (
              <span
                key={scope}
                className="px-4 py-2 bg-theme-bg-card-alt border border-theme-border rounded-lg text-sm font-mono text-purple-500 shadow-md"
              >
                {scope}
              </span>
            ))}
          </div>

        </section>

        <section className="bg-theme-bg-card border border-theme-border rounded-xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-theme-text-primary mb-6">API Endpoints Tester</h3>
          <div className="space-y-4">
            {API_ENDPOINTS.map((endpoint) => (
              <EndpointCard key={endpoint.id} endpoint={endpoint} />
            ))}
          </div>
        </section>

        <div className="text-center py-6">
          <p className="text-sm text-theme-text-muted">
            Powered by Amazon Cognito · To switch roles, log out and sign in with a different app client
          </p>
        </div>
      </main>
    </div>
  );
}
