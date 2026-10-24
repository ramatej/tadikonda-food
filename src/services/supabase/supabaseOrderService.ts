import { supabase } from './client';
import { IOrderService } from '../interfaces';
import { Order, OrderStatus } from '../../types';

export function mapDbOrder(row: any): Order {
  const items = Array.isArray(row.order_items) ? row.order_items : [];

  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name || 'Customer',
    customerPhone: row.customer_phone || '',
    restaurantId: row.restaurant_id,
    restaurantName: row.restaurant_name || 'Restaurant',
    restaurantPhone: row.restaurant_phone || '',
    restaurantAddress: row.restaurant_address || 'Tadikonda',
    deliveryAddress: row.delivery_address || {},
    items: items.map((i: any) => ({
      menuItemId: i.menu_item_id || '',
      name: i.name || 'Dish',
      price: Number(i.price) || 0,
      quantity: Number(i.quantity) || 1,
      isVeg: Boolean(i.is_veg),
      imageUrl: i.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
    })),
    subtotal: Number(row.item_subtotal) || 0,
    deliveryFee: Number(row.delivery_fee) || 20,
    discount: Number(row.discount) || 0,
    voucherCode: row.voucher_code || undefined,
    total: Number(row.total) || 0,
    paymentMethod: row.payment_method || 'cod',
    paymentStatus: row.payment_status || 'pending',
    status: row.status as OrderStatus,
    statusHistory: Array.isArray(row.status_history) && row.status_history.length > 0
      ? row.status_history
      : [
          {
            status: row.status as OrderStatus,
            timestamp: row.created_at,
            note: 'Order placed by customer in Tadikonda',
          },
        ],
    deliveryPartnerId: row.delivery_partner_id || undefined,
    deliveryPartnerName: row.delivery_partner_name || undefined,
    deliveryPartnerPhone: row.delivery_partner_phone || undefined,
    estimatedDeliveryTimeMinutes: row.estimated_delivery_time_minutes || 25,
    customerNotes: row.customer_notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseOrderService implements IOrderService {
  async getOrders(filter?: {
    customerId?: string;
    restaurantId?: string;
    deliveryPartnerId?: string;
  }): Promise<Order[]> {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (filter?.customerId) {
      query = query.eq('customer_id', filter.customerId);
    }
    if (filter?.restaurantId) {
      query = query.eq('restaurant_id', filter.restaurantId);
    }
    if (filter?.deliveryPartnerId) {
      query = query.eq('delivery_partner_id', filter.deliveryPartnerId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      return [];
    }

    return (data || []).map(mapDbOrder);
  }

  async getOrderById(id: string): Promise<Order | null> {
    if (!id) return null;

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching order by ID:', error);
      return null;
    }

    return mapDbOrder(data);
  }

  async createOrder(
    orderData: Omit<
      Order,
      'id' | 'orderNumber' | 'status' | 'statusHistory' | 'createdAt' | 'updatedAt'
    >
  ): Promise<Order> {
    const payloadItems = orderData.items.map((i) => ({
      menuItemId: i.menuItemId,
      quantity: i.quantity,
    }));

    const { data, error } = await supabase.rpc('create_order_atomic', {
      p_restaurant_id: orderData.restaurantId,
      p_delivery_address: orderData.deliveryAddress,
      p_items: payloadItems,
      p_payment_method: orderData.paymentMethod,
      p_customer_notes: orderData.customerNotes || null,
      p_voucher_code: orderData.voucherCode || null,
    });

    if (error) {
      console.error('Error executing atomic order creation:', error);
      throw new Error(error.message || 'Failed to place order.');
    }

    if (!data?.order_id) {
      throw new Error('Order creation did not return a valid order ID');
    }

    const created = await this.getOrderById(data.order_id);
    if (!created) {
      throw new Error('Order was created but could not be fetched');
    }

    return created;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string
  ): Promise<Order> {
    const { error } = await supabase.rpc('update_order_status', {
      p_order_id: orderId,
      p_status: status,
      p_note: note || null,
    });

    if (error) {
      console.error('Error updating order status:', error);
      throw new Error(error.message || `Failed to transition order status to ${status}`);
    }

    const updated = await this.getOrderById(orderId);
    if (!updated) {
      throw new Error('Order not found after status update');
    }

    return updated;
  }

  async assignDeliveryPartner(
    orderId: string,
    deliveryPartnerId: string
  ): Promise<Order> {
    const { error } = await supabase.rpc('assign_order_delivery_partner', {
      p_order_id: orderId,
      p_delivery_partner_id: deliveryPartnerId,
    });

    if (error) {
      console.error('Error assigning delivery partner:', error);
      throw new Error(error.message || 'Failed to assign delivery partner');
    }

    const updated = await this.getOrderById(orderId);
    if (!updated) {
      throw new Error('Order not found after delivery partner assignment');
    }

    return updated;
  }
}

export const supabaseOrderService = new SupabaseOrderService();
