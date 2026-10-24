import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { APP_CONFIG } from '../../config/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-12 pb-24 md:pb-12 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-800">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Tadikonda<span className="text-orange-500">Food</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Serving the authentic flavors of Guntur district directly to households across Tadikonda village. Fast delivery, fresh food, local love.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Tadikonda, Guntur Dist, Andhra Pradesh - 522236</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/restaurants" className="hover:text-orange-400 transition-colors">
                  All Restaurants & Tiffins
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-orange-400 transition-colors">
                  Search Dishes
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-orange-400 transition-colors">
                  Offers & Vouchers
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-orange-400 transition-colors">
                  Track Active Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Partner with us */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Join Tadikonda Food</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/restaurant/register" className="hover:text-orange-400 transition-colors">
                  Register Your Shop / Restaurant
                </Link>
              </li>
              <li>
                <Link to="/delivery/register" className="hover:text-orange-400 transition-colors">
                  Join as Delivery Partner
                </Link>
              </li>
              <li>
                <Link to="/restaurant/dashboard" className="hover:text-orange-400 transition-colors">
                  Restaurant Owner Portal
                </Link>
              </li>
              <li>
                <Link to="/delivery/dashboard" className="hover:text-orange-400 transition-colors">
                  Delivery Partner Portal
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-orange-400 transition-colors">
                  Admin Control Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Local Support</h4>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-500" />
                <span>{APP_CONFIG.supportPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500" />
                <span>{APP_CONFIG.supportEmail}</span>
              </div>
              <div className="bg-gray-900 p-3 rounded-2xl border border-gray-800 mt-2">
                <span className="text-[11px] font-semibold text-orange-400 block mb-1">
                  Fixed Delivery Charge:
                </span>
                <span className="text-gray-300">
                  Flat ₹20 delivery fee anywhere within Tadikonda limits!
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>
            © {new Date().getFullYear()} Tadikonda Food. Crafted for Tadikonda, Guntur, AP.
          </p>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>for local Andhra businesses</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
