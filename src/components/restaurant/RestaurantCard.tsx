import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Restaurant } from '../../types';
import { RatingBadge } from '../ui/Badge';
import { Heart, Clock, ArrowUpRight } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleCardClick = () => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/80 cursor-pointer flex flex-col relative"
    >
      {/* Food Cover Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top-Left Rating Glass Badge (Screenshot 1: 4.7 (2.3k)) */}
        <div className="absolute top-3 left-3">
          <RatingBadge rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
        </div>

        {/* Top-Right Favorite Button (Screenshot 1: White circle with heart) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center transition-transform active:scale-90 hover:scale-110"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Closed or status banner if applicable */}
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              Currently Closed
            </span>
          </div>
        )}
      </div>

      {/* Card Info Section (Screenshot 1: Name, time, easy, orange round arrow button) */}
      <div className="p-4 flex items-center justify-between gap-3 bg-white">
        <div className="min-w-0 flex-1">
          <h3 className="font-extrabold text-gray-950 text-base group-hover:text-orange-600 transition-colors truncate">
            {restaurant.name}
          </h3>

          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {restaurant.deliveryTimeMinutes} min
            </span>
            <span>•</span>
            <span className="font-medium truncate">{restaurant.locationArea}</span>
            <span>•</span>
            <span className="text-gray-400 truncate">₹{restaurant.priceForTwo} for two</span>
          </div>
        </div>

        {/* Orange Circular Action Button with Arrow ↗ (Screenshot 1 style) */}
        <div
          className="w-10 h-10 rounded-full bg-orange-600 group-hover:bg-orange-700 text-white flex items-center justify-center shadow-md shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-45 transition-all duration-300 shrink-0"
          aria-hidden="true"
        >
          <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
};
