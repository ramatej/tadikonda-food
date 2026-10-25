import {
  Restaurant,
  MenuItem,
  Address,
  Order,
  OrderStatus,
  DeliveryPartner,
  Review,
  User,
  UserRole,
  PublicRegistrationRole,
  PlatformSettings,
} from '../../types';

export interface AuthResult {
  user: User | null;
  needsEmailVerification?: boolean;
  message?: string;
}

export interface IAuthService {
  getCurrentUser(): Promise<User | null>;
  loginWithEmail(email: string, password: string): Promise<AuthResult>;
  sendPhoneOtp(phone: string): Promise<{ success: boolean; message: string }>;
  verifyPhoneOtp(phone: string, token: string): Promise<AuthResult>;
  loginWithPhone?(phone: string, otp: string): Promise<User>;
  register(
    name: string,
    email: string,
    phone: string,
    role: PublicRegistrationRole,
    password?: string
  ): Promise<AuthResult>;
  logout(): Promise<void>;
  resetPassword(email: string): Promise<{ success: boolean; message: string }>;
  updatePassword?(newPassword: string): Promise<{ success: boolean; message: string }>;
  updateProfile?(
    userId: string,
    updates: { full_name?: string; phone?: string; avatar_url?: string }
  ): Promise<void>;
  switchRole?(role: UserRole): Promise<User>;
}

export interface IRestaurantService {
  getAllRestaurants(): Promise<Restaurant[]>;
  getRestaurantById(id: string): Promise<Restaurant | null>;
  searchRestaurants(query: string): Promise<Restaurant[]>;
  getRestaurantsByCategory(categorySlug: string): Promise<Restaurant[]>;
  updateRestaurant(restaurant: Partial<Restaurant> & { id: string }): Promise<Restaurant>;
  toggleOpenStatus(restaurantId: string, isOpen: boolean): Promise<Restaurant>;
  registerRestaurant(registration: Omit<Restaurant, 'id' | 'status' | 'rating' | 'reviewCount'>): Promise<Restaurant>;
}

export interface IMenuService {
  getMenuItems(restaurantId?: string): Promise<MenuItem[]>;
  getMenuItemById(id: string): Promise<MenuItem | null>;
  searchMenuItems(query: string): Promise<MenuItem[]>;
  createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem>;
  updateMenuItem(item: Partial<MenuItem> & { id: string }): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;
  toggleItemAvailability(id: string, isAvailable: boolean): Promise<MenuItem>;
}

export interface IOrderService {
  getOrders(filter?: { customerId?: string; restaurantId?: string; deliveryPartnerId?: string }): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'status' | 'statusHistory' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<Order>;
  assignDeliveryPartner(orderId: string, deliveryPartnerId: string): Promise<Order>;
}

export interface IDeliveryService {
  getDeliveryPartners(): Promise<DeliveryPartner[]>;
  getPendingDeliveryPartners(): Promise<DeliveryPartner[]>;
  getDeliveryPartnerById(id: string): Promise<DeliveryPartner | null>;
  setDeliveryPartnerStatus(partnerId: string, status: 'approved' | 'rejected'): Promise<DeliveryPartner>;
  toggleOnlineStatus(partnerId: string, isOnline: boolean): Promise<DeliveryPartner>;
  getAssignedOrders(partnerId: string): Promise<Order[]>;
  updateDeliveryStatus(orderId: string, status: OrderStatus): Promise<Order>;
}

export interface IAdminService {
  getPlatformStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    activeRestaurants: number;
    activeDeliveryPartners: number;
    pendingRestaurants: number;
  }>;
  updateRestaurantStatus(restaurantId: string, status: Restaurant['status']): Promise<Restaurant>;
  getSettings(): Promise<PlatformSettings>;
  updateSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings>;
}

export interface IAddressService {
  getUserAddresses(userId: string): Promise<Address[]>;
  addAddress(address: Omit<Address, 'id'>): Promise<Address>;
  updateAddress(address: Address): Promise<Address>;
  deleteAddress(id: string): Promise<void>;
  setDefaultAddress(userId: string, addressId: string): Promise<Address[]>;
}

export interface IReviewService {
  getRestaurantReviews(restaurantId: string): Promise<Review[]>;
  addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review>;
}
