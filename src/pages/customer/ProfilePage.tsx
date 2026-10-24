import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Receipt,
  LogOut,
  Shield,
  Utensils,
  Bike,
  Sparkles,
  Save,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services';

export const ProfilePage: React.FC = () => {
  const { user, role, switchRole, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Hooks must come before any conditional return
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [isEditing, setIsEditing] = useState(false);

  // ProtectedRoute guarantees user is non-null here
  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (authService.updateProfile) {
        await authService.updateProfile(user.id, {
          full_name: name.trim(),
          phone: phone.trim(),
        });
      }
      user.name = name.trim();
      user.phone = phone.trim();
      setIsEditing(false);
      showToast('Profile information updated successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      showToast(msg, 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">Your Account</h1>
        <span className="text-[11px] font-extrabold uppercase bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
          {user.role.replace('_', ' ')}
        </span>
      </div>

      {/* User Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <img
          src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
          alt={user.name}
          className="w-16 h-16 rounded-full object-cover ring-4 ring-orange-500/20"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black text-gray-950 truncate">{user.name}</h2>
          <p className="text-xs text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-500 font-mono mt-0.5">{user.phone}</p>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Personal Information
          </h3>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-500 font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              disabled={!isEditing}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-600 font-semibold text-gray-900 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-gray-500 font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              disabled={!isEditing}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-600 font-semibold text-gray-900 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-gray-500 font-medium mb-1">Mobile Number</label>
            <input
              type="tel"
              value={phone}
              disabled={!isEditing}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-600 font-semibold text-gray-900 focus:outline-none focus:border-orange-500"
            />
          </div>

          {isEditing && (
            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                type="submit"
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Account Shortcuts */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden text-xs font-bold text-gray-800">
        <Link
          to="/orders"
          className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Receipt className="w-4 h-4 text-orange-600" />
            <span>Order History & Receipts</span>
          </div>
          <span className="text-gray-400">➔</span>
        </Link>

        <Link
          to="/addresses"
          className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>Manage Saved Addresses (Tadikonda)</span>
          </div>
          <span className="text-gray-400">➔</span>
        </Link>

        <Link
          to="/offers"
          className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>Promo Coupons & Discounts</span>
          </div>
          <span className="text-gray-400">➔</span>
        </Link>
      </div>

      {/* Role Switcher Section (Demo Requirement) */}
      {switchRole && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-orange-400">
              Demo Portal Switcher
            </span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
              Current: {role}
            </span>
          </div>
          <p className="text-xs text-gray-300">
            Seamlessly switch between prototype accounts to test all platform roles:
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-bold">
            <button
              onClick={() => switchRole('customer')}
              className={`p-2.5 rounded-2xl flex items-center gap-2 transition-all ${
                role === 'customer' ? 'bg-orange-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Customer</span>
            </button>

            <button
              onClick={() => switchRole('restaurant_owner')}
              className={`p-2.5 rounded-2xl flex items-center gap-2 transition-all ${
                role === 'restaurant_owner' ? 'bg-orange-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Restaurant Owner</span>
            </button>

            <button
              onClick={() => switchRole('delivery_partner')}
              className={`p-2.5 rounded-2xl flex items-center gap-2 transition-all ${
                role === 'delivery_partner' ? 'bg-orange-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>Delivery Partner</span>
            </button>

            <button
              onClick={() => switchRole('admin')}
              className={`p-2.5 rounded-2xl flex items-center gap-2 transition-all ${
                role === 'admin' ? 'bg-orange-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Control</span>
            </button>
          </div>
        </div>
      )}

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full bg-white hover:bg-rose-50 text-rose-600 border border-gray-200 font-bold text-xs py-3 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out</span>
      </button>
    </div>
  );
};
