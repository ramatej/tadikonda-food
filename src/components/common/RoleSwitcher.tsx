import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Shield, Utensils, Bike, User as UserIcon, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { mockStorage } from '../../services/mock/mockStorage';
import { useToast } from '../../context/ToastContext';

export const RoleSwitcher: React.FC = () => {
  const { role, user, switchRole } = useAuth();
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!switchRole) {
    return null;
  }

  const roles: { role: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      role: 'customer',
      label: 'Customer',
      icon: <UserIcon className="w-4 h-4" />,
      desc: 'Browse, Cart, Order, Track',
    },
    {
      role: 'restaurant_owner',
      label: 'Restaurant Owner',
      icon: <Utensils className="w-4 h-4" />,
      desc: 'Menu, Accept orders, Cook',
    },
    {
      role: 'delivery_partner',
      label: 'Delivery Partner',
      icon: <Bike className="w-4 h-4" />,
      desc: 'Online toggle, Deliveries',
    },
    {
      role: 'admin',
      label: 'Platform Admin',
      icon: <Shield className="w-4 h-4" />,
      desc: 'Approve shops, Settings',
    },
  ];

  const handleResetData = () => {
    mockStorage.resetToDefaults();
    showToast('Demo data reset to default seed state', 'info');
    window.location.reload();
  };

  return (
    <aside aria-label="Demo role selector" className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white text-xs py-1.5 px-4 sticky top-0 z-50 shadow-md border-b border-gray-700/60">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
            Demo Prototype
          </span>
          <span className="text-gray-300 hidden sm:inline">
            Active: <strong className="text-white capitalize">{user?.name || 'Guest'}</strong> ({role ? role.replace('_', ' ') : 'Guest'})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="hidden md:flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/10">
            {roles.map((r) => {
              const isActive = role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => switchRole(r.role)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-sm font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  title={r.desc}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden flex items-center gap-1 bg-orange-600 text-white px-2 py-1 rounded-lg font-semibold"
          >
            <span>Role: {role ? role.replace('_', ' ') : 'Guest'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1 text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors ml-1"
            title="Reset demo data to initial state"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>
        </div>
      </div>

      {/* Mobile expanded dropdown */}
      {isExpanded && (
        <div className="md:hidden mt-2 pt-2 border-t border-gray-700/80 grid grid-cols-2 gap-1.5 animate-fade-in">
          {roles.map((r) => (
            <button
              key={r.role}
              onClick={() => {
                switchRole(r.role);
                setIsExpanded(false);
              }}
              className={`flex items-center gap-2 p-2 rounded-xl text-left font-medium ${
                role === r.role ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-200'
              }`}
            >
              {r.icon}
              <div>
                <div className="font-semibold text-xs">{r.label}</div>
                <div className="text-[10px] text-gray-400 opacity-80">{r.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
};
