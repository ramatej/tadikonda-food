import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { User, UserRole, PublicRegistrationRole, ROLE_DESTINATIONS } from '../types';
import { supabaseAuthService } from '../services/supabase/supabaseAuthService';
import { supabase, isSupabaseConfigured } from '../services/supabase/client';
// Vite dev flag – true only when running `npm run dev`
const isDev = import.meta.env.DEV;
import { authService as mockAuthService } from '../services/mock';
import { TADIKONDA_LOCALITIES } from '../config/constants';
import { useToast } from './ToastContext';
import type { AuthResult } from '../services/interfaces';

interface AuthContextType {
  /** Null means not yet resolved or unauthenticated */
  user: User | null;
  role: UserRole | null;
  isAuthLoading: boolean;
  selectedLocation: string;
  setSelectedLocation: (loc: string) => void;
  loginWithEmail: (email: string, pass: string) => Promise<AuthResult>;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<AuthResult>;
  register: (
    name: string,
    email: string,
    phone: string,
    role: PublicRegistrationRole,
    password: string
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  /** Returns the correct dashboard path for the current user's role */
  getRoleDestination: () => string;
  /** Demo-only: switch role without real auth (falls back to mock) */
  switchRole?: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string>(TADIKONDA_LOCALITIES[0]);
  const { showToast } = useToast();
  const isMounted = useRef(true);

  // ── Session restoration on mount ──────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;

    if (!isSupabaseConfigured) {
      // No Supabase configured: keep mock session for demo mode
      mockAuthService.getCurrentUser().then((u) => {
        if (isMounted.current) {
          setUser(u);
          setIsAuthLoading(false);
        }
      });
      return;
    }

    // Restore existing session synchronously then set up listener
    supabaseAuthService.getCurrentUser().then((u) => {
      if (isMounted.current) {
        setUser(u);
        setIsAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted.current) return;

      if (event === 'SIGNED_OUT' || !session) {
        try {
          localStorage.removeItem('tkd_food_cart_v1');
        } catch {}
        setUser(null);
        setIsAuthLoading(false);
        return;
      }

      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        // Re-fetch profile with trusted role from DB
        const resolvedUser = await supabaseAuthService.getCurrentUser();
        if (isMounted.current) {
          setUser(resolvedUser);
          setIsAuthLoading(false);
        }
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth operations ───────────────────────────────────────────────────────
  const loginWithEmail = useCallback(async (email: string, pass: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      if (isDev) {
        // Demo fallback (mock) – only in development
        const result = await mockAuthService.loginWithEmail(email, pass);
        if (result.user) {
          setUser(result.user);
        }
        return result;
      }
      // Production: Supabase not configured -> clear error
      throw new Error('Supabase authentication is not configured for this environment.');
    }
    const result = await supabaseAuthService.loginWithEmail(email, pass);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const sendPhoneOtp = useCallback(async (phone: string): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured) {
      if (isDev) {
        // Demo mock OTP – development only
        return mockAuthService.sendPhoneOtp(phone);
      }
      throw new Error('Supabase authentication is not configured for this environment.');
    }
    return supabaseAuthService.sendPhoneOtp(phone);
  }, []);

  const verifyPhoneOtp = useCallback(async (phone: string, token: string): Promise<AuthResult> => {
    if (!isSupabaseConfigured) {
      if (isDev) {
        const result = await mockAuthService.verifyPhoneOtp(phone, token);
        if (result.user) {
          setUser(result.user);
        }
        return result;
      }
      throw new Error('Supabase authentication is not configured for this environment.');
    }
    const result = await supabaseAuthService.verifyPhoneOtp(phone, token);
    if (result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      phone: string,
      role: PublicRegistrationRole,
      password: string
    ): Promise<AuthResult> => {
      if (!isSupabaseConfigured) {
        if (isDev) {
          const result = await mockAuthService.register(name, email, phone, role, password);
          if (result.user) {
            setUser(result.user);
          }
          return result;
        }
        throw new Error('Supabase authentication is not configured for this environment.');
      }
      const result = await supabaseAuthService.register(name, email, phone, role, password);
      if (result.user) {
        setUser(result.user);
      }
      return result;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('tkd_food_cart_v1');
    } catch {}
    if (!isSupabaseConfigured) {
      if (isDev) {
        await mockAuthService.logout();
        setUser(null);
        showToast('Logged out successfully', 'info');
        return;
      }
      throw new Error('Supabase authentication is not configured for this environment.');
    }
    await supabaseAuthService.logout();
    setUser(null);
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      return { success: true, message: 'Demo: reset link would be sent to ' + email };
    }
    return supabaseAuthService.resetPassword(email);
  }, []);

  const getRoleDestination = useCallback(() => {
    if (!user) return '/login';
    return ROLE_DESTINATIONS[user.role] || '/';
  }, [user]);

  // Demo-only switchRole (kept for mock environments only)
  const switchRole = useCallback(
    async (newRole: UserRole) => {
      if (isSupabaseConfigured) {
        showToast('Role switching is disabled in production mode', 'error');
        return;
      }
      const updated = await mockAuthService.switchRole(newRole);
      setUser(updated);
      showToast(
        `Switched active view to ${newRole.replace('_', ' ').toUpperCase()} (Demo Mode)`,
        'info'
      );
    },
    [showToast]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthLoading,
        selectedLocation,
        setSelectedLocation,
        loginWithEmail,
        sendPhoneOtp,
        verifyPhoneOtp,
        register,
        logout,
        resetPassword,
        getRoleDestination,
        switchRole: isSupabaseConfigured ? undefined : switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
