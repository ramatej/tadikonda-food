import React from 'react';
import { DEMO_VOUCHERS } from '../../config/constants';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Ticket, Copy, Check, Sparkles, Percent } from 'lucide-react';

export const OffersPage: React.FC = () => {
  const { applyVoucher, cart } = useCart();
  const { showToast } = useToast();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Copied code: ${code}`, 'success');
  };

  const handleApply = (code: string) => {
    const res = applyVoucher(code);
    if (!res.success) {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-950 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-orange-600" />
          <span>Offers & Promo Vouchers</span>
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Save on your breakfast, lunch, and dinner in Tadikonda
        </p>
      </div>

      <div className="space-y-4">
        {DEMO_VOUCHERS.map((voucher) => {
          const isApplied = cart.voucherCode === voucher.code;

          return (
            <div
              key={voucher.code}
              className={`bg-white rounded-3xl p-5 border shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isApplied ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <Percent className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-sm text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-lg tracking-wider">
                      {voucher.code}
                    </span>
                    {isApplied && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Applied
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{voucher.description}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Valid on orders above ₹{voucher.minimumOrder} from any Tadikonda restaurant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleCopy(voucher.code)}
                  className="p-2 text-gray-500 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors"
                  title="Copy Code"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleApply(voucher.code)}
                  disabled={isApplied}
                  className={`text-xs font-extrabold px-5 py-2.5 rounded-full transition-all shadow-sm ${
                    isApplied
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95'
                  }`}
                >
                  {isApplied ? 'Applied' : 'Apply Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
