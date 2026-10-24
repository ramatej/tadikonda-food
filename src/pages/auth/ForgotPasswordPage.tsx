import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const result = await resetPassword(email);
      setIsSent(true);
      showToast(result.message, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 pb-24 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/login')}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-gray-950 tracking-tight">Reset Password</h1>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 text-xs">
        {isSent ? (
          <div className="text-center py-4 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-sm text-gray-900">Reset Email Sent</h3>
            <p className="text-gray-500 leading-relaxed">
              If an account exists for <strong>{email}</strong>, a password reset link has been
              sent. Check your inbox and follow the instructions.
            </p>
            <Button variant="primary" size="md" onClick={() => navigate('/login')}>
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-500 leading-relaxed">
              Enter your registered email address and we'll send you a password reset link.
            </p>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Email Address</label>
              <input
                id="forgot-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Send Reset Link
            </Button>
          </form>
        )}
      </div>

      <p className="text-center text-xs text-gray-500">
        Remember your password?{' '}
        <Link to="/login" className="text-orange-600 font-bold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};
