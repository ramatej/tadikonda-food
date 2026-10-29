import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export type PaymentMethodType = 'gpay' | 'phonepe' | 'paytm' | 'cod';

interface PaymentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  totalAmount: number;
  onSelectCOD: () => void;
  isSubmitting?: boolean;
}

export const PaymentSelectionModal: React.FC<PaymentSelectionModalProps> = ({
  isOpen,
  onClose,
  onBack,
  totalAmount,
  onSelectCOD,
  isSubmitting = false,
}) => {
  const { showToast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('cod');
  const [onlineWarning, setOnlineWarning] = useState<string | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset state on open
      setSelectedMethod('cod');
      setOnlineWarning(null);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectOption = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    if (method === 'cod') {
      setOnlineWarning(null);
    } else {
      const names: Record<PaymentMethodType, string> = {
        gpay: 'Google Pay',
        phonepe: 'PhonePe',
        paytm: 'Paytm',
        cod: 'Cash on Delivery',
      };
      const name = names[method];
      const message = `Online payment via ${name} is currently under integration. Please proceed with Cash on Delivery (COD) for orders in Tadikonda.`;
      setOnlineWarning(message);
      showToast(`Online payment with ${name} is not yet active. Please use COD.`, 'info');
    }
  };

  const handleProceed = () => {
    if (selectedMethod === 'cod') {
      onSelectCOD();
    } else {
      const names: Record<PaymentMethodType, string> = {
        gpay: 'Google Pay',
        phonepe: 'PhonePe',
        paytm: 'Paytm',
        cod: 'Cash on Delivery',
      };
      showToast(`Online payments via ${names[selectedMethod]} are not yet available. Please select Cash on Delivery.`, 'error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-selection-title"
    >
      {/* Backdrop click to close */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog / Mobile Bottom Sheet */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 transition-all max-h-[92vh] flex flex-col border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack || onClose}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 id="payment-selection-title" className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                Select Payment Method
              </h2>
              <p className="text-[11px] text-gray-500 font-medium">Safe & contactless options</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* Final Order Total Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-orange-100 block">
                Final Order Total
              </span>
              <span className="text-2xl font-black">₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Tadikonda Verified</span>
            </div>
          </div>

          {/* Payment Method Cards */}
          <div className="space-y-2.5" role="radiogroup" aria-label="Available payment methods">
            {/* 1. Google Pay */}
            <div
              role="radio"
              aria-checked={selectedMethod === 'gpay'}
              tabIndex={0}
              onClick={() => handleSelectOption('gpay')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectOption('gpay');
                }
              }}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedMethod === 'gpay'
                  ? 'border-orange-500 bg-orange-50/40 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA3323"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm text-gray-900">Google Pay</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                      Integration in progress
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">Pay via Google Pay UPI</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'gpay'
                    ? 'border-orange-600 bg-orange-600 text-white'
                    : 'border-gray-300'
                }`}
              >
                {selectedMethod === 'gpay' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* 2. PhonePe */}
            <div
              role="radio"
              aria-checked={selectedMethod === 'phonepe'}
              tabIndex={0}
              onClick={() => handleSelectOption('phonepe')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectOption('phonepe');
                }
              }}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedMethod === 'phonepe'
                  ? 'border-orange-500 bg-orange-50/40 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5f259f] shadow-sm flex items-center justify-center shrink-0 text-white font-black text-sm">
                  पे
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm text-gray-900">PhonePe</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                      Integration in progress
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">Pay via PhonePe UPI</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'phonepe'
                    ? 'border-orange-600 bg-orange-600 text-white'
                    : 'border-gray-300'
                }`}
              >
                {selectedMethod === 'phonepe' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* 3. Paytm */}
            <div
              role="radio"
              aria-checked={selectedMethod === 'paytm'}
              tabIndex={0}
              onClick={() => handleSelectOption('paytm')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectOption('paytm');
                }
              }}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedMethod === 'paytm'
                  ? 'border-orange-500 bg-orange-50/40 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#002970] shadow-sm flex items-center justify-center shrink-0 text-white font-black text-[11px] tracking-tight">
                  <span className="text-[#00BAF2]">Pay</span>tm
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm text-gray-900">Paytm</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                      Integration in progress
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">Pay via Paytm UPI or Wallet</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'paytm'
                    ? 'border-orange-600 bg-orange-600 text-white'
                    : 'border-gray-300'
                }`}
              >
                {selectedMethod === 'paytm' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* 4. Cash on Delivery */}
            <div
              role="radio"
              aria-checked={selectedMethod === 'cod'}
              tabIndex={0}
              onClick={() => handleSelectOption('cod')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectOption('cod');
                }
              }}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedMethod === 'cod'
                  ? 'border-orange-500 bg-orange-50/40 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white shadow-sm flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">Pay cash upon delivery in Tadikonda</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'cod'
                    ? 'border-orange-600 bg-orange-600 text-white'
                    : 'border-gray-300'
                }`}
              >
                {selectedMethod === 'cod' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>

          {/* Online integration message if an online option is selected */}
          {onlineWarning && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Online Payment Not Yet Available</p>
                <p className="leading-relaxed text-amber-800">{onlineWarning}</p>
                <button
                  type="button"
                  onClick={() => handleSelectOption('cod')}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-black text-orange-700 hover:underline"
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Switch to Cash on Delivery</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/70 shrink-0">
          {selectedMethod === 'cod' ? (
            <button
              type="button"
              onClick={handleProceed}
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-extrabold py-3.5 px-6 rounded-full transition-all text-sm shadow-md shadow-orange-500/25 active:scale-95 text-center flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Processing...'
                  : `Proceed with Cash on Delivery (₹${totalAmount.toFixed(2)})`}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSelectOption('cod')}
              className="w-full bg-orange-100 hover:bg-orange-200 text-orange-900 font-extrabold py-3.5 px-6 rounded-full transition-all text-sm text-center flex items-center justify-center gap-2 active:scale-95"
            >
              <Banknote className="w-4 h-4 text-orange-700" />
              <span>Select Cash on Delivery to Proceed</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
