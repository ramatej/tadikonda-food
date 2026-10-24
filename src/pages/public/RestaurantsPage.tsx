import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Restaurant } from '../../types';
import { restaurantService } from '../../services';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { FOOD_CATEGORIES } from '../../config/constants';
import { FoodCategory } from '../../types';

export const RestaurantsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [isTopRated, setIsTopRated] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'deliveryTime' | 'price'>('relevance');

  useEffect(() => {
    restaurantService.getAllRestaurants().then(setRestaurants);
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    if (slug === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      // Only approved or active restaurants may be publicly listed
      if (r.status !== 'active' && r.status !== 'approved') return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCuisine = r.cuisine.some((c) => c.toLowerCase().includes(q));
        const matchesLocation = r.locationArea.toLowerCase().includes(q);
        if (!matchesName && !matchesCuisine && !matchesLocation) return false;
      }

      // Rating 4.5+
      if (isTopRated && r.rating < 4.7) return false;

      // Veg only
      if (isVegOnly && !r.cuisine.some((c) => c.toLowerCase().includes('south indian') || c.toLowerCase().includes('tiffin') || c.toLowerCase().includes('veg'))) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'deliveryTime') return a.deliveryTimeMinutes - b.deliveryTimeMinutes;
      if (sortBy === 'price') return a.priceForTwo - b.priceForTwo;
      return 0;
    });
  }, [restaurants, searchTerm, isVegOnly, isTopRated, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setIsVegOnly(false);
    setIsTopRated(false);
    setSortBy('relevance');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || isVegOnly || isTopRated || sortBy !== 'relevance';

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            All Restaurants in Tadikonda
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Discover local breakfast joints, spicy biryani spots, and sweet bakeries
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by restaurant or cuisine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white text-sm pl-11 pr-4 py-2.5 rounded-full border border-gray-200 focus:border-orange-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Filter Chips & Sorting Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {FOOD_CATEGORIES.map((cat: FoodCategory) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`text-xs font-bold px-4 py-2 rounded-full shrink-0 transition-all ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Toggle Filters & Sort Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsVegOnly(!isVegOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isVegOnly
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              <span>Veg Only</span>
            </button>

            <button
              onClick={() => setIsTopRated(!isTopRated)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isTopRated
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>★ 4.7+ Rated</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-orange-600 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-100 font-bold text-gray-800 rounded-xl px-2.5 py-1.5 focus:outline-none border-none text-xs"
            >
              <option value="relevance">Relevance</option>
              <option value="rating">Rating: High to Low</option>
              <option value="deliveryTime">Delivery Time: Fastest</option>
              <option value="price">Cost: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Restaurant List Grid */}
      {filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-2xl font-bold">
            🍽️
          </div>
          <h3 className="font-extrabold text-lg text-gray-900">No restaurants match your filters</h3>
          <p className="text-xs text-gray-500">
            Try resetting your search filters or browse other popular categories in Tadikonda.
          </p>
          <Button variant="primary" size="md" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};
