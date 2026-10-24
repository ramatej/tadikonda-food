import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { UtensilsCrossed } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Which roles are allowed. If omitted any authenticated user may access.
   */
  allowedRoles?: UserRole[];
  /**
   * Where to send an authenticated user whose role is not allowed.
   * Defaults to the user's own role destination.
   */
  forbiddenRedirect?: string;
}

/**
 * Wraps a route element and enforces:
 *  1. User must be authenticated (else → /login with `from` state)
 *  2. User's role must be in allowedRoles (else → forbiddenRedirect or own dashboard)
 *
 * Shows a loading screen while the auth session is being restored so the
 * user never briefly sees the wrong dashboard or a flash-redirect.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  forbiddenRedirect,
}) => {
  const { user, isAuthLoading, getRoleDestination } = useAuth();
  const location = useLocation();

  // ── Loading screen while session is restoring ──────────────────────────
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 animate-pulse">
          <UtensilsCrossed className="w-7 h-7" />
        </div>
        <p className="text-sm font-semibold text-gray-500 animate-pulse">Loading…</p>
      </div>
    );
  }

  // ── Not authenticated → redirect to login ──────────────────────────────
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── Role check ─────────────────────────────────────────────────────────
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect the authenticated user to their own dashboard (or explicit override)
    let destination = forbiddenRedirect ?? getRoleDestination();
    // Prevent infinite redirect loops if destination equals the attempted path
    if (destination === location.pathname) {
      destination = '/';
    }
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};
