import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Receipt, CreditCard, User } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';

export const MobileNav: React.FC = () => {
  const { activeOrder } = useOrders();

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true },
    {
      to: '/orders',
      label: 'Orders',
      icon: Receipt,
      badge: activeOrder ? '1' : undefined,
    },
    { to: '/offers', label: 'Offers', icon: CreditCard },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-2xl relative transition-all ${
                isActive
                  ? 'text-orange-600 font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-600 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                    }`}
                  />
                  {item.badge && (
                    <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
