import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  MessageSquare,
  Phone,
  Bike,
  PackageCheck,
  Plus,
  Minus,
} from 'lucide-react';

interface FoodDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ item, isOpen, onClose }) => {
  const { cart, addItem, updateQuantity } = useCart();
  const { showToast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (!isOpen || !item) return null;

  const cartItem = cart.items.find((i) => i.menuItemId === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: `Check out ${item.name} from ${item.restaurantName} on Tadikonda Food!`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Container Styled Exactly like Screen 2 in Reference Screenshot */}
      <div className="relative w-full max-w-md bg-white sm:rounded-[36px] shadow-2xl overflow-hidden z-10 flex flex-col h-full sm:h-auto sm:max-h-[92vh]">
        
        {/* Top Floating Controls */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <button
            onClick={onClose}
            className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 hover:bg-white active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => {
                setIsFavorite(!isFavorite);
                showToast(isFavorite ? 'Removed from favorites' : 'Saved to favorites', 'info');
              }}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center transition-all hover:bg-white active:scale-95"
              aria-label="Favorite"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
                }`}
              />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-gray-800 hover:bg-white active:scale-95 transition-all"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Food Image Taking Top Section with Rounded Bottom Edge */}
        <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-gray-100 shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Sliding Card Content */}
        <div className="flex-1 overflow-y-auto px-6 pt-5 pb-28 -mt-6 bg-white rounded-t-[32px] relative z-10 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] space-y-5">
          {/* Title & Rating Row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {item.name}
              </h2>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">
                By {item.restaurantName}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full text-amber-900 font-bold text-xs shrink-0 border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Chef / Prep Info Card (Reproducing Screenshot 2 Chef card) */}
          <div className="bg-gray-50/80 p-3.5 rounded-2xl flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Chef"
                className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-500/20"
              />
              <div>
                <div className="text-xs font-bold text-gray-900">K. Sambasiva Rao</div>
                <div className="text-[11px] text-gray-400">Head Chef • ID: TKD-8492</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Opening local kitchen chat...', 'info')}
                className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:border-orange-200 transition-colors"
                title="Message Kitchen"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => showToast('Calling restaurant: +91 98480 11223', 'info')}
                className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:border-orange-200 transition-colors"
                title="Call Kitchen"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description Section with Read More toggle */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Description
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              {isDescriptionExpanded
                ? item.description
                : item.description.length > 120
                ? `${item.description.slice(0, 120)}...`
                : item.description}
              {item.description.length > 120 && (
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-orange-600 font-bold ml-1 hover:underline inline-block focus:outline-none"
                >
                  {isDescriptionExpanded ? 'Read less' : 'Read more'}
                </button>
              )}
            </p>
          </div>

          {/* Delivery Spec Cards (Side-by-side, Screenshot 2 style) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Bike className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-medium">Delivery Time</div>
                <div className="text-xs font-bold text-gray-900">
                  {item.preparationTimeMinutes + 10} min
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <PackageCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-medium">Delivery Type</div>
                <div className="text-xs font-bold text-gray-900">Tadikonda Express</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar (Screen 2: Orange price pill + Add to Cart pill) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-white border-t border-gray-100 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center gap-3">
          {/* Orange Price Badge */}
          <div className="bg-orange-600 text-white font-extrabold text-sm sm:text-base px-5 py-3 rounded-full shadow-md shadow-orange-500/20 shrink-0">
            ₹{item.price.toFixed(2)}
          </div>

          {/* Add to Cart / Quantity Stepper */}
          {quantity === 0 ? (
            <button
              onClick={() => addItem(item, 1)}
              className="flex-1 border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white font-bold py-3 px-6 rounded-full transition-all text-sm shadow-sm active:scale-95 text-center flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-between border-2 border-orange-600 rounded-full px-4 py-2 bg-orange-50">
              <button
                onClick={() => updateQuantity(cartItem!.id, quantity - 1)}
                className="w-8 h-8 rounded-full bg-white text-orange-600 shadow-sm flex items-center justify-center hover:bg-orange-100 active:scale-90 transition-all"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-orange-950 text-sm">{quantity} in Cart</span>
              <button
                onClick={() => updateQuantity(cartItem!.id, quantity + 1)}
                className="w-8 h-8 rounded-full bg-orange-600 text-white shadow-sm flex items-center justify-center hover:bg-orange-700 active:scale-90 transition-all"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
