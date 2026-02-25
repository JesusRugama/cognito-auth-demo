import { useState } from 'react';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

type RegisterStep = 'form' | 'confirm';

interface RegisterFormProps {
  loading: boolean;
  onRegister: (email: string, password: string) => Promise<void>;
  onConfirm: (email: string, code: string) => Promise<void>;
  onRegistered: () => void;
}

export function RegisterForm({ loading, onRegister, onConfirm, onRegistered }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [step, setStep] = useState<RegisterStep>('form');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isLoading = loading || submitting;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await onRegister(email, password);
      setStep('confirm');
      setSuccess('A verification code has been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!confirmationCode) {
      setError('Please enter the verification code');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm(email, confirmationCode);
      onRegistered();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Confirmation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-5 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-500">{success}</p>
        </div>
      )}

      {step === 'form' ? (
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 bg-theme-input-bg border border-theme-input-border rounded-lg text-theme-input-text placeholder-theme-text-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 bg-theme-input-bg border border-theme-input-border rounded-lg text-theme-input-text placeholder-theme-text-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                placeholder="Min. 8 characters"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-text-muted" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 bg-theme-input-bg border border-theme-input-border rounded-lg text-theme-input-text placeholder-theme-text-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleConfirm} className="space-y-5">
          <p className="text-sm text-theme-text-secondary">
            Enter the verification code sent to <span className="text-blue-500 font-medium">{email}</span>
          </p>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-theme-input-bg border border-theme-input-border rounded-lg text-theme-input-text placeholder-theme-text-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 text-center tracking-widest text-lg"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm Account'
            )}
          </button>
        </form>
      )}
    </>
  );
}
