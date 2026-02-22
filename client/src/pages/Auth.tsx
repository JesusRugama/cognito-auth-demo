import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, CheckCircle, Users, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AppClient } from '../types/auth';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';

type Tab = 'login' | 'register';

export function Auth() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [appClient, setAppClient] = useState<AppClient>(AppClient.Customer);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signUp, confirmSignUp } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, appClient);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    await signUp(email, password, appClient);
  };

  const handleConfirm = async (email: string, code: string) => {
    await confirmSignUp(email, code, appClient);
  };

  const handleRegistered = () => {
    setSuccess('Account confirmed! You can now sign in.');
    setActiveTab('login');
  };

  const switchTab = (tab: Tab) => {
    setError('');
    setSuccess('');
    setActiveTab(tab);
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
                onClick={() => setAppClient(AppClient.Customer)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  appClient === AppClient.Customer
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
                onClick={() => setAppClient(AppClient.Admin)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  appClient === AppClient.Admin
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

          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'login'
                  ? 'bg-slate-900 text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'register'
                  ? 'bg-slate-900 text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-5 p-4 bg-red-900/30 border border-red-600/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-5 p-4 bg-green-900/30 border border-green-600/50 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-300">{success}</p>
              </div>
            )}

            {activeTab === 'login' ? (
              <LoginForm loading={loading} onSubmit={handleLogin} />
            ) : (
              <RegisterForm
                loading={loading}
                onRegister={handleRegister}
                onConfirm={handleConfirm}
                onRegistered={handleRegistered}
              />
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-sm">
          <p className="text-slate-400 font-semibold mb-2">Demo Admin Credentials</p>
          <p className="text-slate-300 font-mono">admin@demo.com / P@ssw0rd</p>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Powered by Amazon Cognito
        </p>
      </div>
    </div>
  );
}
