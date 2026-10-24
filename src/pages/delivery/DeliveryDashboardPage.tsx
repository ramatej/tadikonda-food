import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { DeliveryPartner, Order } from '../../types';
import { deliveryService } from '../../services';
import { StatusBadge } from '../../components/ui/Badge';
import {
  Bike,
  Power,
  Phone,
  MapPin,
  CheckCircle2,
  Navigation,
  Clock,
  IndianRupee,
  ShoppingBag,
} from 'lucide-react';

export const DeliveryDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { orders, updateOrderStatus } = useOrders();
  const { showToast } = useToast();

  const [partner, setPartner] = useState<DeliveryPartner | null>(null);

  const partnerId = user?.deliveryPartnerId || user?.id || '';

  const loadPartner = async () => {
    if (!partnerId) return;
    const p = await deliveryService.getDeliveryPartnerById(partnerId);
    setPartner(p);
  };

  useEffect(() => {
    loadPartner();
  }, [partnerId]);

  const toggleOnline = async () => {
    if (!partner) return;
    try {
      const updated = await deliveryService.toggleOnlineStatus(partner.userId || partner.id, !partner.isOnline);
      setPartner(updated);
      showToast(
        updated.isOnline ? 'You are now ONLINE & ready for deliveries' : 'You are now OFFLINE',
        'info'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update online status';
      showToast(msg, 'error');
    }
  };

  // Deliveries assigned to this partner (matching either partner userId or profile id)
  const effectivePartnerId = partner?.userId || partner?.id || user?.id;
  const assignedOrders = orders.filter((o) => o.deliveryPartnerId === effectivePartnerId);
  const activeDeliveries = assignedOrders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );
  const completedDeliveries = assignedOrders.filter((o) => o.status === 'delivered');

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              Delivery Partner Portal
            </span>
            <span className="text-xs text-gray-400">Tadikonda Express</span>
          </div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            {partner?.name || user?.name || 'Delivery Partner'}
          </h1>
          <p className="text-xs text-gray-500">
            {partner?.vehicleType || 'Vehicle Registered'} • {partner?.vehicleNumber || 'Tadikonda Fleet'}
          </p>
        </div>

        {/* Online / Offline Toggle */}
        <button
          onClick={toggleOnline}
          className={`px-6 py-3 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
            partner?.isOnline
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-gray-700 text-white hover:bg-gray-800'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{partner?.isOnline ? 'YOU ARE ONLINE' : 'YOU ARE OFFLINE'}</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-black text-orange-600">
            ₹{partner?.todaysEarnings || (completedDeliveries.length * 40)}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-0.5">Today's Earnings</div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-black text-gray-950">
            {activeDeliveries.length}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-0.5">Active Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-black text-gray-950">
            {partner?.todaysDeliveries || completedDeliveries.length}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-0.5">Completed Today</div>
        </div>
      </div>

      {/* Active Deliveries Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Active Delivery Assignments ({activeDeliveries.length})
        </h2>

        {activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm space-y-2">
            <Bike className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-sm text-gray-700">No Active Deliveries</h3>
            <p className="text-xs text-gray-400">
              New orders placed by Tadikonda residents will automatically appear here.
            </p>
          </div>
        ) : (
          activeDeliveries.map((order) => {
            return (
              <div
                key={order.id}
                className="bg-white p-5 rounded-3xl border-2 border-orange-400 shadow-md space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-gray-950">
                        Order #{order.orderNumber}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Pickup: <strong className="text-gray-900">{order.restaurantName}</strong> ({order.restaurantAddress})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-400 block">Collect Cash:</span>
                    <strong className="text-base font-black text-orange-600">₹{order.total}</strong>
                  </div>
                </div>

                {/* Delivery Drop Address */}
                <div className="bg-orange-50/60 p-3.5 rounded-2xl border border-orange-200/60 text-xs space-y-1">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    <span>Drop: {order.customerName} ({order.customerPhone})</span>
                  </div>
                  <p className="text-gray-700 pl-5">
                    {order.deliveryAddress.doorNo}, {order.deliveryAddress.street}, {order.deliveryAddress.villageArea}, Tadikonda
                  </p>
                  {order.deliveryAddress.landmark && (
                    <p className="text-gray-500 pl-5 text-[11px]">
                      Landmark: {order.deliveryAddress.landmark}
                    </p>
                  )}
                  {order.customerNotes && (
                    <p className="text-amber-800 font-semibold pl-5 text-[11px] pt-1">
                      Note from customer: "{order.customerNotes}"
                    </p>
                  )}
                </div>

                {/* Workflow Actions */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-orange-600 bg-gray-100 hover:bg-orange-50 px-3.5 py-2 rounded-full transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Customer</span>
                  </a>

                  <div className="flex items-center gap-2">
                    {order.status === 'ready_for_pickup' && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            'out_for_delivery',
                            'Partner picked up order, on the way'
                          )
                        }
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Confirm Pickup & Start Delivery</span>
                      </button>
                    )}

                    {order.status === 'out_for_delivery' && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            'delivered',
                            'Handed over to customer in Tadikonda'
                          )
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Delivered (Collect ₹{order.total})</span>
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <span className="text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1.5 rounded-full">
                        Kitchen is still cooking food...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completed Deliveries History */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Completed Deliveries ({completedDeliveries.length})
        </h2>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 text-xs">
          {completedDeliveries.map((order) => (
            <div key={order.id} className="p-4 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-gray-900 block">
                  Order #{order.orderNumber} • {order.restaurantName}
                </span>
                <span className="text-gray-400">
                  Delivered to {order.deliveryAddress.villageArea} • Earned ₹40
                </span>
              </div>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Delivered
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
