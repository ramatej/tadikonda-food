import React from 'react';
import { MenuItem } from '../../types';
import { VegBadge } from '../ui/Badge';
import { useCart } from '../../context/CartContext';
import { Plus, Minus, Star } from 'lucide-react';

interface FoodItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onSelect }) => {
  const { cart, addItem, updateQuantity } = useCart();
  const cartItem = cart.items.find((i) => i.menuItemId === item.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4 cursor-pointer group"
    >
      {/* Left Info Column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <VegBadge isVeg={item.isVeg} />
          {item.isBestseller && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              Bestseller
            </span>
          )}
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>{item.rating.toFixed(1)}</span>
          </div>
        </div>

        <h4 className="font-bold text-gray-900 text-sm sm:text-base group-hover:text-orange-600 transition-colors truncate">
          {item.name}
        </h4>

        <div className="flex items-center gap-2 my-1">
          <span className="font-extrabold text-sm sm:text-base text-gray-900">
            ₹{item.price}
          </span>
          {item.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{item.originalPrice}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Right Image & Add Button Column */}
      <div className="relative shrink-0 flex flex-col items-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Floating Add / Quantity Stepper Button */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute -bottom-2 bg-white rounded-full shadow-md border border-gray-200 p-0.5"
        >
          {quantity === 0 ? (
            <button
              onClick={() => addItem(item, 1)}
              className="text-xs font-bold text-orange-600 hover:text-white hover:bg-orange-600 px-4 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-sm uppercase tracking-wider"
              aria-label={`Add ${item.name} to cart`}
            >
              <span>Add</span>
              <Plus className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2 px-1 py-0.5">
              <button
                onClick={() => updateQuantity(cartItem!.id, quantity - 1)}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-black text-gray-900 w-4 text-center">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(cartItem!.id, quantity + 1)}
                className="w-6 h-6 rounded-full bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
