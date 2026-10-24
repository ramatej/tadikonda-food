import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TADIKONDA_LOCALITIES } from '../../config/constants';
import { Button } from '../../components/ui/Button';
import { Store, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const RestaurantRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [shopName, setShopName] = useState('');
  const [tagline, setTagline] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('+91 9');
  const [locationArea, setLocationArea] = useState(TADIKONDA_LOCALITIES[0]);
  const [fullAddress, setFullAddress] = useState('');
  const [cuisineInput, setCuisineInput] = useState('Tiffins, South Indian');
  const [priceForTwo, setPriceForTwo] = useState('180');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !phone || !fullAddress) return;

    setIsSubmitting(true);
    try {
      await restaurantService.registerRestaurant({
        name: shopName,
        tagline: tagline || 'Authentic Tadikonda Flavors',
        cuisine: cuisineInput.split(',').map((c) => c.trim()),
        deliveryTimeMinutes: 20,
        priceForTwo: Number(priceForTwo) || 180,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        coverImageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
        locationArea,
        fullAddress: `${fullAddress}, Tadikonda - 522236`,
        isOpen: false,
        ownerId: user?.id || '',
        phone,
        featured: false,
      });

      setIsSubmitted(true);
      showToast('Restaurant registration submitted for admin approval!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit registration';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-gray-950">Registration Submitted!</h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          Your restaurant application for <strong className="text-gray-900">{shopName}</strong> has been received and is currently in <strong>pending approval</strong> status.
        </p>
        <p className="text-[11px] text-gray-400">
          Our administrators will review your shop details shortly. You can monitor your application status directly from your kitchen dashboard.
        </p>
        <div className="pt-2">
          <Button variant="primary" size="md" onClick={() => navigate('/restaurant/dashboard')}>
            Go to Kitchen Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-24 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
            Register Your Restaurant / Food Shop
          </h1>
          <p className="text-xs text-gray-500">
            Partner with Tadikonda Food to reach hungry customers across the village
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-bold mb-1">Restaurant / Shop Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sri Balaji Tiffin Center"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Shop Specialty / Tagline</label>
            <input
              type="text"
              placeholder="e.g. Best Karam Dosa & Hot Pesarattu in Main Bazar"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Owner Name</label>
              <input
                type="text"
                required
                placeholder="e.g. M. Rama Krishna"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Contact Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+91 94401 23456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Tadikonda Locality Area</label>
            <select
              value={locationArea}
              onChange={(e) => setLocationArea(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-semibold"
            >
              {TADIKONDA_LOCALITIES.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Exact Street Address</label>
            <input
              type="text"
              required
              placeholder="e.g. Near Bus Stand, Opp. Sivalayam Street"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1">Cuisines (Comma separated)</label>
              <input
                type="text"
                placeholder="Tiffins, South Indian, Fast Food"
                value={cuisineInput}
                onChange={(e) => setCuisineInput(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">Average Cost for Two (₹)</label>
              <input
                type="number"
                placeholder="180"
                value={priceForTwo}
                onChange={(e) => setPriceForTwo(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-semibold"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button variant="primary" size="lg" type="submit" className="w-full">
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
