import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Restaurant, MenuItem } from '../../types';
import { restaurantService, menuService } from '../../services';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { FoodItemCard } from '../../components/food/FoodItemCard';
import { FoodDetailModal } from '../../components/food/FoodDetailModal';
import { Search, X, Utensils, Store } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryParam);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    restaurantService.getAllRestaurants().then(setRestaurants);
    menuService.getMenuItems().then(setMenuItems);
  }, []);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  const handleSearchChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      searchParams.set('q', val.trim());
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const popularTags = ['Dosa', 'Biryani', 'Meals', 'Idli', 'Sweets', 'Bajji', 'Natukodi', 'Coffee'];

  const { matchingRestaurants, matchingDishes } = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { matchingRestaurants: [], matchingDishes: [] };

    const matchedRests = restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
        r.locationArea.toLowerCase().includes(q)
    );

    const matchedItems = menuItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );

    return { matchingRestaurants: matchedRests, matchingDishes: matchedItems };
  }, [query, restaurants, menuItems]);

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search dishes, restaurants, or cuisines in Tadikonda..."
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          autoFocus
          className="w-full bg-white text-sm sm:text-base pl-13 pr-12 py-4 rounded-full border border-gray-200 focus:border-orange-500 focus:outline-none shadow-md"
        />
        {query && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Popular suggestions */}
      {!query && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Popular Searches in Tadikonda
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleSearchChange(tag)}
                className="bg-gray-50 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 text-xs font-bold text-gray-700 px-3.5 py-2 rounded-full transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {query && (
        <div className="space-y-8">
          {/* Matching Restaurants */}
          {matchingRestaurants.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-orange-600" />
                <span>Restaurants ({matchingRestaurants.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchingRestaurants.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            </div>
          )}

          {/* Matching Dishes */}
          {matchingDishes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-orange-600" />
                <span>Dishes ({matchingDishes.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingDishes.map((item) => (
                  <FoodItemCard
                    key={item.id}
                    item={item}
                    onSelect={(sel) => setSelectedItem(sel)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty result */}
          {matchingRestaurants.length === 0 && matchingDishes.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto text-2xl font-bold">
                🔍
              </div>
              <h4 className="font-extrabold text-base text-gray-900">
                No results found for "{query}"
              </h4>
              <p className="text-xs text-gray-500">
                Check for typos or try searching for dishes like Biryani, Dosa, Meals or Kaja.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Item Detail Modal */}
      <FoodDetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};
