export const APP_CONFIG = {
  name: 'Tadikonda Food',
  tagline: 'Guntur’s Taste, Delivered Fast to Your Doorstep',
  village: 'Tadikonda',
  district: 'Guntur District',
  state: 'Andhra Pradesh',
  pincode: '522236',
  currency: '₹',
  defaultDeliveryFee: 20, // Mandatory fixed delivery charge of ₹20
  freeDeliveryThreshold: 499,
  defaultDeliveryTimeMinutes: 25,
  supportPhone: '+91 98480 22334',
  supportEmail: 'support@tadikondafood.local',
};

export const TADIKONDA_LOCALITIES = [
  'Main Bazar Center',
  'Near RTC Bus Stand',
  'Ramalayam Temple Road',
  'Agricultural Market Yard',
  'Police Station Road',
  'ZP High School Road',
  'Amaravathi Road Junction',
  'Ponnekallu Road Colony',
  'Sivalayam Street',
  'Panchayat Office Area',
  'Government Hospital Road',
  'Kotta Pet (New Colony)'
];

export const FOOD_CATEGORIES = [
  {
    id: 'cat_all',
    name: 'All Foods',
    slug: 'all',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=160&q=80',
    itemCount: 38
  },
  {
    id: 'cat_tiffins',
    name: 'Tiffins',
    slug: 'tiffins',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=160&q=80',
    itemCount: 12
  },
  {
    id: 'cat_biryani',
    name: 'Biryani',
    slug: 'biryani',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=160&q=80',
    itemCount: 8
  },
  {
    id: 'cat_meals',
    name: 'Andhra Meals',
    slug: 'meals',
    imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=160&q=80',
    itemCount: 6
  },
  {
    id: 'cat_snacks',
    name: 'Snacks & Bajji',
    slug: 'snacks',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=160&q=80',
    itemCount: 9
  },
  {
    id: 'cat_sweets',
    name: 'Sweets',
    slug: 'sweets',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=160&q=80',
    itemCount: 7
  },
  {
    id: 'cat_beverages',
    name: 'Beverages',
    slug: 'beverages',
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=160&q=80',
    itemCount: 5
  }
];

export const DEMO_VOUCHERS = [
  {
    code: 'TADIKONDA50',
    discountAmount: 50,
    minimumOrder: 199,
    description: 'Flat ₹50 OFF on orders above ₹199'
  },
  {
    code: 'FIRSTORDER',
    discountAmount: 20, // Offsets the delivery fee
    minimumOrder: 100,
    description: 'Free delivery on your first order (₹20 off)'
  },
  {
    code: 'GUNTURSPICE',
    discountAmount: 30,
    minimumOrder: 250,
    description: '₹30 OFF on spicy Andhra biryanis & tiffins'
  }
];

export const DEMO_USERS = {
  customer: {
    id: 'user_cust_01',
    name: 'Sravan Varma',
    email: 'sravan@tadikonda.local',
    phone: '+91 94401 23456',
    role: 'customer' as const,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-01-15T10:00:00Z',
  },
  restaurant_owner: {
    id: 'user_rest_01',
    name: 'K. Sambasiva Rao',
    email: 'sambasiva@krishnavilas.local',
    phone: '+91 98480 11223',
    role: 'restaurant_owner' as const,
    restaurantId: 'rest_01',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-01-10T09:00:00Z',
  },
  delivery_partner: {
    id: 'user_deliv_01',
    name: 'Ramesh Kumar',
    email: 'ramesh.delivery@tadikonda.local',
    phone: '+91 88972 34567',
    role: 'delivery_partner' as const,
    deliveryPartnerId: 'dp_01',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-02-01T11:00:00Z',
  },
  admin: {
    id: 'user_admin_01',
    name: 'Tadikonda Admin',
    email: 'admin@tadikondafood.local',
    phone: '+91 99887 76655',
    role: 'admin' as const,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-01-01T08:00:00Z',
  }
};
