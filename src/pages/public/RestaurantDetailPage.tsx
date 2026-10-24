import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Restaurant, MenuItem } from '../../types';
import { restaurantService, menuService } from '../../services';
import { FoodItemCard } from '../../components/food/FoodItemCard';
import { FoodDetailModal } from '../../components/food/FoodDetailModal';
import { RatingBadge } from '../../components/ui/Badge';
import { useCart } from '../../context/CartContext';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  Bike,
  Sparkles,
} from 'lucide-react';

export const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cart, cartItemCount } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      restaurantService.getRestaurantById(id),
      menuService.getMenuItems(id),
    ]).then(([restData, itemsData]) => {
      setRestaurant(restData);
      setMenuItems(itemsData);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Restaurant Not Found</h2>
        <p className="text-xs text-gray-500">The restaurant you are looking for does not exist or is inactive.</p>
        <button
          onClick={() => navigate('/restaurants')}
          className="bg-orange-600 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md"
        >
          Back to Restaurants
        </button>
      </div>
    );
  }

  // Extract unique categories for this restaurant
  const categories = ['all', ...Array.from(new Set(menuItems.map((i) => i.category)))];

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white px-3.5 py-2 rounded-full border border-gray-200 shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Restaurant Header Banner Card */}
      <div className="bg-white rounded-3xl sm:rounded-[36px] overflow-hidden shadow-sm border border-gray-100">
        <div className="relative h-48 sm:h-64 w-full bg-gray-100">
          <img
            src={restaurant.coverImageUrl || restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-4 right-4">
            <RatingBadge rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                {restaurant.name}
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-orange-600 mt-0.5">
                {restaurant.tagline}
              </p>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Open Now
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>{restaurant.fullAddress}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>{restaurant.deliveryTimeMinutes} mins delivery</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Bike className="w-4 h-4 text-orange-600" />
              <span>Flat ₹20 Delivery Charge</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <Phone className="w-4 h-4 text-orange-600" />
              <span>{restaurant.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Search and Categories Filter */}
      <div className="sticky top-24 z-30 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search dishes in ${restaurant.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 text-xs sm:text-sm pl-11 pr-4 py-2.5 rounded-full border border-transparent focus:border-orange-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        {/* Category horizontal tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold px-4 py-2 rounded-full capitalize shrink-0 transition-all ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {cat === 'all' ? 'Full Menu' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Item Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 capitalize flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>{selectedCategory === 'all' ? 'Recommended Dishes' : selectedCategory}</span>
            <span className="text-xs text-gray-400 font-normal">({filteredItems.length} items)</span>
          </h2>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <FoodItemCard
                key={item.id}
                item={item}
                onSelect={(selected) => setSelectedItem(selected)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm max-w-sm mx-auto">
            <p className="text-xs text-gray-500">No dishes match your search query.</p>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Pill (If items from this or other restaurant exist in cart) */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-20 md:bottom-8 left-4 right-4 z-40 max-w-md mx-auto">
          <Link
            to="/cart"
            className="flex items-center justify-between bg-gray-950 text-white p-3.5 px-6 rounded-full shadow-2xl hover:bg-gray-900 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-black text-xs">
                {cartItemCount}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-gray-300">Items from {cart.restaurantName}</div>
                <div className="text-sm font-extrabold text-white">₹{cart.total.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-bold text-xs bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-full transition-colors">
              <span>View Cart</span>
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      )}

      {/* Food Details Modal (Screen 2) */}
      <FoodDetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};
