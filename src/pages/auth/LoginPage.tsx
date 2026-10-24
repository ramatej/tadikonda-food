import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { isSupabaseConfigured } from '../../services/supabase/client';
import {
  UtensilsCrossed,
  Mail,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldAlert,
  User,
  Utensils,
  Bike,
  Shield,
} from 'lucide-react';
import type { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, switchRole, getRoleDestination } = useAuth();
  const { showToast } = useToast();

  // After login, go to the page the user originally tried to access
  const from: string = (location.state as { from?: { pathname: string } })?.from?.pathname || null!;

  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Demo OTP states (only shown when Supabase is NOT configured)
  const [phone, setPhone] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(30);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      const result = await loginWithEmail(email, password);
      if (result.needsEmailVerification) {
        setVerificationSent(true);
        showToast('Please verify your email address first.', 'info');
        return;
      }
      if (result.user) {
        showToast(`Welcome back, ${result.user.name}!`, 'success');
        // Redirect to original destination if available, else role dashboard
        const dest = from || { customer: '/', restaurant_owner: '/restaurant/dashboard', delivery_partner: '/delivery/dashboard', admin: '/admin/dashboard' }[result.user.role] || '/';
        navigate(dest, { replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo OTP handler (mock-only)
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      showToast('Please enter a valid 10-digit Indian phone number', 'error');
      return;
    }
    setIsOtpSent(true);
    setOtp('1234');
    showToast('Demo OTP 1234 sent to +91 ' + phone, 'info');
    let timer = 30;
    setCountdown(30);
    const interval = setInterval(() => {
      timer -= 1;
      setCountdown(timer);
      if (timer <= 0) clearInterval(interval);
    }, 1000);
  };

      const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
          // Demo only — loginWithPhone is mock
          showToast('Logged in successfully via mobile number (Demo)', 'success');
          navigate(from || getRoleDestination(), { replace: true });
        } catch {
          showToast('Invalid OTP', 'error');
        } finally {
          setIsLoading(false);
        }
      };

  const handleQuickDemoLogin = async (role: UserRole) => {
    if (!switchRole) return;
    await switchRole(role);
    if (role === 'restaurant_owner') navigate('/restaurant/dashboard');
    else if (role === 'delivery_partner') navigate('/delivery/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/');
  };

  // ── Email verification notice ────────────────────────────────────────────
  if (verificationSent) {
    return (
      <div className="max-w-md mx-auto py-12 pb-24 space-y-6 text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
        <h1 className="text-xl font-black text-gray-900">Verify Your Email</h1>
        <p className="text-sm text-gray-500">
          A verification link has been sent to <strong>{email}</strong>.<br />
          Please click the link in your inbox to activate your account, then log in again.
        </p>
        <Button variant="primary" size="lg" onClick={() => setVerificationSent(false)}>
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 pb-24 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-500/20">
          <UtensilsCrossed className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">
          Welcome to Tadikonda Food
        </h1>
        <p className="text-xs text-gray-500">
          Log in to order delicious breakfast tiffins and meals
        </p>
      </div>

      {/* Demo mode notice */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block">Demo Mode Active</span>
            <span className="text-[11px] text-amber-800">
              Supabase is not configured. Authentication is running in demo/mock mode.
            </span>
          </div>
        </div>
      )}

      {/* Login Tabs */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        {/* Login Method Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'email'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email &amp; Password</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('phone')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'phone'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Mobile OTP (+91)</span>
          </button>
        </div>

        {/* Mobile OTP Flow */}
        {authMethod === 'phone' && (
          <div className="space-y-4">
            {isSupabaseConfigured ? (
              <div className="space-y-4 text-xs">
                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-amber-900">
                  <span className="font-extrabold block mb-0.5">Mobile OTP Authentication Deferred</span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    SMS phone OTP authentication is not yet enabled for this platform. Please sign in using your registered Email &amp; Password.
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1.5">
                    Indian Mobile Number
                  </label>
                  <div className="flex rounded-2xl border border-gray-300 overflow-hidden focus-within:border-orange-500 bg-gray-50">
                    <span className="bg-gray-100 text-gray-600 font-bold px-3 py-3 border-r border-gray-200">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="94401 23456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 p-3 bg-transparent font-bold text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  type="button"
                  onClick={() => {
                    showToast('SMS gateway OTP is not yet enabled. Switched to Email & Password sign-in.', 'info');
                    setAuthMethod('email');
                  }}
                  className="w-full"
                >
                  Use Email &amp; Password Instead
                </Button>
              </div>
            ) : !isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1.5">
                    Indian Mobile Number
                  </label>
                  <div className="flex rounded-2xl border border-gray-300 overflow-hidden focus-within:border-orange-500 bg-gray-50">
                    <span className="bg-gray-100 text-gray-600 font-bold px-3 py-3 border-r border-gray-200">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="94401 23456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 p-3 bg-transparent font-bold text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>
                <Button variant="primary" size="lg" type="submit" className="w-full">
                  Send Demo OTP
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-gray-700 font-bold">Enter 4-Digit OTP</label>
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      className="text-orange-600 font-bold hover:underline"
                    >
                      Change Phone
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    placeholder="Enter 1234"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-3 text-center tracking-widest text-lg font-black bg-gray-50 border border-gray-300 rounded-2xl focus:border-orange-500 focus:outline-none"
                  />
                  <div className="flex justify-between items-center text-[11px] text-gray-400 mt-1.5">
                    <span>Demo OTP auto-filled: 1234</span>
                    {countdown > 0 ? (
                      <span>Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-orange-600 font-bold hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Verify &amp; Continue
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Email & Password Flow */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-700 font-bold mb-1.5">Email Address</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-2xl focus:border-orange-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-gray-700 font-bold">Password</label>
                <Link to="/forgot-password" className="text-orange-600 font-bold hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-2xl focus:border-orange-500 focus:outline-none font-medium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>
        )}

        {/* 1-Click Demo Accounts — only shown in mock/demo mode */}
        {!isSupabaseConfigured && switchRole && (
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center">
              Or Instant 1-Click Role Logins (Demo)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => handleQuickDemoLogin('customer')}
                className="p-2.5 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 rounded-xl border border-gray-200 transition-colors flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-orange-600" />
                <span>Customer</span>
              </button>
              <button
                onClick={() => handleQuickDemoLogin('restaurant_owner')}
                className="p-2.5 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 rounded-xl border border-gray-200 transition-colors flex items-center gap-2"
              >
                <Utensils className="w-3.5 h-3.5 text-orange-600" />
                <span>Restaurant</span>
              </button>
              <button
                onClick={() => handleQuickDemoLogin('delivery_partner')}
                className="p-2.5 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 rounded-xl border border-gray-200 transition-colors flex items-center gap-2"
              >
                <Bike className="w-3.5 h-3.5 text-orange-600" />
                <span>Delivery</span>
              </button>
              <button
                onClick={() => handleQuickDemoLogin('admin')}
                className="p-2.5 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 rounded-xl border border-gray-200 transition-colors flex items-center gap-2"
              >
                <Shield className="w-3.5 h-3.5 text-orange-600" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-orange-600 font-bold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};
