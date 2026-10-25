import {
  IAuthService,
  IRestaurantService,
  IMenuService,
  IOrderService,
  IDeliveryService,
  IAdminService,
  IAddressService,
  IReviewService,
  AuthResult,
} from '../interfaces';
import {
  User,
  UserRole,
  Restaurant,
  MenuItem,
  Order,
  OrderStatus,
  DeliveryPartner,
  Address,
  Review,
  PlatformSettings,
} from '../../types';
import { mockStorage } from './mockStorage';
import { DEMO_USERS } from '../../config/constants';
import { isSupabaseConfigured } from '../supabase/client';
import { supabaseRestaurantService } from '../supabase/supabaseRestaurantService';
import { supabaseAdminService } from '../supabase/supabaseAdminService';
import { supabaseMenuService } from '../supabase/supabaseMenuService';
import { supabaseAddressService } from '../supabase/supabaseAddressService';

// 1. Mock Auth Service
export class MockAuthService implements IAuthService {
  async getCurrentUser(): Promise<User | null> {
    return mockStorage.getCurrentUser();
  }

  async switchRole(role: UserRole): Promise<User> {
    const user = DEMO_USERS[role];
    mockStorage.setCurrentUser(user);
    return user;
  }

  async loginWithEmail(email: string, _password: string): Promise<AuthResult> {
    const roleMatch = (Object.values(DEMO_USERS) as User[]).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    const user: User = roleMatch || {
      id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email,
      phone: '+91 94401 99999',
      role: 'customer' as UserRole,
      createdAt: new Date().toISOString(),
    };
    mockStorage.setCurrentUser(user);
    return { user, needsEmailVerification: false };
  }

  async sendPhoneOtp(phone: string): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: `Demo OTP 123456 sent to ${phone}`,
    };
  }

  async verifyPhoneOtp(phone: string, token: string): Promise<AuthResult> {
    if (token.trim() !== '123456' && token.trim() !== '1234') {
      throw new Error('Invalid OTP. Please enter 123456 in Demo mode.');
    }
    const roleMatch = (Object.values(DEMO_USERS) as User[]).find((u) => u.phone === phone);
    const user: User = roleMatch || {
      id: `user_phone_${Date.now()}`,
      name: `Customer ${phone.slice(-4)}`,
      email: '',
      phone,
      role: 'customer' as UserRole,
      createdAt: new Date().toISOString(),
    };
    mockStorage.setCurrentUser(user);
    return { user, needsEmailVerification: false, message: 'Logged in successfully (Demo)' };
  }

  async loginWithPhone(phone: string, _otp: string): Promise<User> {
    const roleMatch = (Object.values(DEMO_USERS) as User[]).find((u) => u.phone === phone);
    const user = roleMatch || {
      id: `user_${Date.now()}`,
      name: 'Tadikonda Customer',
      email: `customer_${Date.now()}@tadikonda.local`,
      phone,
      role: 'customer' as UserRole,
      createdAt: new Date().toISOString(),
    };
    mockStorage.setCurrentUser(user);
    return user;
  }

  async register(
    name: string,
    email: string,
    phone: string,
    role: UserRole,
    _password?: string
  ): Promise<AuthResult> {
    const user: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      phone,
      role,
      createdAt: new Date().toISOString(),
    };
    mockStorage.setCurrentUser(user);
    return { user, needsEmailVerification: false };
  }

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: `Demo: reset link would be sent to ${email}`,
    };
  }

  async logout(): Promise<void> {
    mockStorage.setCurrentUser(DEMO_USERS.customer);
  }

  async updateProfile(userId: string, updates: { full_name?: string; phone?: string; avatar_url?: string }): Promise<void> {
    const user = mockStorage.getCurrentUser();
    if (user && user.id === userId) {
      if (updates.full_name) user.name = updates.full_name;
      if (updates.phone) user.phone = updates.phone;
      if (updates.avatar_url) user.avatarUrl = updates.avatar_url;
      mockStorage.setCurrentUser({ ...user });
    }
  }
}

// 2. Mock Restaurant Service
export class MockRestaurantService implements IRestaurantService {
  async getAllRestaurants(): Promise<Restaurant[]> {
    return mockStorage.getRestaurants();
  }

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    const all = mockStorage.getRestaurants();
    return all.find((r) => r.id === id) || null;
  }

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    const all = mockStorage.getRestaurants();
    const q = query.toLowerCase().trim();
    if (!q) return all;
    return all.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
        r.locationArea.toLowerCase().includes(q)
    );
  }

  async getRestaurantsByCategory(categorySlug: string): Promise<Restaurant[]> {
    const all = mockStorage.getRestaurants();
    if (categorySlug === 'all') return all;

    const items = mockStorage.getMenuItems();
    const matchingRestaurantIds = new Set(
      items.filter((item) => item.category === categorySlug).map((item) => item.restaurantId)
    );

    return all.filter((r) => matchingRestaurantIds.has(r.id));
  }

  async updateRestaurant(restaurant: Partial<Restaurant> & { id: string }): Promise<Restaurant> {
    const all = mockStorage.getRestaurants();
    const index = all.findIndex((r) => r.id === restaurant.id);
    if (index === -1) throw new Error('Restaurant not found');
    const updated = { ...all[index], ...restaurant };
    all[index] = updated;
    mockStorage.saveRestaurants(all);
    return updated;
  }

  async toggleOpenStatus(restaurantId: string, isOpen: boolean): Promise<Restaurant> {
    return this.updateRestaurant({ id: restaurantId, isOpen });
  }

  async registerRestaurant(
    registration: Omit<Restaurant, 'id' | 'status' | 'rating' | 'reviewCount'>
  ): Promise<Restaurant> {
    const all = mockStorage.getRestaurants();
    const newRest: Restaurant = {
      ...registration,
      id: `rest_${Date.now()}`,
      status: 'pending_approval',
      rating: 4.5,
      reviewCount: 0,
    };
    all.push(newRest);
    mockStorage.saveRestaurants(all);
    return newRest;
  }
}

// 3. Mock Menu Service
export class MockMenuService implements IMenuService {
  async getMenuItems(restaurantId?: string): Promise<MenuItem[]> {
    const all = mockStorage.getMenuItems();
    if (restaurantId) {
      return all.filter((i) => i.restaurantId === restaurantId);
    }
    return all;
  }

  async getMenuItemById(id: string): Promise<MenuItem | null> {
    const all = mockStorage.getMenuItems();
    return all.find((i) => i.id === id) || null;
  }

  async searchMenuItems(query: string): Promise<MenuItem[]> {
    const all = mockStorage.getMenuItems();
    const q = query.toLowerCase().trim();
    if (!q) return all;
    return all.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }

  async createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const all = mockStorage.getMenuItems();
    const newItem: MenuItem = {
      ...item,
      id: `item_${Date.now()}`,
    };
    all.push(newItem);
    mockStorage.saveMenuItems(all);
    return newItem;
  }

  async updateMenuItem(item: Partial<MenuItem> & { id: string }): Promise<MenuItem> {
    const all = mockStorage.getMenuItems();
    const index = all.findIndex((i) => i.id === item.id);
    if (index === -1) throw new Error('Menu item not found');
    const updated = { ...all[index], ...item };
    all[index] = updated;
    mockStorage.saveMenuItems(all);
    return updated;
  }

  async deleteMenuItem(id: string): Promise<void> {
    const all = mockStorage.getMenuItems();
    const filtered = all.filter((i) => i.id !== id);
    mockStorage.saveMenuItems(filtered);
  }

  async toggleItemAvailability(id: string, isAvailable: boolean): Promise<MenuItem> {
    return this.updateMenuItem({ id, isAvailable });
  }
}

// 4. Mock Order Service
export class MockOrderService implements IOrderService {
  async getOrders(filter?: {
    customerId?: string;
    restaurantId?: string;
    deliveryPartnerId?: string;
  }): Promise<Order[]> {
    const all = mockStorage.getOrders();
    return all.filter((o) => {
      if (filter?.customerId && o.customerId !== filter.customerId) return false;
      if (filter?.restaurantId && o.restaurantId !== filter.restaurantId) return false;
      if (filter?.deliveryPartnerId && o.deliveryPartnerId !== filter.deliveryPartnerId)
        return false;
      return true;
    });
  }

  async getOrderById(id: string): Promise<Order | null> {
    const all = mockStorage.getOrders();
    return all.find((o) => o.id === id) || null;
  }

  async createOrder(
    orderData: Omit<
      Order,
      'id' | 'orderNumber' | 'status' | 'statusHistory' | 'createdAt' | 'updatedAt'
    >
  ): Promise<Order> {
    const all = mockStorage.getOrders();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      orderNumber: `TKD-${randomCode}`,
      status: 'placed',
      statusHistory: [
        {
          status: 'placed',
          timestamp: now,
          note: 'Order placed by customer in Tadikonda',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    // Auto-assign first online delivery partner for demo flow convenience
    const partners = mockStorage.getDeliveryPartners();
    const onlinePartner = partners.find((p) => p.isOnline) || partners[0];
    if (onlinePartner) {
      newOrder.deliveryPartnerId = onlinePartner.id;
      newOrder.deliveryPartnerName = onlinePartner.name;
      newOrder.deliveryPartnerPhone = onlinePartner.phone;
    }

    all.unshift(newOrder);
    mockStorage.saveOrders(all);
    return newOrder;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<Order> {
    const all = mockStorage.getOrders();
    const index = all.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const order = all[index];
    const now = new Date().toISOString();

    const updated: Order = {
      ...order,
      status,
      statusHistory: [
        ...order.statusHistory,
        {
          status,
          timestamp: now,
          note: note || `Status updated to ${status}`,
        },
      ],
      updatedAt: now,
    };

    all[index] = updated;
    mockStorage.saveOrders(all);

    // If marked delivered, update delivery partner stats
    if (status === 'delivered' && updated.deliveryPartnerId) {
      const partners = mockStorage.getDeliveryPartners();
      const pIdx = partners.findIndex((p) => p.id === updated.deliveryPartnerId);
      if (pIdx !== -1) {
        partners[pIdx].todaysDeliveries += 1;
        partners[pIdx].totalDeliveries += 1;
        partners[pIdx].todaysEarnings += 40; // ₹40 delivery payout
        mockStorage.saveDeliveryPartners(partners);
      }
    }

    return updated;
  }

  async assignDeliveryPartner(orderId: string, deliveryPartnerId: string): Promise<Order> {
    const partners = mockStorage.getDeliveryPartners();
    const partner = partners.find((p) => p.id === deliveryPartnerId);
    if (!partner) throw new Error('Delivery partner not found');

    const all = mockStorage.getOrders();
    const index = all.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const updated: Order = {
      ...all[index],
      deliveryPartnerId: partner.id,
      deliveryPartnerName: partner.name,
      deliveryPartnerPhone: partner.phone,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    mockStorage.saveOrders(all);
    return updated;
  }
}

// 5. Mock Delivery Service
export class MockDeliveryService implements IDeliveryService {
  async getDeliveryPartners(): Promise<DeliveryPartner[]> {
    return mockStorage.getDeliveryPartners();
  }

  async getPendingDeliveryPartners(): Promise<DeliveryPartner[]> {
    const all = mockStorage.getDeliveryPartners();
    return all.filter((p) => p.status === 'pending_approval');
  }

  async setDeliveryPartnerStatus(
    partnerId: string,
    status: 'approved' | 'rejected'
  ): Promise<DeliveryPartner> {
    const all = mockStorage.getDeliveryPartners();
    const idx = all.findIndex((p) => p.id === partnerId);
    if (idx === -1) throw new Error('Delivery partner not found');
    all[idx].status = status;
    mockStorage.saveDeliveryPartners(all);
    return all[idx];
  }

  async getDeliveryPartnerById(id: string): Promise<DeliveryPartner | null> {
    const all = mockStorage.getDeliveryPartners();
    return all.find((p) => p.id === id) || null;
  }

  async toggleOnlineStatus(partnerId: string, isOnline: boolean): Promise<DeliveryPartner> {
    const all = mockStorage.getDeliveryPartners();
    const index = all.findIndex((p) => p.id === partnerId);
    if (index === -1) throw new Error('Partner not found');
    all[index].isOnline = isOnline;
    mockStorage.saveDeliveryPartners(all);
    return all[index];
  }

  async getAssignedOrders(partnerId: string): Promise<Order[]> {
    const all = mockStorage.getOrders();
    return all.filter((o) => o.deliveryPartnerId === partnerId);
  }

  async updateDeliveryStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const orderService = new MockOrderService();
    return orderService.updateOrderStatus(orderId, status);
  }
}

// 6. Mock Admin Service
export class MockAdminService implements IAdminService {
  async getPlatformStats() {
    const orders = mockStorage.getOrders();
    const restaurants = mockStorage.getRestaurants();
    const partners = mockStorage.getDeliveryPartners();

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      totalRevenue,
      totalOrders: orders.length,
      activeRestaurants: restaurants.filter((r) => r.status === 'active').length,
      activeDeliveryPartners: partners.filter((p) => p.status === 'active').length,
      pendingRestaurants: restaurants.filter((r) => r.status === 'pending_approval').length,
    };
  }

  async updateRestaurantStatus(
    restaurantId: string,
    status: Restaurant['status']
  ): Promise<Restaurant> {
    const restService = new MockRestaurantService();
    return restService.updateRestaurant({ id: restaurantId, status });
  }

  async getSettings(): Promise<PlatformSettings> {
    return mockStorage.getSettings();
  }

  async updateSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const current = mockStorage.getSettings();
    const updated = { ...current, ...settings };
    mockStorage.saveSettings(updated);
    return updated;
  }
}

// 7. Mock Address Service
export class MockAddressService implements IAddressService {
  async getUserAddresses(userId: string): Promise<Address[]> {
    const all = mockStorage.getAddresses();
    return all.filter((a) => a.userId === userId);
  }

  async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    const all = mockStorage.getAddresses();
    const newAddress: Address = {
      ...address,
      id: `addr_${Date.now()}`,
    };
    if (newAddress.isDefault) {
      all.forEach((a) => {
        if (a.userId === newAddress.userId) a.isDefault = false;
      });
    }
    all.push(newAddress);
    mockStorage.saveAddresses(all);
    return newAddress;
  }

  async updateAddress(address: Address): Promise<Address> {
    const all = mockStorage.getAddresses();
    const index = all.findIndex((a) => a.id === address.id);
    if (index === -1) throw new Error('Address not found');
    if (address.isDefault) {
      all.forEach((a) => {
        if (a.userId === address.userId && a.id !== address.id) a.isDefault = false;
      });
    }
    all[index] = address;
    mockStorage.saveAddresses(all);
    return address;
  }

  async deleteAddress(id: string): Promise<void> {
    const all = mockStorage.getAddresses();
    const filtered = all.filter((a) => a.id !== id);
    mockStorage.saveAddresses(filtered);
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<Address[]> {
    const all = mockStorage.getAddresses();
    all.forEach((a) => {
      if (a.userId === userId) {
        a.isDefault = a.id === addressId;
      }
    });
    mockStorage.saveAddresses(all);
    return all.filter((a) => a.userId === userId);
  }
}

// 8. Mock Review Service
export class MockReviewService implements IReviewService {
  async getRestaurantReviews(restaurantId: string): Promise<Review[]> {
    const all = mockStorage.getReviews();
    return all.filter((r) => r.restaurantId === restaurantId);
  }

  async addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const all = mockStorage.getReviews();
    const newReview: Review = {
      ...review,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newReview);
    mockStorage.saveReviews(all);
    return newReview;
  }
}

// Export singletons (delegate to Supabase if configured)
export const authService = new MockAuthService();
export const restaurantService = isSupabaseConfigured ? supabaseRestaurantService : new MockRestaurantService();
export const menuService = isSupabaseConfigured ? supabaseMenuService : new MockMenuService();
export const orderService = new MockOrderService();
export const deliveryService = new MockDeliveryService();
export const adminService = isSupabaseConfigured ? supabaseAdminService : new MockAdminService();
export const addressService = isSupabaseConfigured ? supabaseAddressService : new MockAddressService();
export const reviewService = new MockReviewService();
