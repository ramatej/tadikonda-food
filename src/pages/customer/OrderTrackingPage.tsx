import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { OrderStatusTimeline } from '../../components/orders/OrderStatusTimeline';
import { StatusBadge } from '../../components/ui/Badge';
import { OrderStatus } from '../../types';
import {
  ArrowLeft,
  Phone,
  Clock,
  Sparkles,
  Bike,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

import { isSupabaseConfigured } from '../../services/supabase/client';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useOrders();

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="text-center py-20 space-y-4 max-w-sm mx-auto">
        <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
        <p className="text-xs text-gray-500">Could not locate the requested order ID.</p>
        <Button variant="primary" size="md" onClick={() => navigate('/orders')}>
          View All Orders
        </Button>
      </div>
    );
  }

  // Demo status advancement helper
  const nextStatusMap: { [key in OrderStatus]?: OrderStatus } = {
    placed: 'confirmed',
    confirmed: 'preparing',
    preparing: 'ready_for_pickup',
    ready_for_pickup: 'out_for_delivery',
    out_for_delivery: 'delivered',
  };

  const nextStatus = nextStatusMap[order.status];

  const handleAdvanceStatus = () => {
    if (nextStatus) {
      updateOrderStatus(order.id, nextStatus, `Simulated progression to ${nextStatus}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex items-center gap-2 justify-center">
            <h1 className="text-lg font-black text-gray-950 tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.restaurantName}
          </span>
        </div>

        <Link
          to="/orders"
          className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full"
        >
          All Orders
        </Link>
      </div>

      {/* Demo Lifecycle Progression Bar (only in mock mode) */}
      {!isSupabaseConfigured && nextStatus && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-3xl shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <Sparkles className="w-4 h-4 shrink-0" />
            <div>
              <span className="font-extrabold block">Demo Order Simulator:</span>
              <span className="text-orange-100">
                Advance state to: <strong>{nextStatus.replace(/_/g, ' ').toUpperCase()}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={handleAdvanceStatus}
            className="bg-white text-orange-700 hover:bg-orange-50 font-black text-xs px-4 py-2 rounded-full shadow-sm shrink-0 active:scale-95 transition-all"
          >
            Advance Status ➔
          </button>
        </div>
      )}

      {/* Estimated Time Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-orange-600" />
            <span>Estimated Arrival</span>
          </div>
          <div className="text-2xl font-black text-gray-950">
            {order.status === 'delivered' ? 'Order Delivered!' : '15-20 Minutes'}
          </div>
          <p className="text-xs text-gray-500">
            Delivering to: <strong className="text-gray-800">{order.deliveryAddress.villageArea}</strong>, Tadikonda
          </p>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
          <Bike className="w-7 h-7" />
        </div>
      </div>

      {/* Delivery Partner Card (If assigned) */}
      {order.deliveryPartnerName && (
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
              alt="Delivery Partner"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/20"
            />
            <div>
              <div className="text-xs font-bold text-gray-900">{order.deliveryPartnerName}</div>
              <div className="text-[11px] text-gray-400">Assigned Delivery Partner • AP 07 BK 4492</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-0.5">★ 4.9 (340+ deliveries)</div>
            </div>
          </div>

          <a
            href={`tel:${order.deliveryPartnerPhone || '+918897234567'}`}
            className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
            title="Call Delivery Partner"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Order Status Timeline */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Live Tracking Timeline
        </h3>
        <OrderStatusTimeline status={order.status} statusHistory={order.statusHistory} />
      </div>

      {/* Order Items & Bill Details */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
          <span>Items in Order</span>
          <span className="text-xs text-gray-400 font-normal">{order.items.length} items</span>
        </h3>

        <div className="divide-y divide-gray-100 text-xs">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-gray-100 text-gray-800 font-bold flex items-center justify-center text-[10px]">
                  {item.quantity}×
                </span>
                <span className="font-semibold text-gray-900">{item.name}</span>
              </div>
              <span className="font-extrabold text-gray-900">
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-bold text-gray-900">₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Village Delivery Fee:</span>
            <span className="font-bold text-gray-900">₹{order.deliveryFee.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Discount ({order.voucherCode}):</span>
              <span>-₹{order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-dashed border-gray-300 pt-2 flex justify-between text-base font-black text-gray-950">
            <span>Total:</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
