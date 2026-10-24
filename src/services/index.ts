import { isSupabaseConfigured, supabase } from './supabase/client';
import { supabaseAuthService } from './supabase/supabaseAuthService';
import { supabaseRestaurantService } from './supabase/supabaseRestaurantService';
import { supabaseAdminService } from './supabase/supabaseAdminService';
import { supabaseMenuService } from './supabase/supabaseMenuService';
import { supabaseAddressService } from './supabase/supabaseAddressService';
import { supabaseOrderService } from './supabase/supabaseOrderService';
import { supabaseDeliveryService } from './supabase/supabaseDeliveryService';
import { supabaseReviewService } from './supabase/supabaseReviewService';
import {
  MockAuthService,
  MockRestaurantService,
  MockAdminService,
  MockMenuService,
  MockOrderService,
  MockDeliveryService,
  MockAddressService,
  MockReviewService,
} from './mock';

export * from './interfaces';
export { isSupabaseConfigured, supabase };

export const authService = isSupabaseConfigured ? supabaseAuthService : new MockAuthService();
export const restaurantService = isSupabaseConfigured ? supabaseRestaurantService : new MockRestaurantService();
export const adminService = isSupabaseConfigured ? supabaseAdminService : new MockAdminService();
export const menuService = isSupabaseConfigured ? supabaseMenuService : new MockMenuService();
export const addressService = isSupabaseConfigured ? supabaseAddressService : new MockAddressService();
export const orderService = isSupabaseConfigured ? supabaseOrderService : new MockOrderService();
export const deliveryService = isSupabaseConfigured ? supabaseDeliveryService : new MockDeliveryService();
export const reviewService = isSupabaseConfigured ? supabaseReviewService : new MockReviewService();
