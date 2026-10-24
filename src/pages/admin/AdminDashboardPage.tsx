import React, { useState, useEffect } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { Restaurant, PlatformSettings, DeliveryPartner } from '../../types';
import { restaurantService, adminService, deliveryService } from '../../services';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/Badge';
import {
  Shield,
  Check,
  X,
  Eye,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { orders, updateOrderStatus } = useOrders();
  const { showToast } = useToast();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [inspectingRestaurant, setInspectingRestaurant] = useState<Restaurant | null>(null);
  const [pendingDeliveryPartners, setPendingDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [settings, setSettings] = useState<PlatformSettings>({
    deliveryFee: 20,
    platformOpen: true,
    freeDeliveryThreshold: 499,
    serviceTaxPercentage: 0,
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'orders' | 'settings'>('overview');

  const loadAdminData = async () => {
    try {
      const rests = await restaurantService.getAllRestaurants();
      setRestaurants(rests);
      const sets = await adminService.getSettings();
      setSettings(sets);
      const pendingDps = await deliveryService.getPendingDeliveryPartners();
      setPendingDeliveryPartners(pendingDps);
    } catch (e) {
      console.error('Error loading admin data:', e);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingRestaurants = restaurants.filter((r) => r.status === 'pending_approval');
  const activeRestaurants = restaurants.filter((r) => r.status === 'active' || r.status === 'approved');

  const handleApproveRestaurant = async (restaurantId: string) => {
    setIsProcessing(restaurantId);
    try {
      await adminService.updateRestaurantStatus(restaurantId, 'approved');
      showToast('Restaurant approved and activated on platform!', 'success');
      setInspectingRestaurant(null);
      await loadAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve restaurant';
      showToast(msg, 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectRestaurant = async (restaurantId: string) => {
    setIsProcessing(restaurantId);
    try {
      await adminService.updateRestaurantStatus(restaurantId, 'rejected');
      showToast('Restaurant registration rejected', 'info');
      setInspectingRestaurant(null);
      await loadAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject restaurant';
      showToast(msg, 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  // Approve delivery partner
  const handleApproveDeliveryPartner = async (partnerId: string) => {
    setIsProcessing(partnerId);
    try {
      await deliveryService.setDeliveryPartnerStatus(partnerId, 'approved');
      showToast('Delivery partner approved', 'success');
      await loadAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve delivery partner';
      showToast(msg, 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  // Reject delivery partner
  const handleRejectDeliveryPartner = async (partnerId: string) => {
    setIsProcessing(partnerId);
    try {
      await deliveryService.setDeliveryPartnerStatus(partnerId, 'rejected');
      showToast('Delivery partner rejected', 'info');
      await loadAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject delivery partner';
      showToast(msg, 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.updateSettings(settings);
    showToast('Platform settings updated successfully', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Administrative Control Center
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            Tadikonda Food Platform Admin
          </h1>
          <p className="text-xs text-gray-500">
            Monitoring food orders, merchant shops, and delivery logistics in Tadikonda
          </p>
        </div>

        <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">
          Platform Active
        </span>
      </div>

      {/* Overview Cards (Dynamically computed from mock state) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-xs font-medium">Total Platform Volume</div>
          <div className="text-2xl font-black text-orange-600 mt-1">₹{totalRevenue.toFixed(2)}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">From {orders.length} orders</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-xs font-medium">Active Restaurants</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{activeRestaurants.length}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
            {pendingRestaurants.length} pending approval
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-xs font-medium">Orders Placed</div>
          <div className="text-2xl font-black text-gray-900 mt-1">{orders.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Live in Tadikonda</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="text-gray-400 text-xs font-medium">Standard Delivery Fee</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">₹{settings.deliveryFee}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Fixed village rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Merchants & Approvals' },
          { id: 'orders', label: `All Orders (${orders.length})` },
          { id: 'settings', label: 'Platform Config' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-4 text-xs font-bold transition-all relative ${
              activeTab === tab.id
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Merchants & Approvals */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Pending Approval Section */}
          {pendingRestaurants.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-3xl space-y-3">
              <h2 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                Pending Restaurant Registrations ({pendingRestaurants.length})
              </h2>
              <div className="space-y-2">
                {pendingRestaurants.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white p-4 rounded-2xl border border-amber-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">{r.name}</h4>
                      <p className="text-xs text-gray-500">{r.fullAddress} • Phone: {r.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectingRestaurant(r)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span>Inspect</span>
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing === r.id}
                        onClick={() => handleRejectRestaurant(r.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs flex items-center gap-1 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing === r.id}
                        onClick={() => handleApproveRestaurant(r.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isProcessing === r.id ? 'Approving...' : 'Approve Merchant'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Delivery Partners Section */}
          {pendingDeliveryPartners.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-3xl space-y-3">
              <h2 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                Pending Delivery Partner Registrations ({pendingDeliveryPartners.length})
              </h2>
              <div className="space-y-2">
                {pendingDeliveryPartners.map((p) => (
                  <div key={p.id} className="bg-white p-4 rounded-2xl border border-amber-200 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">{p.name}</h4>
                      <p className="text-xs text-gray-500">Phone: {p.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isProcessing === p.id}
                        onClick={() => handleApproveDeliveryPartner(p.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isProcessing === p.id ? 'Approving...' : 'Approve Partner'}</span>
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing === p.id}
                        onClick={() => handleRejectDeliveryPartner(p.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs flex items-center gap-1 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* All Restaurants List */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Enrolled Food Shops in Tadikonda ({restaurants.length})
            </h2>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 text-xs">
              {restaurants.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="w-12 h-12 rounded-2xl object-cover shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{r.name}</h3>
                      <p className="text-gray-400">{r.locationArea} • {r.cuisine.join(', ')}</p>
                      <p className="text-[11px] text-gray-500">Owner ID: {r.ownerId} • Phone: {r.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold px-2.5 py-1 rounded-full uppercase text-[10px] ${
                        r.status === 'active' || r.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'pending_approval'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-gray-700">★ {r.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Restaurant</th>
                  <th className="p-4">Drop Area</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-mono font-bold text-gray-900">#{o.orderNumber}</td>
                    <td className="p-4">{o.customerName}</td>
                    <td className="p-4 font-bold text-gray-900">{o.restaurantName}</td>
                    <td className="p-4">{o.deliveryAddress.villageArea}</td>
                    <td className="p-4 font-black text-gray-950">₹{o.total}</td>
                    <td className="p-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="p-4">
                      {o.status !== 'delivered' && o.status !== 'cancelled' && (
                        <button
                          onClick={() => updateOrderStatus(o.id, 'delivered', 'Admin marked as delivered')}
                          className="text-[11px] font-bold text-orange-600 hover:underline"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Platform Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm max-w-xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Configure Platform Parameters
          </h2>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Fixed Village Delivery Fee (₹)
              </label>
              <input
                type="number"
                value={settings.deliveryFee}
                onChange={(e) =>
                  setSettings({ ...settings, deliveryFee: Number(e.target.value) })
                }
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Standard charge applied to all deliveries in Tadikonda (Prompt requirement: ₹20).
              </span>
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">
                Free Delivery Order Threshold (₹)
              </label>
              <input
                type="number"
                value={settings.freeDeliveryThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })
                }
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
              />
            </div>

            <div className="pt-2">
              <Button variant="primary" size="md" type="submit">
                Save Platform Settings
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Inspect Pending Restaurant Modal */}
      <Modal
        isOpen={Boolean(inspectingRestaurant)}
        onClose={() => setInspectingRestaurant(null)}
        title="Review Restaurant Registration"
        maxWidth="md"
      >
        {inspectingRestaurant && (
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <img
                src={inspectingRestaurant.imageUrl}
                alt={inspectingRestaurant.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-gray-950">{inspectingRestaurant.name}</h3>
                {inspectingRestaurant.tagline && (
                  <p className="text-gray-500 italic text-[11px] mt-0.5">"{inspectingRestaurant.tagline}"</p>
                )}
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase">
                  Pending Verification
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-2xl border border-gray-100">
              <div>
                <span className="text-gray-400 font-medium block">Locality Area</span>
                <span className="font-semibold text-gray-900">{inspectingRestaurant.locationArea}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Contact Phone</span>
                <span className="font-semibold text-gray-900 font-mono">{inspectingRestaurant.phone}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Cuisines</span>
                <span className="font-semibold text-gray-900">{inspectingRestaurant.cuisine.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Price for Two</span>
                <span className="font-semibold text-gray-900">₹{inspectingRestaurant.priceForTwo}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 font-medium block">Full Address</span>
                <span className="font-semibold text-gray-900">{inspectingRestaurant.fullAddress}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 font-medium block">Owner Account ID</span>
                <span className="font-mono text-gray-600 text-[10px] select-all">{inspectingRestaurant.ownerId || 'N/A'}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setInspectingRestaurant(null)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="text-rose-600 hover:bg-rose-50 border-rose-200"
                disabled={isProcessing === inspectingRestaurant.id}
                onClick={() => handleRejectRestaurant(inspectingRestaurant.id)}
              >
                Reject Application
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="button"
                disabled={isProcessing === inspectingRestaurant.id}
                onClick={() => handleApproveRestaurant(inspectingRestaurant.id)}
              >
                {isProcessing === inspectingRestaurant.id ? 'Approving...' : 'Approve & Activate'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
