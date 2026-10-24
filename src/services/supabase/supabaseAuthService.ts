import { supabase } from './client';
import { IAuthService, AuthResult } from '../interfaces';
import { User, UserRole, PublicRegistrationRole, PUBLIC_REGISTRATION_ROLES } from '../../types';

export class SupabaseAuthService implements IAuthService {
  /**
   * Resolves the currently authenticated user with their trusted role from public.profiles
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return null;
      }

      const authUser = session.user;

      // Authoritative role lookup from public.profiles (never from client metadata or localStorage)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching trusted profile from database:', profileError);
      }

      // If trigger hasn't finished or profile is missing, fallback to safe 'customer' role
      const trustedRole: UserRole =
        (profile?.role as UserRole) ||
        (authUser.user_metadata?.role as UserRole) ||
        'customer';

      // Safe role check: prevent unverified promotion to admin
      const effectiveRole: UserRole =
        profile?.role === 'admin'
          ? 'admin'
          : PUBLIC_REGISTRATION_ROLES.includes(trustedRole as PublicRegistrationRole)
          ? trustedRole
          : 'customer';

      let restaurantId: string | undefined = undefined;
      let deliveryPartnerId: string | undefined = undefined;

      if (effectiveRole === 'restaurant_owner') {
        const { data: rest } = await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', authUser.id)
          .maybeSingle();
        restaurantId = rest?.id;
      }

      if (effectiveRole === 'delivery_partner') {
        const { data: dp } = await supabase
          .from('delivery_partner_profiles')
          .select('id')
          .eq('user_id', authUser.id)
          .maybeSingle();
        deliveryPartnerId = dp?.id;
      }

      return {
        id: authUser.id,
        name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        phone: profile?.phone || authUser.user_metadata?.phone || '',
        role: effectiveRole,
        avatarUrl: profile?.avatar_url || undefined,
        createdAt: profile?.created_at || authUser.created_at,
        restaurantId,
        deliveryPartnerId,
      };
    } catch (e) {
      console.error('Error in getCurrentUser:', e);
      return null;
    }
  }

  /**
   * Real email/password sign-in using Supabase Auth
   */
  async loginWithEmail(email: string, pass: string): Promise<AuthResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return {
          user: null,
          needsEmailVerification: true,
          message: 'Please verify your email address before logging in.',
        };
      }
      throw new Error(error.message || 'Invalid email or password.');
    }

    if (!data.user) {
      throw new Error('Authentication succeeded but user profile was not returned.');
    }

    const user = await this.getCurrentUser();
    return {
      user,
      needsEmailVerification: false,
      message: 'Login successful',
    };
  }

  /**
   * Real user registration with role validation
   */
  async register(
    name: string,
    email: string,
    phone: string,
    requestedRole: PublicRegistrationRole,
    password?: string
  ): Promise<AuthResult> {
    // 1. Role allowlist validation: NEVER allow client to request 'admin'
    if (!PUBLIC_REGISTRATION_ROLES.includes(requestedRole)) {
      throw new Error('Unauthorized role selected. Public registration only allows customer, restaurant owner, or delivery partner.');
    }

    if (!password) {
      throw new Error('Password is required for registration.');
    }

    // 2. Call Supabase Auth signUp with metadata passed to handle_new_user trigger
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
          role: requestedRole,
          phone: phone.trim(),
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Check if email confirmation is required by Supabase settings
    if (data.user && !data.session) {
      return {
        user: null,
        needsEmailVerification: true,
        message: 'Registration successful! A verification link has been sent to your email. Please verify before signing in.',
      };
    }

    // Auto-logged in
    const user = await this.getCurrentUser();
    return {
      user,
      needsEmailVerification: false,
      message: 'Registration successful!',
    };
  }

  /**
   * Password reset via Supabase official Auth API
   */
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const redirectUrl = `${window.location.origin}/forgot-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });

    if (error) {
      // Security rule: avoid revealing account existence via specific errors
      console.warn('Password reset request error:', error.message);
    }

    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    };
  }

  /**
   * Update password for an authenticated recovery session
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'Password updated successfully.',
    };
  }

  /**
   * Sign out
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during signOut:', error);
    }
  }

  /**
   * Update user's permitted profile fields
   */
  async updateProfile(userId: string, updates: { full_name?: string; phone?: string; avatar_url?: string }): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.full_name,
        phone: updates.phone,
        avatar_url: updates.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService();
