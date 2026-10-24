import {
  Restaurant,
  MenuItem,
  Address,
  Order,
  DeliveryPartner,
  Review,
  User,
  PlatformSettings,
} from '../../types';
import {
  INITIAL_RESTAURANTS,
  INITIAL_MENU_ITEMS,
  INITIAL_ADDRESSES,
  INITIAL_ORDERS,
  INITIAL_DELIVERY_PARTNERS,
  INITIAL_REVIEWS,
} from '../../data/mockData';
import { DEMO_USERS, APP_CONFIG } from '../../config/constants';

const STORAGE_PREFIX = 'tkd_food_v1_';

const KEYS = {
  RESTAURANTS: `${STORAGE_PREFIX}restaurants`,
  MENU_ITEMS: `${STORAGE_PREFIX}menu_items`,
  ADDRESSES: `${STORAGE_PREFIX}addresses`,
  ORDERS: `${STORAGE_PREFIX}orders`,
  DELIVERY_PARTNERS: `${STORAGE_PREFIX}delivery_partners`,
  REVIEWS: `${STORAGE_PREFIX}reviews`,
  CURRENT_USER: `${STORAGE_PREFIX}current_user`,
  SETTINGS: `${STORAGE_PREFIX}settings`,
};

class MockStorage {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.warn(`Failed reading ${key} from localStorage`, e);
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('tkd_state_change', { detail: { key } }));
    } catch (e) {
      console.warn(`Failed writing ${key} to localStorage`, e);
    }
  }

  public init() {
    if (!localStorage.getItem(KEYS.RESTAURANTS)) {
      this.set(KEYS.RESTAURANTS, INITIAL_RESTAURANTS);
    }
    if (!localStorage.getItem(KEYS.MENU_ITEMS)) {
      this.set(KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS);
    }
    if (!localStorage.getItem(KEYS.ADDRESSES)) {
      this.set(KEYS.ADDRESSES, INITIAL_ADDRESSES);
    }
    if (!localStorage.getItem(KEYS.ORDERS)) {
      this.set(KEYS.ORDERS, INITIAL_ORDERS);
    }
    if (!localStorage.getItem(KEYS.DELIVERY_PARTNERS)) {
      this.set(KEYS.DELIVERY_PARTNERS, INITIAL_DELIVERY_PARTNERS);
    }
    if (!localStorage.getItem(KEYS.REVIEWS)) {
      this.set(KEYS.REVIEWS, INITIAL_REVIEWS);
    }
    if (!localStorage.getItem(KEYS.CURRENT_USER)) {
      this.set(KEYS.CURRENT_USER, DEMO_USERS.customer);
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      const defaultSettings: PlatformSettings = {
        deliveryFee: APP_CONFIG.defaultDeliveryFee,
        platformOpen: true,
        freeDeliveryThreshold: APP_CONFIG.freeDeliveryThreshold,
        serviceTaxPercentage: 0,
      };
      this.set(KEYS.SETTINGS, defaultSettings);
    }
  }

  // User
  public getCurrentUser(): User {
    return this.get<User>(KEYS.CURRENT_USER, DEMO_USERS.customer);
  }

  public setCurrentUser(user: User): void {
    this.set(KEYS.CURRENT_USER, user);
  }

  // Restaurants
  public getRestaurants(): Restaurant[] {
    return this.get<Restaurant[]>(KEYS.RESTAURANTS, INITIAL_RESTAURANTS);
  }

  public saveRestaurants(restaurants: Restaurant[]): void {
    this.set(KEYS.RESTAURANTS, restaurants);
  }

  // Menu items
  public getMenuItems(): MenuItem[] {
    return this.get<MenuItem[]>(KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS);
  }

  public saveMenuItems(items: MenuItem[]): void {
    this.set(KEYS.MENU_ITEMS, items);
  }

  // Orders
  public getOrders(): Order[] {
    return this.get<Order[]>(KEYS.ORDERS, INITIAL_ORDERS);
  }

  public saveOrders(orders: Order[]): void {
    this.set(KEYS.ORDERS, orders);
  }

  // Delivery Partners
  public getDeliveryPartners(): DeliveryPartner[] {
    return this.get<DeliveryPartner[]>(KEYS.DELIVERY_PARTNERS, INITIAL_DELIVERY_PARTNERS);
  }

  public saveDeliveryPartners(partners: DeliveryPartner[]): void {
    this.set(KEYS.DELIVERY_PARTNERS, partners);
  }

  // Addresses
  public getAddresses(): Address[] {
    return this.get<Address[]>(KEYS.ADDRESSES, INITIAL_ADDRESSES);
  }

  public saveAddresses(addresses: Address[]): void {
    this.set(KEYS.ADDRESSES, addresses);
  }

  // Reviews
  public getReviews(): Review[] {
    return this.get<Review[]>(KEYS.REVIEWS, INITIAL_REVIEWS);
  }

  public saveReviews(reviews: Review[]): void {
    this.set(KEYS.REVIEWS, reviews);
  }

  // Settings
  public getSettings(): PlatformSettings {
    return this.get<PlatformSettings>(KEYS.SETTINGS, {
      deliveryFee: APP_CONFIG.defaultDeliveryFee,
      platformOpen: true,
      freeDeliveryThreshold: APP_CONFIG.freeDeliveryThreshold,
      serviceTaxPercentage: 0,
    });
  }

  public saveSettings(settings: PlatformSettings): void {
    this.set(KEYS.SETTINGS, settings);
  }

  // Reset to initial demo data
  public resetToDefaults(): void {
    this.set(KEYS.RESTAURANTS, INITIAL_RESTAURANTS);
    this.set(KEYS.MENU_ITEMS, INITIAL_MENU_ITEMS);
    this.set(KEYS.ADDRESSES, INITIAL_ADDRESSES);
    this.set(KEYS.ORDERS, INITIAL_ORDERS);
    this.set(KEYS.DELIVERY_PARTNERS, INITIAL_DELIVERY_PARTNERS);
    this.set(KEYS.REVIEWS, INITIAL_REVIEWS);
    this.set(KEYS.CURRENT_USER, DEMO_USERS.customer);
  }
}

export const mockStorage = new MockStorage();
mockStorage.init();
