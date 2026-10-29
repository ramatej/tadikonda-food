import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { CartItemRow } from '../../components/cart/CartItemRow';
import { DEMO_VOUCHERS } from '../../config/constants';
import {
  ArrowLeft,
  MoreVertical,
  Ticket,
  ChevronRight,
  Trash2,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  X,
  Bike,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { PaymentSelectionModal } from '../../components/payment/PaymentSelectionModal';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart, applyVoucher, removeVoucher } = useCart();
  const [voucherInput, setVoucherInput] = useState('');
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleApplyVoucherCode = (code: string) => {
    setVoucherError('');
    const res = applyVoucher(code);
    if (!res.success) {
      setVoucherError(res.message);
    } else {
      setIsVoucherModalOpen(false);
      setVoucherInput('');
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-24 h-24 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto">
          Explore delicious tiffins, fragrant biryanis, and traditional Andhra sweets in Tadikonda!
        </p>
        <div className="pt-2">
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-8 py-3.5 rounded-full text-sm shadow-lg shadow-orange-500/25 transition-transform active:scale-95"
          >
            <span>Browse Restaurants</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-32 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-black text-gray-950 tracking-tight">Cart</h1>

        <button
          onClick={() => setIsClearConfirmOpen(true)}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
          aria-label="Cart options"
          title="Clear Cart"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Restaurant Info Pill */}
      <div className="bg-orange-50/70 border border-orange-200/80 p-3.5 rounded-2xl flex items-center justify-between text-xs">
        <div>
          <span className="text-gray-500 font-medium block">Ordering from:</span>
          <span className="font-extrabold text-orange-950 text-sm">
            {cart.restaurantName}
          </span>
        </div>
        <button
          onClick={() => setIsClearConfirmOpen(true)}
          className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Cart Items List Container */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-sm space-y-1">
        {cart.items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

      {/* Voucher Input Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
        {cart.voucherCode ? (
          <div className="flex items-center justify-between bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-extrabold text-xs block uppercase">
                  {cart.voucherCode} Applied
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  You saved ₹{cart.discount.toFixed(2)} on this order!
                </span>
              </div>
            </div>
            <button
              onClick={removeVoucher}
              className="p-1 text-emerald-700 hover:text-emerald-900 rounded-full hover:bg-emerald-100 transition-colors"
              title="Remove voucher"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsVoucherModalOpen(true)}
            className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded-xl transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Ticket className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-700">
                Enter your voucher code
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Summary Breakdown */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Subtotal:</span>
          <span className="font-bold text-gray-900">₹{cart.subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <span>Delivery Fee:</span>
            <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.2 rounded">
              Village Fixed
            </span>
          </div>
          <span className="font-bold text-gray-900">₹{cart.deliveryFee.toFixed(2)}</span>
        </div>

        {cart.discount > 0 && (
          <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold">
            <span>Voucher Discount:</span>
            <span>-₹{cart.discount.toFixed(2)}</span>
          </div>
        )}

        {/* Dashed Separator Line */}
        <div className="border-b border-dashed border-gray-300 my-2" />

        <div className="flex items-center justify-between text-sm sm:text-base font-black text-gray-950">
          <span>Total Amount:</span>
          <span>₹{cart.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Village Delivery Guarantee Notice */}
      <div className="bg-gray-50 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-gray-500 border border-gray-200">
        <Bike className="w-4 h-4 text-orange-600 shrink-0" />
        <span>Delivering in Tadikonda village in 20-25 mins with live status tracking.</span>
      </div>

      {/* Sticky Bottom Bar with Prominent Proceed to Payment Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {/* Orange Total Amount Pill */}
          <div className="bg-orange-600 text-white font-black text-sm sm:text-base px-6 py-3.5 rounded-full shadow-lg shadow-orange-500/25 shrink-0">
            ₹{cart.total.toFixed(2)}
          </div>

          {/* Prominent Proceed to Payment Pill Button */}
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-6 rounded-full transition-all text-sm shadow-lg shadow-orange-500/25 active:scale-95 text-center flex items-center justify-center gap-2"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voucher Code Selection Modal */}
      <Modal
        isOpen={isVoucherModalOpen}
        onClose={() => {
          setIsVoucherModalOpen(false);
          setVoucherError('');
        }}
        title="Apply Promo Voucher"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (voucherInput.trim()) {
                handleApplyVoucherCode(voucherInput.trim());
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Enter voucher code (e.g. TADIKONDA50)"
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
              className="flex-1 uppercase bg-gray-50 text-xs sm:text-sm font-bold p-3 rounded-2xl border border-gray-300 focus:border-orange-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-sm transition-colors"
            >
              Apply
            </button>
          </form>

          {voucherError && (
            <p className="text-xs text-rose-600 font-medium">{voucherError}</p>
          )}

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 uppercase">Available Offers</h4>
            {DEMO_VOUCHERS.map((voucher) => (
              <div
                key={voucher.code}
                onClick={() => handleApplyVoucherCode(voucher.code)}
                className="p-3 rounded-2xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <span className="font-extrabold text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md inline-block mb-1">
                    {voucher.code}
                  </span>
                  <p className="text-xs font-semibold text-gray-900">{voucher.description}</p>
                  <p className="text-[10px] text-gray-400">Min order ₹{voucher.minimumOrder}</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-extrabold text-orange-600 hover:underline shrink-0"
                >
                  APPLY
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Clear Cart Confirmation Modal */}
      <Modal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        title="Clear your cart?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-center py-2">
          <p className="text-xs text-gray-600">
            Are you sure you want to remove all items from your cart?
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsClearConfirmOpen(false)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                clearCart();
                setIsClearConfirmOpen(false);
              }}
              className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm"
            >
              Yes, Clear Cart
            </button>
          </div>
        </div>
      </Modal>

      {/* Four-Option Payment Selection Modal */}
      <PaymentSelectionModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onBack={() => setIsPaymentModalOpen(false)}
        totalAmount={cart.total}
        onSelectCOD={() => {
          setIsPaymentModalOpen(false);
          navigate('/checkout');
        }}
      />
    </div>
  );
};
