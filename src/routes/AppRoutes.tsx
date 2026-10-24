import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Public pages
import { HomePage } from '../pages/public/HomePage';
import { RestaurantsPage } from '../pages/public/RestaurantsPage';
import { RestaurantDetailPage } from '../pages/public/RestaurantDetailPage';
import { SearchPage } from '../pages/public/SearchPage';

// Customer pages
import { CartPage } from '../pages/customer/CartPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { OrderTrackingPage } from '../pages/customer/OrderTrackingPage';
import { OrderHistoryPage } from '../pages/customer/OrderHistoryPage';
import { ProfilePage } from '../pages/customer/ProfilePage';
import { AddressesPage } from '../pages/customer/AddressesPage';
import { OffersPage } from '../pages/customer/OffersPage';

// Restaurant pages
import { RestaurantDashboardPage } from '../pages/restaurant/RestaurantDashboardPage';
import { RestaurantRegistrationPage } from '../pages/restaurant/RestaurantRegistrationPage';

// Delivery pages
import { DeliveryDashboardPage } from '../pages/delivery/DeliveryDashboardPage';

// Admin pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

// Auth pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';

// Error pages
import { NotFoundPage } from '../pages/errors/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* ── Public & Customer-accessible routes ─────────────────────── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/offers" element={<OffersPage />} />

        {/* ── Authenticated customer routes ─────────────────────────── */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <OrderTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addresses"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <AddressesPage />
            </ProtectedRoute>
          }
        />

        {/* ── Restaurant owner routes ───────────────────────────────── */}
        <Route
          path="/restaurant/dashboard"
          element={
            <ProtectedRoute allowedRoles={['restaurant_owner']}>
              <RestaurantDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/register"
          element={
            <ProtectedRoute allowedRoles={['restaurant_owner']}>
              <RestaurantRegistrationPage />
            </ProtectedRoute>
          }
        />

        {/* ── Delivery partner routes ───────────────────────────────── */}
        <Route
          path="/delivery/dashboard"
          element={
            <ProtectedRoute allowedRoles={['delivery_partner']}>
              <DeliveryDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/register"
          element={
            <ProtectedRoute allowedRoles={['delivery_partner']}>
              <DeliveryDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* ── Admin platform portal ─────────────────────────────────── */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* ── Authentication flows ──────────────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* ── 404 Catch-all ─────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
