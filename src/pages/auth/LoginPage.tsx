import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { isSupabaseConfigured } from '../../services/supabase/client';
import { validateAndNormalizeIndianPhone } from '../../utils/phoneUtils';
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
  ArrowLeft,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import type { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, sendPhoneOtp, verifyPhoneOtp, switchRole } = useAuth();
  const { showToast } = useToast();

  // After login, go to the page the user originally tried to access
  const from: string = (location.state as { from?: { pathname: string } })?.from?.pathname || null!;

  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [smsGatewayNotice, setSmsGatewayNotice] = useState<string | null>(null);

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Handle countdown timer
  useEffect(() => {
    if (countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [countdown]);

  // ── Email sign-in handler ────────────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsEmailLoading(true);
    try {
      const result = await loginWithEmail(email, password);
      if (result.needsEmailVerification) {
        setVerificationSent(true);
        showToast('Please verify your email address first.', 'info');
        return;
      }
      if (result.user) {
        showToast(`Welcome back, ${result.user.name}!`, 'success');
        const dest = from || {
          customer: '/',
          restaurant_owner: '/restaurant/dashboard',
          delivery_partner: '/delivery/dashboard',
          admin: '/admin/dashboard',
        }[result.user.role] || '/';
        navigate(dest, { replace: true });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      showToast(message, 'error');
    } finally {
      setIsEmailLoading(false);
    }
  };

  // ── Phone OTP: Request OTP ───────────────────────────────────────────────
  const handleSendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPhoneError(null);
    setOtpError(null);
    setSmsGatewayNotice(null);

    const validation = validateAndNormalizeIndianPhone(phone);
    if (!validation.isValid) {
      setPhoneError(validation.error || 'Please enter a valid 10-digit mobile number.');
      showToast(validation.error || 'Invalid mobile number', 'error');
      return;
    }

    if (resendCount >= 3) {
      setPhoneError('Maximum OTP requests reached for this session. Please try again after some time or sign in with Email.');
      showToast('Maximum OTP requests reached', 'error');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendPhoneOtp(validation.e164);
      setIsOtpSent(true);
      setCountdown(60);
      setResendCount((prev) => prev + 1);
      showToast(res.message || `OTP sent to ${validation.display}`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP.';
      if (msg.includes('SMS gateway') || msg.includes('provider')) {
        setSmsGatewayNotice(msg);
      } else {
        setPhoneError(msg);
      }
      showToast(msg, 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── Phone OTP: Verify OTP ────────────────────────────────────────────────
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setOtpError('Please enter the verification code.');
      return;
    }

    if (cleanOtp.length < 4 || cleanOtp.length > 8) {
      setOtpError('Please enter a valid 6-digit verification code.');
      return;
    }

    const validation = validateAndNormalizeIndianPhone(phone);
    if (!validation.isValid) {
      setPhoneError('Invalid phone number.');
      setIsOtpSent(false);
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const result = await verifyPhoneOtp(validation.e164, cleanOtp);
      if (result.user) {
        showToast(`Welcome back, ${result.user.name}!`, 'success');
        const dest = from || {
          customer: '/',
          restaurant_owner: '/restaurant/dashboard',
          delivery_partner: '/delivery/dashboard',
          admin: '/admin/dashboard',
        }[result.user.role] || '/';
        navigate(dest, { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid verification code.';
      setOtpError(msg);
      showToast(msg, 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetPhone = () => {
    setIsOtpSent(false);
    setOtp('');
    setOtpError(null);
    setPhoneError(null);
    setSmsGatewayNotice(null);
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
      <div className="max-w-md mx-auto py-12 pb-24 space-y-6 text-center px-4">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
        <h1 className="text-xl font-black text-gray-900">Verify Your Email</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
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
    <div className="max-w-md mx-auto py-8 pb-24 space-y-6 px-4">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-500/20">
          <UtensilsCrossed className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">
          Welcome to Tadikonda Food
        </h1>
        <p className="text-xs text-gray-500">
          Log in to order fresh breakfast tiffins and hot meals
        </p>
      </div>

      {/* Demo mode notice */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block">Demo Mode Active</span>
            <span className="text-[11px] text-amber-800">
              Supabase is running in local demo mode. Mobile OTP uses demo code (123456).
            </span>
          </div>
        </div>
      )}

      {/* Login Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
        {/* Method Selector Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            id="tab-email-login"
            onClick={() => {
              setAuthMethod('email');
              setSmsGatewayNotice(null);
            }}
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
            id="tab-phone-login"
            onClick={() => {
              setAuthMethod('phone');
              setSmsGatewayNotice(null);
            }}
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

        {/* ── Mobile OTP Authentication Flow ────────────────────────────── */}
        {authMethod === 'phone' && (
          <div className="space-y-4">
            {smsGatewayNotice && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-950 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">SMS Gateway Setup Required</span>
                    <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                      {smsGatewayNotice}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthMethod('email')}
                  className="w-full py-2 bg-white text-amber-900 border border-amber-300 font-bold rounded-xl text-[11px] hover:bg-amber-100/50 transition-colors"
                >
                  Switch to Email &amp; Password
                </button>
              </div>
            )}

            {!isOtpSent ? (
              // Step 1: Phone number entry
              <form onSubmit={handleSendPhoneOtp} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-700 font-bold mb-1.5">
                    Indian Mobile Number
                  </label>
                  <div
                    className={`flex rounded-2xl border ${
                      phoneError ? 'border-red-400 bg-red-50/20' : 'border-gray-300 bg-gray-50'
                    } overflow-hidden focus-within:border-orange-500 focus-within:bg-white transition-all`}
                  >
                    <div className="bg-gray-100/90 text-gray-700 font-bold px-3.5 py-3 border-r border-gray-200 flex items-center gap-1.5 select-none">
                      <span className="text-sm">🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      id="input-phone-number"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      autoFocus
                      required
                      placeholder="94401 23456"
                      value={phone}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(cleaned);
                        if (phoneError) setPhoneError(null);
                      }}
                      className="flex-1 p-3 bg-transparent font-bold text-gray-900 tracking-wider text-sm focus:outline-none placeholder:text-gray-400 placeholder:font-normal placeholder:tracking-normal"
                    />
                  </div>
                  {phoneError ? (
                    <p className="text-[11px] text-red-600 font-medium mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {phoneError}
                    </p>
                  ) : (
                    <p className="text-[11px] text-gray-500 mt-1.5">
                      Enter your 10-digit mobile number. We'll send a 6-digit verification code.
                    </p>
                  )}
                </div>

                <Button
                  id="btn-send-otp"
                  variant="primary"
                  size="lg"
                  type="submit"
                  isLoading={isSendingOtp}
                  disabled={phone.length < 10 || isSendingOtp}
                  className="w-full shadow-md shadow-orange-500/20"
                >
                  Send Verification OTP
                </Button>
              </form>
            ) : (
              // Step 2: 6-digit OTP verification
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-gray-700 font-bold">
                      Enter 6-Digit Code sent to:
                    </span>
                    <button
                      type="button"
                      id="btn-change-phone"
                      onClick={handleResetPhone}
                      className="text-orange-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Change
                    </button>
                  </div>

                  <div className="p-2.5 bg-orange-50/50 border border-orange-100 rounded-2xl mb-3 flex items-center justify-between">
                    <span className="font-extrabold text-orange-950 text-xs tracking-wider">
                      +91 {phone.slice(0, 5)} {phone.slice(5)}
                    </span>
                    <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                      SMS Sent
                    </span>
                  </div>

                  <input
                    id="input-otp-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    required
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(clean);
                      if (otpError) setOtpError(null);
                    }}
                    className={`w-full p-3.5 text-center tracking-[0.4em] text-xl font-black bg-gray-50 border ${
                      otpError ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                    } rounded-2xl focus:border-orange-500 focus:bg-white focus:outline-none transition-all placeholder:tracking-widest`}
                  />

                  {otpError && (
                    <p className="text-[11px] text-red-600 font-medium mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {otpError}
                    </p>
                  )}

                  {/* Resend Timer & Action */}
                  <div className="flex justify-between items-center text-[11px] text-gray-500 mt-2">
                    {!isSupabaseConfigured && (
                      <span className="text-amber-700 font-semibold text-[10px]">
                        Demo code: <strong>123456</strong>
                      </span>
                    )}
                    <div className="ml-auto">
                      {countdown > 0 ? (
                        <span className="text-gray-400 font-medium">
                          Resend OTP in <strong className="text-gray-700">{countdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          id="btn-resend-otp"
                          onClick={() => handleSendPhoneOtp()}
                          disabled={isSendingOtp}
                          className="text-orange-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                          Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  id="btn-verify-otp"
                  variant="primary"
                  size="lg"
                  type="submit"
                  isLoading={isVerifyingOtp}
                  disabled={otp.length < 4 || isVerifyingOtp}
                  className="w-full shadow-md shadow-orange-500/20"
                >
                  Verify &amp; Continue
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  type="button"
                  onClick={() => {
                    handleResetPhone();
                    setAuthMethod('email');
                  }}
                  className="w-full text-xs"
                >
                  Use Email &amp; Password Instead
                </Button>
              </form>
            )}
          </div>
        )}

        {/* ── Email & Password Flow ──────────────────────────────────────── */}
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
              id="btn-login-email"
              variant="primary"
              size="lg"
              type="submit"
              isLoading={isEmailLoading}
              className="w-full shadow-md shadow-orange-500/20"
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
