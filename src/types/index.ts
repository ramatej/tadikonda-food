export type UserRole = 'customer' | 'restaurant_owner' | 'delivery_partner' | 'admin';

export type PublicRegistrationRole = 'customer' | 'restaurant_owner' | 'delivery_partner';

export const PUBLIC_REGISTRATION_ROLES: PublicRegistrationRole[] = [
  'customer',
  'restaurant_owner',
  'delivery_partner',
];

export const ROLE_DESTINATIONS: Record<UserRole, string> = {
  customer: '/',
  restaurant_owner: '/restaurant/dashboard',
  delivery_partner: '/delivery/dashboard',
  admin: '/admin/dashboard',
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  restaurantId?: string; // If restaurant owner
  deliveryPartnerId?: string; // If delivery partner
}

export interface Address {
  id: string;
  userId: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  doorNo: string;
  landmark?: string;
  villageArea: string; // e.g. "Main Bazar", "Near RTC Bus Stand", "Ramalayam Center"
  pincode: string; // "522236" for Tadikonda
  isDefault: boolean;
}

export type RestaurantStatus = 'pending_approval' | 'approved' | 'active' | 'rejected' | 'suspended';

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTimeMinutes: number;
  priceForTwo: number;
  imageUrl: string;
  coverImageUrl?: string;
  locationArea: string;
  fullAddress: string;
  isOpen: boolean;
  status: RestaurantStatus;
  ownerId: string;
  chefName?: string;
  chefAvatar?: string;
  chefId?: string;
  phone: string;
  featured: boolean;
  approvedAt?: string;
  approvedBy?: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  itemCount: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  isBestseller?: boolean;
  rating: number;
  reviewCount: number;
  preparationTimeMinutes: number;
  customizationOptions?: {
    name: string;
    choices: { label: string; extraPrice: number }[];
  }[];
}

export interface CartItem {
  id: string; // unique item instance id
  menuItemId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  quantity: number;
  selectedOptions?: { [optionName: string]: string };
}

export interface Cart {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  voucherCode?: string;
  total: number;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "TKD-9842"
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  restaurantPhone: string;
  restaurantAddress: string;
  deliveryAddress: Address;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  voucherCode?: string;
  total: number;
  paymentMethod: 'cod' | 'upi_demo';
  paymentStatus: 'pending' | 'completed_demo';
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  estimatedDeliveryTimeMinutes: number;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPartner {
  id: string;
  userId: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  isOnline: boolean;
  rating: number;
  totalDeliveries: number;
  todaysDeliveries: number;
  todaysEarnings: number;
  currentOrderId?: string;
  status: 'pending_approval' | 'active' | 'suspended';
}

export interface Review {
  id: string;
  orderId: string;
  restaurantId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PlatformSettings {
  deliveryFee: number;
  platformOpen: boolean;
  freeDeliveryThreshold: number;
  serviceTaxPercentage: number;
  announcementBanner?: string;
}

export interface Voucher {
  code: string;
  discountAmount: number;
  discountPercentage?: number;
  minimumOrder: number;
  description: string;
}
