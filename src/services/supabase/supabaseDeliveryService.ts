import { supabase } from './client';
import { IDeliveryService } from '../interfaces';
import { DeliveryPartner, Order, OrderStatus } from '../../types';
import { supabaseOrderService } from './supabaseOrderService';

export function mapDbDeliveryPartner(row: any): DeliveryPartner {
  const profile = row.profiles || {};
  return {
    id: row.id,
    userId: row.user_id,
    name: profile.full_name || row.name || 'Delivery Partner',
    phone: row.phone || profile.phone || '',
    vehicleType: row.vehicle_type || 'Motorcycle',
    vehicleNumber: row.vehicle_number || 'AP 07 BK 1234',
    isOnline: row.availability_status === 'online',
    rating: Number(row.rating) || 4.8,
    totalDeliveries: row.total_deliveries || 0,
    todaysDeliveries: row.todays_deliveries || 0,
    todaysEarnings: Number(row.todays_earnings) || 0,
    currentOrderId: row.current_order_id || undefined,
    status: row.approval_status || 'pending_approval',
  };
}

export class SupabaseDeliveryService implements IDeliveryService {
  async getDeliveryPartners(): Promise<DeliveryPartner[]> {
    const { data, error } = await supabase
      .from('delivery_partner_profiles')
      .select('*, profiles(full_name, phone)')
      .eq('approval_status', 'approved')
      .eq('availability_status', 'online');

    if (error) {
      console.error('Error fetching eligible delivery partners:', error);
      return [];
    }

    return (data || []).map(mapDbDeliveryPartner);
  }
    // New: Fetch pending delivery partner registrations
    async getPendingDeliveryPartners(): Promise<DeliveryPartner[]> {
      const { data, error } = await supabase
        .from('delivery_partner_profiles')
        .select('*, profiles(full_name, phone)')
        .eq('approval_status', 'pending_approval');

      if (error) {
        console.error('Error fetching pending delivery partners:', error);
        return [];
      }

      return (data || []).map(mapDbDeliveryPartner);
    }

    // Approve or reject a delivery partner via direct table update
    async setDeliveryPartnerStatus(
      partnerId: string,
      status: 'approved' | 'rejected'
    ): Promise<DeliveryPartner> {
      const { error } = await supabase
        .from('delivery_partner_profiles')
        .update({ approval_status: status })
        .eq('id', partnerId);

      if (error) {
        console.error('Error updating delivery partner status:', error);
        throw new Error(error.message || 'Failed to update delivery partner status');
      }

      const updated = await this.getDeliveryPartnerById(partnerId);
      if (!updated) {
        throw new Error('Delivery partner could not be reloaded after status change');
      }
      return updated;
    }

  async getDeliveryPartnerById(id: string): Promise<DeliveryPartner | null> {
    if (!id) return null;

    let query = supabase
      .from('delivery_partner_profiles')
      .select('*, profiles(full_name, phone)');

    if (id.includes('-') && id.length === 36) {
      query = query.or(`id.eq.${id},user_id.eq.${id}`);
    } else {
      query = query.eq('id', id);
    }

    const { data, error } = await query.maybeSingle();
    if (error || !data) {
      console.error('Error fetching delivery partner by ID:', error);
      return null;
    }

    return mapDbDeliveryPartner(data);
  }

  async toggleOnlineStatus(
    partnerId: string,
    isOnline: boolean
  ): Promise<DeliveryPartner> {
    const { error } = await supabase
      .from('delivery_partner_profiles')
      .update({ availability_status: isOnline ? 'online' : 'offline' })
      .or(`id.eq.${partnerId},user_id.eq.${partnerId}`);

    if (error) {
      console.error('Error toggling delivery partner availability:', error);
      throw new Error(error.message || 'Failed to toggle availability status');
    }

    const updated = await this.getDeliveryPartnerById(partnerId);
    if (!updated) {
      throw new Error('Delivery partner profile could not be reloaded');
    }

    return updated;
  }

  async getAssignedOrders(partnerId: string): Promise<Order[]> {
    return supabaseOrderService.getOrders({ deliveryPartnerId: partnerId });
  }

  async updateDeliveryStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return supabaseOrderService.updateOrderStatus(orderId, status);
  }
}

export const supabaseDeliveryService = new SupabaseDeliveryService();
