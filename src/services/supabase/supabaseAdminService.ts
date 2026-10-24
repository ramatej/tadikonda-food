import { supabase } from './client';
import { IAdminService } from '../interfaces';
import { Restaurant, PlatformSettings } from '../../types';
import { mapDbRestaurant } from './supabaseRestaurantService';

export class SupabaseAdminService implements IAdminService {
  async getPlatformStats(): Promise<{
    totalRevenue: number;
    totalOrders: number;
    activeRestaurants: number;
    activeDeliveryPartners: number;
    pendingRestaurants: number;
  }> {
    // Restaurants count
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('status');

    const activeCount = (restaurants || []).filter((r) => r.status === 'active' || r.status === 'approved').length;
    const pendingCount = (restaurants || []).filter((r) => r.status === 'pending_approval').length;

    // Delivery partners count
    const { count: dpCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'delivery_partner');

    // Orders stats
    const { data: orders } = await supabase
      .from('orders')
      .select('total, status');

    const validOrders = (orders || []).filter((o) => o.status !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return {
      totalRevenue,
      totalOrders: (orders || []).length,
      activeRestaurants: activeCount,
      activeDeliveryPartners: dpCount || 0,
      pendingRestaurants: pendingCount,
    };
  }

  async updateRestaurantStatus(
    restaurantId: string,
    status: Restaurant['status']
  ): Promise<Restaurant> {
    // Execute secure server-side RPC procedure requiring authenticated admin privileges
    const { data: rpcResult, error: rpcError } = await supabase.rpc('approve_restaurant', {
      p_restaurant_id: restaurantId,
      p_action: status,
    });

    if (rpcError) {
      console.error('Error updating restaurant status via RPC:', rpcError);
      throw new Error(rpcError.message || 'Failed to update restaurant status. Administrator privileges required.');
    }

    // Retrieve updated restaurant record
    const { data: updatedRow, error: fetchError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    if (fetchError || !updatedRow) {
      throw new Error(fetchError?.message || 'Restaurant updated but could not be reloaded');
    }

    return mapDbRestaurant(updatedRow);
  }

  async getSettings(): Promise<PlatformSettings> {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 'current')
      .maybeSingle();

    if (error || !data) {
      return {
        deliveryFee: 20,
        platformOpen: true,
        freeDeliveryThreshold: 499,
        serviceTaxPercentage: 0,
      };
    }

    return {
      deliveryFee: Number(data.delivery_fee),
      platformOpen: Boolean(data.platform_open),
      freeDeliveryThreshold: Number(data.free_delivery_threshold),
      serviceTaxPercentage: Number(data.service_tax_percentage),
      announcementBanner: data.announcement_banner || undefined,
    };
  }

  async updateSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (settings.deliveryFee !== undefined) payload.delivery_fee = settings.deliveryFee;
    if (settings.platformOpen !== undefined) payload.platform_open = settings.platformOpen;
    if (settings.freeDeliveryThreshold !== undefined) payload.free_delivery_threshold = settings.freeDeliveryThreshold;
    if (settings.serviceTaxPercentage !== undefined) payload.service_tax_percentage = settings.serviceTaxPercentage;
    if (settings.announcementBanner !== undefined) payload.announcement_banner = settings.announcementBanner;

    const { data, error } = await supabase
      .from('platform_settings')
      .update(payload)
      .eq('id', 'current')
      .select()
      .single();

    if (error) {
      console.error('Error updating platform settings:', error);
      throw new Error(error.message);
    }

    return {
      deliveryFee: Number(data.delivery_fee),
      platformOpen: Boolean(data.platform_open),
      freeDeliveryThreshold: Number(data.free_delivery_threshold),
      serviceTaxPercentage: Number(data.service_tax_percentage),
      announcementBanner: data.announcement_banner || undefined,
    };
  }
}

export const supabaseAdminService = new SupabaseAdminService();
