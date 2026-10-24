import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { Address } from '../../types';
import { addressService } from '../../services';
import { TADIKONDA_LOCALITIES, APP_CONFIG } from '../../config/constants';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  ArrowLeft,
  MapPin,
  Plus,
  ShieldAlert,
  Banknote,
  QrCode,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { placeOrder } = useOrders();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi_demo'>('cod');
  const [isNewAddressModalOpen, setIsNewAddressModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Address form state
  const [doorNo, setDoorNo] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [villageArea, setVillageArea] = useState(TADIKONDA_LOCALITIES[0]);
  const [addressLabel, setAddressLabel] = useState<'Home' | 'Work' | 'Other'>('Home');

  useEffect(() => {
    if (!user) return;
    addressService.getUserAddresses(user.id).then((list) => {
      setAddresses(list);
      const defaultAddr = list.find((a) => a.isDefault) || list[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    });
  }, [user?.id]);

  if (cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doorNo || !street) return;

    const created = await addressService.addAddress({
      userId: user?.id ?? '',
      label: addressLabel,
      doorNo,
      street,
      landmark,
      villageArea,
      pincode: APP_CONFIG.pincode,
      isDefault: addresses.length === 0,
    });

    const updated = await addressService.getUserAddresses(user?.id ?? '');
    setAddresses(updated);
    setSelectedAddressId(created.id);
    setIsNewAddressModalOpen(false);

    // Reset form
    setDoorNo('');
    setStreet('');
    setLandmark('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setIsNewAddressModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cart.items.map((i) => ({
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        isVeg: i.isVeg,
        imageUrl: i.imageUrl,
      }));

      const newOrder = await placeOrder(
        orderItems,
        cart.restaurantId!,
        cart.restaurantName!,
        selectedAddress,
        cart.subtotal,
        cart.deliveryFee,
        cart.discount,
        cart.total,
        paymentMethod,
        customerNotes,
        cart.voucherCode
      );

      clearCart();
      navigate(`/orders/${newOrder.id}`);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/cart')}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">Checkout</h1>
          <p className="text-xs text-gray-500">Completing order for {cart.restaurantName}</p>
        </div>
      </div>

      {/* 1. Customer Details */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          1. Contact Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-gray-500 font-medium mb-1">Customer Name</label>
            <input
              type="text"
              value={user?.name ?? ''}
              readOnly
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-2.5 text-gray-900 font-bold"
            />
          </div>
          <div>
            <label className="block text-gray-500 font-medium mb-1">Phone Number (+91)</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+91 94401 23456"
              className="w-full bg-white border border-gray-300 rounded-2xl p-2.5 text-gray-900 font-bold focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Delivery Address */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            2. Delivery Address (Tadikonda)
          </h2>
          <button
            onClick={() => setIsNewAddressModalOpen(true)}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>

        <div className="space-y-2">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;
            return (
              <div
                key={addr.id}
                onClick={() => setSelectedAddressId(addr.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-gray-900">{addr.label}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                      {addr.villageArea}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {addr.doorNo}, {addr.street}
                    {addr.landmark ? `, Landmark: ${addr.landmark}` : ''}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">Tadikonda, AP - {addr.pincode}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Delivery Instructions / Notes for Partner
          </label>
          <input
            type="text"
            placeholder="e.g. Leave with security, call when outside, near temple tank"
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            className="w-full text-xs bg-gray-50 border border-gray-200 rounded-2xl p-2.5 focus:bg-white focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Payment Option (Deferred integration notice) */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          3. Payment Mode (Phase 1 Prototype)
        </h2>

        {/* Clear Notice about Deferred Payment */}
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Payment Gateway Integration is Deferred:</strong> Real transactions and online payment processing will be connected with Supabase in the next phase. The order below is created as a demo order for workflow testing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label
            className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
              paymentMethod === 'cod'
                ? 'border-orange-500 bg-orange-50/50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === 'cod'}
              onChange={() => setPaymentMethod('cod')}
              className="text-orange-600 focus:ring-orange-500"
            />
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold text-xs text-gray-900 block">
                  Cash on Delivery (COD)
                </span>
                <span className="text-[10px] text-gray-500">Pay cash upon delivery in Tadikonda</span>
              </div>
            </div>
          </label>

          <label
            className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
              paymentMethod === 'upi_demo'
                ? 'border-orange-500 bg-orange-50/50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === 'upi_demo'}
              onChange={() => setPaymentMethod('upi_demo')}
              className="text-orange-600 focus:ring-orange-500"
            />
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-bold text-xs text-gray-900 block">
                  UPI (GPay/PhonePe Demo)
                </span>
                <span className="text-[10px] text-gray-500">Simulated UPI transfer</span>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* 4. Order Summary Card */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          4. Order Bill Breakdown
        </h2>

        <div className="space-y-1.5 text-xs">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between text-gray-700">
              <span>{item.quantity} × {item.name}</span>
              <span className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Item Subtotal</span>
            <span className="font-bold text-gray-900">₹{cart.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span className="flex items-center gap-1">
              Fixed Delivery Charge
              <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded">
                Tadikonda Flat Rate
              </span>
            </span>
            <span className="font-bold text-gray-900">₹{cart.deliveryFee.toFixed(2)}</span>
          </div>

          {cart.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Promo Discount ({cart.voucherCode})</span>
              <span>-₹{cart.discount.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t border-dashed border-gray-300 pt-2 flex justify-between text-base font-black text-gray-950">
            <span>Total Payable Amount</span>
            <span>₹{cart.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Place Order CTA Button */}
      <Button
        variant="pill-primary"
        size="lg"
        onClick={handlePlaceOrder}
        isLoading={isSubmitting}
        className="w-full text-base py-4 flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        <span>Place Order (₹{cart.total.toFixed(2)})</span>
      </Button>

      {/* Add New Address Modal */}
      <Modal
        isOpen={isNewAddressModalOpen}
        onClose={() => setIsNewAddressModalOpen(false)}
        title="Add Tadikonda Delivery Address"
        maxWidth="md"
      >
        <form onSubmit={handleAddNewAddress} className="space-y-3 text-xs">
          <div className="flex gap-2 mb-2">
            {(['Home', 'Work', 'Other'] as const).map((lbl) => (
              <button
                type="button"
                key={lbl}
                onClick={() => setAddressLabel(lbl)}
                className={`flex-1 py-2 rounded-xl font-bold transition-colors ${
                  addressLabel === lbl
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Door Number / Flat / House</label>
            <input
              type="text"
              placeholder="e.g. D.No 3-45"
              required
              value={doorNo}
              onChange={(e) => setDoorNo(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Street / Colony Name</label>
            <input
              type="text"
              placeholder="e.g. Ramalayam Street, Near Water Tank"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Landmark (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Opposite Syndicate Bank / Behind School"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">Tadikonda Locality Area</label>
            <select
              value={villageArea}
              onChange={(e) => setVillageArea(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none font-medium"
            >
              {TADIKONDA_LOCALITIES.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsNewAddressModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
