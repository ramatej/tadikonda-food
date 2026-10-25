import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PublicRegistrationRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { validateAndNormalizeIndianPhone } from '../../utils/phoneUtils';

const ROLE_OPTIONS: { r: PublicRegistrationRole; label: string; description: string }[] = [
  { r: 'customer', label: 'Customer', description: 'Order food delivery' },
  { r: 'restaurant_owner', label: 'Restaurant', description: 'List & manage your restaurant' },
  { r: 'delivery_partner', label: 'Delivery', description: 'Earn by delivering orders' },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, getRoleDestination } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<PublicRegistrationRole>('customer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    const phoneValidation = validateAndNormalizeIndianPhone(phone);
    if (!phoneValidation.isValid) {
      showToast(phoneValidation.error || 'Please enter a valid Indian mobile number', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(name, email, phoneValidation.e164, role, password);

      if (result.needsEmailVerification) {
        setRegisteredEmail(email);
        setVerificationSent(true);
        showToast('Check your email for a verification link!', 'success');
        return;
      }

      if (result.user) {
        showToast(`Welcome, ${result.user.name}! Account created successfully.`, 'success');
        // Redirect to the role's destination (e.g. restaurant owner → dashboard)
        const dest = getRoleDestination();
        navigate(dest, { replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Email verification sent state ─────────────────────────────────────────
  if (verificationSent) {
    return (
      <div className="max-w-md mx-auto py-12 pb-24 space-y-6 text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
        <h1 className="text-xl font-black text-gray-900">Check Your Email</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          A verification link has been sent to{' '}
          <strong className="text-gray-800">{registeredEmail}</strong>.<br />
          Please click the link in your inbox to activate your account, then sign in.
        </p>
        {role === 'restaurant_owner' && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
            Your restaurant listing will remain <strong>pending admin approval</strong> after you
            first sign in. You will be notified when it goes live.
          </p>
        )}
        <Button variant="primary" size="lg" onClick={() => navigate('/login')}>
          Go to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 pb-24 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-500/20">
          <UtensilsCrossed className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">Create Account</h1>
        <p className="text-xs text-gray-500">Join the Tadikonda Food delivery community</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          {/* Role Selection */}
          <div>
            <label className="block text-gray-700 font-bold mb-1.5">I want to join as</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLE_OPTIONS.map(({ r, label }) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-xl font-bold transition-all ${
                    role === r
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {role === 'restaurant_owner' && (
              <p className="text-[11px] text-amber-700 mt-2">
                Restaurant listings require admin approval before going live.
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Full Name</label>
            <input
              id="reg-name"
              type="text"
              required
              autoComplete="name"
              placeholder="e.g. Sravan Varma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Email Address</label>
            <input
              id="reg-email"
              type="email"
              required
              autoComplete="email"
              placeholder="sravan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Mobile Number (+91)</label>
            <div className="flex rounded-xl border border-gray-300 overflow-hidden focus-within:border-orange-500 bg-gray-50">
              <span className="bg-gray-100 text-gray-600 font-bold px-3 py-2.5 border-r border-gray-200">
                +91
              </span>
              <input
                id="reg-phone"
                type="tel"
                required
                maxLength={10}
                autoComplete="tel"
                placeholder="9440123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 p-2.5 bg-transparent focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Password</label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Confirm</label>
              <input
                id="reg-confirm-password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>

      <p className="text-center text-xs text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-orange-600 font-bold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};
