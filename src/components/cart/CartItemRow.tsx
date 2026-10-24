import React from 'react';
import { CartItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, Star } from 'lucide-react';
import { VegBadge } from '../ui/Badge';

interface CartItemRowProps {
  item: CartItem;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item }) => {
  const { updateQuantity } = useCart();

  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
      {/* Thumbnail */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title, Subtitle, Price */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <VegBadge isVeg={item.isVeg} />
          <h4 className="font-bold text-gray-900 text-sm truncate">{item.name}</h4>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="truncate">By {item.restaurantName}</span>
          <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
            <Star className="w-3 h-3 fill-amber-500" />
            <span>4.7</span>
          </div>
        </div>
        <div className="font-extrabold text-gray-900 text-sm sm:text-base mt-1">
          ₹{item.price.toFixed(2)}
        </div>
      </div>

      {/* Stepper matching Screenshot 3: Minus, count, Orange Plus button */}
      <div className="flex items-center gap-2 shrink-0 bg-gray-50 p-1 rounded-full border border-gray-200">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-7 h-7 rounded-full bg-white text-gray-700 shadow-sm flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-all"
          aria-label="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs sm:text-sm font-black text-gray-900 w-5 text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-7 h-7 rounded-full bg-orange-600 text-white shadow-sm flex items-center justify-center hover:bg-orange-700 active:scale-90 transition-all"
          aria-label="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
