import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  ChevronDown,
  ShoppingBag,
  Search,
  SlidersHorizontal,
  UtensilsCrossed,
  User as UserIcon,
  Clock,
  Shield,
  Bike,
  Utensils,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Modal } from '../ui/Modal';
import { TADIKONDA_LOCALITIES, APP_CONFIG } from '../../config/constants';

interface HeaderProps {
  onOpenFilter?: () => void;
  showSearchBar?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFilter, showSearchBar = false }) => {
  const { user, role, selectedLocation, setSelectedLocation } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="bg-white sticky top-7 z-40 shadow-sm border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Left: Brand Logo & Desktop Navigation */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                  <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900 group-hover:text-orange-600 transition-colors">
                    Tadikonda<span className="text-orange-600">Food</span>
                  </span>
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {APP_CONFIG.district}
                  </span>
                </div>
              </Link>

              {/* Desktop Location Selector */}
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden md:flex items-center gap-2 text-left px-3 py-1.5 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                    Location
                    <ChevronDown className="w-3 h-3 text-gray-500 group-hover:translate-y-0.5 transition-transform" />
                  </div>
                  <div className="text-xs font-bold text-gray-900 max-w-[160px] truncate">
                    {selectedLocation}
                  </div>
                </div>
              </button>
            </div>

            {/* Middle: Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dishes, restaurants or tiffins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 hover:bg-gray-50 focus:bg-white text-sm text-gray-900 pl-11 pr-24 py-2.5 rounded-full border border-transparent focus:border-orange-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={onOpenFilter}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Filter</span>
                </button>
              </form>
            </div>

            {/* Right: Actions (Cart, Role dashboard, Profile) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Role specific quick dashboard links */}
              {role === 'restaurant_owner' && (
                <Link
                  to="/restaurant/dashboard"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-2xl border border-orange-200 transition-colors"
                >
                  <Utensils className="w-3.5 h-3.5 text-orange-600" />
                  <span>Restaurant Dashboard</span>
                </Link>
              )}
              {role === 'delivery_partner' && (
                <Link
                  to="/delivery/dashboard"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-2xl border border-orange-200 transition-colors"
                >
                  <Bike className="w-3.5 h-3.5 text-orange-600" />
                  <span>Delivery Panel</span>
                </Link>
              )}
              {role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-2xl border border-orange-200 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-orange-600" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {/* Order history shortcut */}
              <Link
                to="/orders"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-orange-600 p-2 sm:px-3 sm:py-2 rounded-2xl hover:bg-gray-100 transition-colors"
                title="Order history & active orders"
              >
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="hidden md:inline">Orders</span>
              </Link>

              {/* Cart Button: Exactly matches screenshot round black button with orange count badge */}
              <Link
                to="/cart"
                className="relative p-2.5 sm:p-3 rounded-full bg-gray-950 hover:bg-gray-800 text-white shadow-md transition-transform active:scale-95 flex items-center justify-center group"
                aria-label={`Cart with ${cartItemCount} items`}
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User Profile or Sign In */}
              {user ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl hover:bg-gray-100 transition-colors text-gray-800"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                  <span className="hidden xl:inline text-xs font-bold max-w-[100px] truncate">
                    {user.name}
                  </span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-2xl transition-colors shadow-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Top Header (Location bar matching Screenshot 1 top header) */}
          <div className="flex md:hidden items-center justify-between py-2 border-t border-gray-100">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 text-left text-xs font-semibold text-gray-800 hover:text-orange-600 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <div className="flex items-center gap-1">
                <span className="text-gray-500 font-normal">Location:</span>
                <span className="font-bold text-gray-900 truncate max-w-[200px]">
                  {selectedLocation}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
            </button>
            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Delivering Now
            </span>
          </div>

          {/* Mobile Search & Filter Row (Matching Screenshot 1 search row) */}
          {showSearchBar && (
            <div className="pb-3 lg:hidden">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search dishes or restaurants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 text-sm text-gray-900 pl-11 pr-4 py-2.5 rounded-full border border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
                {onOpenFilter && (
                  <button
                    type="button"
                    onClick={onOpenFilter}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 transition-colors shadow-md shadow-orange-500/20 shrink-0"
                  >
                    <span>Filter</span>
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Location Picker Modal */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title="Choose Delivery Location in Tadikonda"
        maxWidth="md"
      >
        <p className="text-xs text-gray-500 mb-4">
          Select your street or landmark in Tadikonda village, Guntur district for accurate delivery time and restaurant availability.
        </p>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {TADIKONDA_LOCALITIES.map((loc) => {
            const isSelected = selectedLocation === loc;
            return (
              <button
                key={loc}
                onClick={() => {
                  setSelectedLocation(loc);
                  setIsLocationModalOpen(false);
                }}
                className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-orange-50 border-2 border-orange-500 text-orange-950 font-bold'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{loc}</div>
                    <div className="text-[11px] text-gray-500">Tadikonda, Guntur Dist - 522236</div>
                  </div>
                </div>
                {isSelected && (
                  <span className="text-xs bg-orange-600 text-white font-bold px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
};
