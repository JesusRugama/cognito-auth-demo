import { useState } from 'react';
import { Shield, Mail, Lock, AlertCircle, Users, UserCog, Loader2 } from 'lucide-react';
import { useAuth, AppClient } from '../contexts/AuthContext';

interface AuthProps {
  onLoginSuccess: () => void;
}

export function Auth({ onLoginSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [appClient, setAppClient] = useState<AppClient>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, appClient);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-600/50">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Cognito Auth Demo</h1>
          <p className="text-slate-400">Groups-based Authorization</p>
        </div>

        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
          {/* App Client Selector */}
          <div className="p-6 border-b border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Select App Client
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAppClient('customer')}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  appClient === 'customer'
                    ? 'border-green-500 bg-green-500/10 text-green-300'
                    : 'border-slate-600 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                <Users className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-semibold">Customer</div>
                  <div className="text-xs opacity-70">Endpoints 1 & 2</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setAppClient('admin')}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  appClient === 'admin'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                    : 'border-slate-600 bg-slate-900/50 text-slate-400 hover:border-slate-500'
                }`}
              >
                <UserCog className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-semibold">Admin</div>
                  <div className="text-xs opacity-70">All endpoints</div>
                </div>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <div className="p-6">
            {error && (
              <div className="mb-5 p-4 bg-red-900/30 border border-red-600/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Powered by Amazon Cognito
        </p>
      </div>
    </div>
  );
}
