import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useToast } from '../../context/ToastContext';
import { Restaurant, MenuItem, OrderStatus, Order, DeliveryPartner } from '../../types';
import { restaurantService, menuService, orderService, deliveryService } from '../../services';
import { StatusBadge, VegBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import {
  Utensils,
  Plus,
  Power,
  Trash2,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Flame,
  Bike,
} from 'lucide-react';

export const RestaurantDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { orders, updateOrderStatus } = useOrders();
  const { showToast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');

  // Add Item Modal state
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('tiffins');
  const [newItemIsVeg, setNewItemIsVeg] = useState(true);
  const [newItemImageUrl, setNewItemImageUrl] = useState('');

  // Delivery Partner Assignment state
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');

  const restaurantId = user?.restaurantId || user?.id || '';

  const openAssignModal = async (order: Order) => {
    setAssigningOrder(order);
    try {
      const partners = await deliveryService.getDeliveryPartners();
      setDeliveryPartners(partners);
      if (partners.length > 0) {
        setSelectedPartnerId(partners[0].userId);
      }
    } catch (e) {
      console.error('Error fetching eligible delivery partners:', e);
      showToast('Could not load online delivery partners', 'error');
    }
  };

  const handleConfirmAssignment = async () => {
    if (!assigningOrder || !selectedPartnerId) return;
    setIsAssigning(true);
    try {
      await orderService.assignDeliveryPartner(assigningOrder.id, selectedPartnerId);
      showToast('Delivery partner assigned successfully!', 'success');
      setAssigningOrder(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assign partner';
      showToast(msg, 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const loadData = async () => {
    if (!restaurantId) return;
    try {
      const rest = await restaurantService.getRestaurantById(restaurantId);
      setRestaurant(rest);
      const actualId = rest?.id || restaurantId;
      const items = await menuService.getMenuItems(actualId);
      setMenuItems(items);
    } catch (e) {
      console.error('Error loading restaurant dashboard data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id, user?.restaurantId]);

  const toggleRestaurantOpen = async () => {
    if (!restaurant) return;
    if (restaurant.status !== 'approved' && restaurant.status !== 'active') {
      showToast('Cannot open store: your restaurant is pending admin approval', 'error');
      return;
    }
    try {
      const updated = await restaurantService.toggleOpenStatus(restaurant.id, !restaurant.isOpen);
      setRestaurant(updated);
      showToast(
        updated.isOpen ? 'Restaurant is now OPEN for orders' : 'Restaurant is now CLOSED',
        'info'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update store status';
      showToast(msg, 'error');
    }
  };

  const handleToggleItemStock = async (item: MenuItem) => {
    await menuService.toggleItemAvailability(item.id, !item.isAvailable);
    showToast(
      `${item.name} marked as ${!item.isAvailable ? 'IN STOCK' : 'OUT OF STOCK'}`,
      'info'
    );
    loadData();
  };

  const handleDeleteItem = async (itemId: string) => {
    await menuService.deleteMenuItem(itemId);
    showToast('Menu item deleted', 'info');
    loadData();
  };

  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || !restaurant) return;

    await menuService.createMenuItem({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      name: newItemName,
      description: newItemDesc,
      price: Number(newItemPrice),
      imageUrl:
        newItemImageUrl ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      category: newItemCategory,
      isVeg: newItemIsVeg,
      isAvailable: true,
      rating: 4.8,
      reviewCount: 1,
      preparationTimeMinutes: 15,
    });

    showToast(`Added ${newItemName} to menu`, 'success');
    setIsAddItemModalOpen(false);
    setNewItemName('');
    setNewItemDesc('');
    setNewItemPrice('');
    loadData();
  };

  // Filter orders for this restaurant
  const restaurantOrders = orders.filter((o) => o.restaurantId === (restaurant?.id || restaurantId));
  const incomingOrders = restaurantOrders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );

  const isApproved = restaurant?.status === 'approved' || restaurant?.status === 'active';

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6">
      {/* Restaurant Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              Kitchen Management Portal
            </span>
            {restaurant?.status && (
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  isApproved
                    ? 'bg-emerald-100 text-emerald-800'
                    : restaurant.status === 'pending_approval'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {restaurant.status === 'pending_approval'
                  ? 'Pending Admin Approval'
                  : restaurant.status === 'rejected'
                  ? 'Registration Rejected'
                  : 'Approved & Active'}
              </span>
            )}
            <span className="text-xs text-gray-400">ID: {restaurant?.id || restaurantId}</span>
          </div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">
            {restaurant?.name || 'Restaurant Dashboard'}
          </h1>
          <p className="text-xs text-gray-500">{restaurant?.fullAddress}</p>
        </div>

        {/* Store Open / Closed Toggle */}
        <button
          onClick={toggleRestaurantOpen}
          disabled={!isApproved}
          title={!isApproved ? 'Store cannot be opened until approved by administrator' : ''}
          className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
            !isApproved
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : restaurant?.isOpen
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-rose-600 text-white hover:bg-rose-700'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>
            {!isApproved
              ? 'Approval Pending'
              : restaurant?.isOpen
              ? 'Store is OPEN'
              : 'Store is CLOSED'}
          </span>
        </button>
      </div>

      {/* Approval Status Alerts */}
      {restaurant?.status === 'pending_approval' && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-950">Registration Under Admin Review</h4>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              Your restaurant application is currently awaiting administrator verification. Once an administrator approves your merchant profile from the admin control center, your shop will be activated for customer orders across Tadikonda.
            </p>
          </div>
        </div>
      )}

      {restaurant?.status === 'rejected' && (
        <div className="bg-rose-50/80 border border-rose-200 rounded-3xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-950">Registration Application Rejected</h4>
            <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
              Your restaurant registration was not approved. Please contact platform administrators or reach out to support to verify your business credentials.
            </p>
          </div>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-black text-gray-950">{incomingOrders.length}</div>
          <div className="text-xs text-gray-500 font-medium mt-0.5">Active Orders</div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-black text-orange-600">
            ₹
            {restaurantOrders
              .filter((o) => o.status === 'delivered')
              .reduce((sum, o) => sum + o.subtotal, 0)}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-0.5">Total Sales</div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm text-center">
          <div className="text-2xl font-black text-gray-950">{menuItems.length}</div>
          <div className="text-xs text-gray-500 font-medium mt-0.5">Menu Items</div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'orders'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Incoming Kitchen Orders ({incomingOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'menu'
              ? 'text-orange-600 border-b-2 border-orange-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Menu Management ({menuItems.length})</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {restaurantOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-2">
              <p className="text-xs text-gray-500">No orders received for this restaurant yet.</p>
            </div>
          ) : (
            restaurantOrders.map((order) => {
              return (
                <div
                  key={order.id}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-extrabold text-gray-950">
                          Order #{order.orderNumber}
                        </h2>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Customer: <strong className="text-gray-900">{order.customerName}</strong> ({order.customerPhone})
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Deliver to: {order.deliveryAddress.villageArea}, Tadikonda
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-gray-950">₹{order.total}</div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI Demo'}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-gray-50 p-3 rounded-2xl text-xs space-y-1">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between font-medium text-gray-700">
                        <span>{i.quantity} × {i.name}</span>
                        <span>₹{(i.price * i.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.customerNotes && (
                      <div className="text-[11px] text-amber-700 font-semibold pt-1 border-t border-gray-200">
                        Note: "{order.customerNotes}"
                      </div>
                    )}
                  </div>

                  {/* Action Workflow Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    {order.status === 'placed' && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, 'confirmed', 'Restaurant accepted order')
                        }
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2 rounded-full shadow-sm transition-all"
                      >
                        Accept Order
                      </button>
                    )}

                    {order.status === 'confirmed' && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, 'preparing', 'Chef started cooking food')
                        }
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-full shadow-sm transition-all"
                      >
                        Start Cooking
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            'ready_for_pickup',
                            'Packed and ready for delivery partner'
                          )
                        }
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-full shadow-sm transition-all"
                      >
                        Mark Ready for Pickup
                      </button>
                    )}

                    {order.status === 'ready_for_pickup' && (
                      !order.deliveryPartnerId ? (
                        <button
                          onClick={() => openAssignModal(order)}
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-full shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Bike className="w-3.5 h-3.5" />
                          <span>Assign Delivery Partner</span>
                        </button>
                      ) : (
                        <span className="text-xs text-purple-700 font-bold bg-purple-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                          <Bike className="w-3.5 h-3.5" />
                          <span>Assigned to {order.deliveryPartnerName}</span>
                        </span>
                      )
                    )}

                    {order.status === 'out_for_delivery' && (
                      <span className="text-xs text-orange-700 font-bold bg-orange-50 px-3 py-1.5 rounded-full">
                        Out for Delivery by {order.deliveryPartnerName}
                      </span>
                    )}

                    {order.status === 'delivered' && (
                      <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed & Delivered
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Menu Management */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Dishes & Menu Items
            </h2>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddItemModalOpen(true)}
            >
              Add New Dish
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <VegBadge isVeg={item.isVeg} />
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                        {item.name}
                      </h4>
                    </div>
                    <div className="text-xs font-black text-gray-950">₹{item.price}</div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleItemStock(item)}
                    className="text-xs font-bold text-gray-700 hover:text-orange-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    {item.isAvailable ? 'Mark Sold Out' : 'Mark In Stock'}
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-gray-400 hover:text-rose-600 p-1"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      <Modal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add New Dish to Menu"
        maxWidth="md"
      >
        <form onSubmit={handleAddNewItem} className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-600 font-semibold mb-1">Dish Name</label>
            <input
              type="text"
              placeholder="e.g. MLA Pesarattu Upma"
              required
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Crispy whole green gram moong dosa served with ginger pachadi..."
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Price (₹)</label>
              <input
                type="number"
                placeholder="90"
                required
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Category</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
              >
                <option value="tiffins">Tiffins</option>
                <option value="biryani">Biryani</option>
                <option value="meals">Andhra Meals</option>
                <option value="snacks">Snacks & Bajji</option>
                <option value="sweets">Sweets & Bakery</option>
                <option value="beverages">Beverages</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 py-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="vegOption"
                checked={newItemIsVeg}
                onChange={() => setNewItemIsVeg(true)}
                className="text-emerald-600"
              />
              <span className="font-bold text-gray-700">Pure Veg</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="vegOption"
                checked={!newItemIsVeg}
                onChange={() => setNewItemIsVeg(false)}
                className="text-rose-600"
              />
              <span className="font-bold text-gray-700">Non-Veg</span>
            </label>
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={newItemImageUrl}
              onChange={(e) => setNewItemImageUrl(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsAddItemModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Dish
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Delivery Partner Modal */}
      <Modal
        isOpen={Boolean(assigningOrder)}
        onClose={() => setAssigningOrder(null)}
        title={`Assign Delivery Partner (Order #${assigningOrder?.orderNumber})`}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-gray-500">
            Select an approved, online delivery partner from the Tadikonda delivery fleet to dispatch this order.
          </p>

          {deliveryPartners.length === 0 ? (
            <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
              <Bike className="w-8 h-8 text-gray-400 mx-auto" />
              <p className="font-bold text-gray-700">No Delivery Partners Online</p>
              <p className="text-[11px] text-gray-400">
                All approved partners are currently offline. You can keep the food packed and assign as soon as a partner checks in.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {deliveryPartners.map((dp) => (
                <label
                  key={dp.userId}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedPartnerId === dp.userId
                      ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery_partner"
                      value={dp.userId}
                      checked={selectedPartnerId === dp.userId}
                      onChange={() => setSelectedPartnerId(dp.userId)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <div className="font-extrabold text-sm text-gray-900">{dp.name}</div>
                      <div className="text-[11px] text-gray-500">
                        {dp.vehicleType} ({dp.vehicleNumber}) • Phone: {dp.phone}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Online
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setAssigningOrder(null)}
            >
              Cancel
            </Button>
            {deliveryPartners.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                type="button"
                disabled={!selectedPartnerId || isAssigning}
                isLoading={isAssigning}
                onClick={handleConfirmAssignment}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Confirm Assignment
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};
