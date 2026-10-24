import React from 'react';
import { FoodCategory } from '../../types';

interface CategoryListProps {
  categories: FoodCategory[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-1">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.slug;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className="flex flex-col items-center gap-2 group shrink-0 focus:outline-none"
          >
            {/* Circular Category Thumbnail (Screenshot 1: round image chips) */}
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden p-1 transition-all duration-200 ${
                isSelected
                  ? 'ring-4 ring-orange-500 scale-105 shadow-md shadow-orange-500/20'
                  : 'ring-1 ring-gray-200 group-hover:ring-orange-300 group-hover:scale-105'
              }`}
            >
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover rounded-full"
                loading="lazy"
              />
            </div>
            <span
              className={`text-xs font-semibold tracking-tight transition-colors ${
                isSelected ? 'text-orange-600 font-bold' : 'text-gray-700 group-hover:text-gray-900'
              }`}
            >
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
