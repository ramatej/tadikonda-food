import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { RoleSwitcher } from '../common/RoleSwitcher';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { AlertTriangle, Filter, Check } from 'lucide-react';

export const Layout: React.FC = () => {
  const location = useLocation();
  const { conflictState, resolveConflict } = useCart();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    vegOnly: boolean;
    rating4Plus: boolean;
    fastDelivery: boolean;
  }>({
    vegOnly: false,
    rating4Plus: false,
    fastDelivery: false,
  });

  // Pages that don't need header search bar
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1D1E] antialiased">
      {/* 1. Global Role Switcher for Demo Mode */}
      <RoleSwitcher />

      {/* 2. Top Navigation Bar */}
      <Header
        showSearchBar={isHomePage}
        onOpenFilter={() => setIsFilterModalOpen(true)}
      />

      {/* 3. Main Outlet Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Outlet />
      </main>

      {/* 4. Bottom Mobile Navigation */}
      <MobileNav />

      {/* 5. Footer */}
      <Footer />

      {/* Restaurant Conflict Dialog (Requirement 7) */}
      <Modal
        isOpen={conflictState.isOpen}
        onClose={() => resolveConflict(false)}
        title="Replace items already in cart?"
        maxWidth="sm"
      >
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-gray-700 font-medium mb-2">
            Your cart contains dishes from another restaurant.
          </p>
          <p className="text-xs text-gray-500 mb-6">
            Do you want to discard your previous selection and start a new order from{' '}
            <strong className="text-gray-900">{conflictState.newRestaurantName}</strong>?
          </p>
          <div className="flex items-center gap-3 justify-center">
            <Button
              variant="outline"
              size="md"
              onClick={() => resolveConflict(false)}
            >
              No, Keep Current Cart
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => resolveConflict(true)}
            >
              Yes, Start Fresh
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Results"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="text-xs text-gray-500">
            Refine food and restaurants in Tadikonda based on your preference:
          </div>

          <label className="flex items-center justify-between p-3 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 inline-block" />
              <span className="text-sm font-semibold text-gray-900">Pure Vegetarian Only</span>
            </div>
            <input
              type="checkbox"
              checked={activeFilters.vegOnly}
              onChange={(e) => setActiveFilters({ ...activeFilters, vegOnly: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <span className="text-amber-500 font-bold">★</span>
              <span className="text-sm font-semibold text-gray-900">Top Rated (4.5+ Stars)</span>
            </div>
            <input
              type="checkbox"
              checked={activeFilters.rating4Plus}
              onChange={(e) => setActiveFilters({ ...activeFilters, rating4Plus: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <span className="text-orange-600">⚡</span>
              <span className="text-sm font-semibold text-gray-900">Super Fast Delivery (&lt;20 mins)</span>
            </div>
            <input
              type="checkbox"
              checked={activeFilters.fastDelivery}
              onChange={(e) => setActiveFilters({ ...activeFilters, fastDelivery: e.target.checked })}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
          </label>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveFilters({ vegOnly: false, rating4Plus: false, fastDelivery: false });
                setIsFilterModalOpen(false);
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Check className="w-3.5 h-3.5" />}
              onClick={() => setIsFilterModalOpen(false)}
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
