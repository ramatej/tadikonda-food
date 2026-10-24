import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus, Address } from '../types';
import { orderService, isSupabaseConfigured, supabase } from '../services';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface OrderContextType {
  orders: Order[];
  activeOrder: Order | null;
  loadOrders: () => Promise<void>;
  placeOrder: (
    items: Order['items'],
    restaurantId: string,
    restaurantName: string,
    deliveryAddress: Address,
    subtotal: number,
    deliveryFee: number,
    discount: number,
    total: number,
    paymentMethod: 'cod' | 'upi_demo',
    customerNotes?: string,
    voucherCode?: string
  ) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<Order>;
  getOrderById: (orderId: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();
  const { showToast } = useToast();

  const loadOrders = useCallback(async () => {
    try {
      const all = await orderService.getOrders();
      setOrders(all);
    } catch (e) {
      console.error('Error loading orders', e);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('public:orders_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            loadOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      const handleStorageChange = (e: Event) => {
        const customEvent = e as CustomEvent<{ key?: string }>;
        if (!customEvent.detail || customEvent.detail.key?.includes('orders')) {
          loadOrders();
        }
      };

      window.addEventListener('tkd_state_change', handleStorageChange);
      return () => {
        window.removeEventListener('tkd_state_change', handleStorageChange);
      };
    }
  }, [loadOrders]);

  const placeOrder = async (
    items: Order['items'],
    restaurantId: string,
    restaurantName: string,
    deliveryAddress: Address,
    subtotal: number,
    deliveryFee: number,
    discount: number,
    total: number,
    paymentMethod: 'cod' | 'upi_demo',
    customerNotes?: string,
    voucherCode?: string
  ): Promise<Order> => {
    if (!user) {
      throw new Error('You must be signed in to place an order.');
    }
    try {
      const created = await orderService.createOrder({
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        restaurantId,
        restaurantName,
        restaurantPhone: '+91 98480 11223',
        restaurantAddress: 'Main Bazar, Tadikonda',
        deliveryAddress,
        items,
        subtotal,
        deliveryFee,
        discount,
        total,
        paymentMethod,
        paymentStatus: 'pending',
        estimatedDeliveryTimeMinutes: 25,
        customerNotes,
        voucherCode,
      });

      await loadOrders();
      showToast(`Order #${created.orderNumber} placed successfully!`, 'success');
      return created;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order';
      showToast(msg, 'error');
      throw err;
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    note?: string
  ): Promise<Order> => {
    try {
      const updated = await orderService.updateOrderStatus(orderId, status, note);
      await loadOrders();
      showToast(`Order #${updated.orderNumber} is now: ${status.replace(/_/g, ' ').toUpperCase()}`, 'info');
      return updated;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update order status';
      showToast(msg, 'error');
      throw err;
    }
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId);
  };

  // Find most recent active order for current customer
  const activeOrder =
    user
      ? orders.find(
          (o) =>
            o.customerId === user.id &&
            o.status !== 'delivered' &&
            o.status !== 'cancelled'
        ) || null
      : null;

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeOrder,
        loadOrders,
        placeOrder,
        updateOrderStatus,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
