import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Restaurant, MenuItem, FoodCategory } from '../../types';
import { restaurantService, menuService } from '../../services';
import { FOOD_CATEGORIES } from '../../config/constants';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { CategoryList } from '../../components/restaurant/CategoryList';
import { FoodItemCard } from '../../components/food/FoodItemCard';
import { FoodDetailModal } from '../../components/food/FoodDetailModal';
import {
  Sparkles,
  ArrowRight,
  ChevronRight,
  Flame,
  ShieldCheck,
  Clock,
  Bike,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFoodItem, setSelectedFoodItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    restaurantService.getAllRestaurants().then(setRestaurants);
    menuService.getMenuItems().then(setMenuItems);
  }, []);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    if (slug !== 'all') {
      navigate(`/restaurants?category=${slug}`);
    }
  };

  const publishedRestaurants = restaurants.filter((r) => r.status === 'active' || r.status === 'approved');
  const picksForYou = publishedRestaurants.slice(0, 3);
  const popularDishes = menuItems.filter((i) => i.isBestseller).slice(0, 4);

  return (
    <div className="space-y-8 sm:space-y-10 pb-16">
      
      {/* 1. HERO PROMOTIONAL BANNER (Accurately reproducing Screenshot 1 Orange Banner) */}
      <section aria-label="Hero Promotion" className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/20 p-6 sm:p-10">
        <div className="relative z-10 max-w-xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-white">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tadikonda Express</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight sm:leading-none">
            Gonna Be a Good Day!
          </h1>

          <p className="text-sm sm:text-base text-orange-100 font-medium max-w-md leading-relaxed">
            Free delivery, lower fees, & 10% cashback, pickup! Fresh tiffins and spicy biryanis delivered right to your house.
          </p>

          <div className="pt-2">
            <button
              onClick={() => navigate('/restaurants')}
              className="bg-white text-orange-600 hover:bg-orange-50 active:scale-95 transition-all duration-200 px-7 py-3 rounded-full font-extrabold text-sm sm:text-base shadow-lg shadow-black/10 inline-flex items-center gap-2 group cursor-pointer"
            >
              <span>Order Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Hero Delicious Food Visual (Right Side Imagery, matching screenshot) */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-2/5 overflow-hidden pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
            alt="Delicious food platter"
            className="w-full h-full object-cover object-center transform scale-110 rotate-3 filter drop-shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 via-transparent to-transparent" />
        </div>

        {/* Background decorative circular shapes */}
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </section>

      {/* 2. CATEGORIES SECTION (Matching Screenshot 1 "Categories" with "See All") */}
      <section aria-label="Food Categories" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight">
              Categories
            </h2>
            <p className="text-xs text-gray-500">Explore local flavors of Tadikonda</p>
          </div>
          <Link
            to="/restaurants"
            className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <CategoryList
          categories={FOOD_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
        />
      </section>

      {/* 3. PICKS FOR YOU SECTION (Matching Screenshot 1 "Picks For You" with "See All") */}
      <section aria-label="Picks For You" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight">
              Picks For You
            </h2>
            <span className="bg-orange-100 text-orange-700 text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3 fill-orange-600" />
              Hot Deals
            </span>
          </div>
          <Link
            to="/restaurants"
            className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {picksForYou.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </section>

      {/* 4. POPULAR DISHES IN TADIKONDA */}
      <section aria-label="Popular Dishes" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight">
              Popular Local Dishes
            </h2>
            <p className="text-xs text-gray-500">Most ordered breakfast & dinner items</p>
          </div>
          <Link
            to="/restaurants"
            className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
          >
            <span>View Menu</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularDishes.map((item) => (
            <FoodItemCard
              key={item.id}
              item={item}
              onSelect={(selected) => setSelectedFoodItem(selected)}
            />
          ))}
        </div>
      </section>

      {/* 5. LOCAL SERVICE HIGHLIGHTS (Village delivery features) */}
      <section aria-label="Local Service Features" className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">20-25 Min Delivery</h3>
            <p className="text-xs text-gray-500 mt-0.5">Quick transit anywhere in Tadikonda</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Flat ₹20 Delivery</h3>
            <p className="text-xs text-gray-500 mt-0.5">Fixed rate for all village orders</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Fresh & Hygienic</h3>
            <p className="text-xs text-gray-500 mt-0.5">Cooked fresh by verified local cooks</p>
          </div>
        </div>
      </section>

      {/* Food Details Modal (Reproducing Screen 2 of Reference Screenshot) */}
      <FoodDetailModal
        item={selectedFoodItem}
        isOpen={Boolean(selectedFoodItem)}
        onClose={() => setSelectedFoodItem(null)}
      />
    </div>
  );
};
