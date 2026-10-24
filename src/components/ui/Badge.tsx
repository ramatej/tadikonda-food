import React from 'react';
import { Star } from 'lucide-react';

interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  className?: string;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ rating, reviewCount, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold glass-badge text-gray-900 shadow-sm border border-white/60 ${className}`}
    >
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
      <span>{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-gray-500 font-normal">
          ({reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
        </span>
      )}
    </div>
  );
};

export const VegBadge: React.FC<{ isVeg: boolean; className?: string }> = ({ isVeg, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center justify-center w-4 h-4 rounded border ${
        isVeg ? 'border-emerald-600' : 'border-rose-600'
      } bg-white p-0.5 ${className}`}
      title={isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
    >
      <div
        className={`w-2 h-2 rounded-full ${
          isVeg ? 'bg-emerald-600' : 'bg-rose-600'
        }`}
      />
    </div>
  );
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className = '' }) => {
  const getColors = () => {
    switch (status) {
      case 'placed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'confirmed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'preparing':
        return 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse';
      case 'ready_for_pickup':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'out_for_delivery':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getLabel = () => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getColors()} ${className}`}
    >
      {getLabel()}
    </span>
  );
};
