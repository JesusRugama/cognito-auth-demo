import { LogOut, Shield, Eye, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EndpointCard } from '../components/EndpointCard';
import { API_ENDPOINTS } from '../types/endpoints';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const { user, logout, switchRole } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleSwitchRole = (role: 'customer' | 'admin') => {
    switchRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/50">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Cognito Auth Demo</h1>
                <p className="text-xs text-slate-400">Groups-based Authorization</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-300 font-medium">{user?.email}</p>
                <p className="text-xs text-slate-500 capitalize">
                  Role: <span className="text-blue-400">{user?.role}</span>
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors border border-slate-600"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white mb-3">
            Welcome to the Cognito Auth Demo
          </h2>
          <p className="text-slate-300 leading-relaxed max-w-3xl">
            This demo shows how Cognito groups and app clients control access to API endpoints.
            Log in as a <span className="font-semibold text-blue-400">Customer</span>{' '}
            or <span className="font-semibold text-blue-400">Admin</span> to see which endpoints
            are allowed based on your group.
          </p>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Your Current Groups
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {user?.groups?.map((scope) => (
              <span
                key={scope}
                className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm font-mono text-purple-400 shadow-md"
              >
                {scope}
              </span>
            ))}
          </div>

          <div className="border-t border-slate-700 pt-6 mt-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-4">
              Switch App Client:
            </h4>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => handleSwitchRole('customer')}
                disabled={user?.role === 'customer'}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                  user?.role === 'customer'
                    ? 'bg-green-600 text-white border-2 border-green-400'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-2 border-slate-600'
                }`}
              >
                <Eye className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-sm">Login as Customer</div>
                  <div className="text-xs opacity-80">Read-only access</div>
                </div>
              </button>

              <button
                onClick={() => handleSwitchRole('admin')}
                disabled={user?.role === 'admin'}
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg ${
                  user?.role === 'admin'
                    ? 'bg-blue-600 text-white border-2 border-blue-400'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-2 border-slate-600'
                }`}
              >
                <UserCog className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-sm">Login as Admin</div>
                  <div className="text-xs opacity-80">Full access</div>
                </div>
              </button>
            </div>
          </div>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6">API Endpoints Tester</h3>
          <div className="space-y-4">
            {API_ENDPOINTS.map((endpoint) => (
              <EndpointCard key={endpoint.id} endpoint={endpoint} />
            ))}
          </div>
        </section>

        <div className="text-center py-6">
          <p className="text-sm text-slate-500">
            Simulated API responses using httpbin.org
          </p>
        </div>
      </main>
    </div>
  );
}
