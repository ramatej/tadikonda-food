import React from 'react';
import { OrderStatus } from '../../types';
import {
  CheckCircle2,
  Clock,
  Utensils,
  Package,
  Bike,
  Home,
  XCircle,
} from 'lucide-react';

interface OrderStatusTimelineProps {
  status: OrderStatus;
  statusHistory?: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  status,
  statusHistory = [],
}) => {
  const steps: { status: OrderStatus; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      status: 'placed',
      label: 'Order Placed',
      icon: <Clock className="w-4 h-4" />,
      desc: 'Order received & sent to restaurant',
    },
    {
      status: 'confirmed',
      label: 'Order Confirmed',
      icon: <CheckCircle2 className="w-4 h-4" />,
      desc: 'Restaurant accepted your order',
    },
    {
      status: 'preparing',
      label: 'Cooking Food',
      icon: <Utensils className="w-4 h-4" />,
      desc: 'Chef is preparing fresh hot food',
    },
    {
      status: 'ready_for_pickup',
      label: 'Ready & Packed',
      icon: <Package className="w-4 h-4" />,
      desc: 'Food packed, waiting for delivery partner',
    },
    {
      status: 'out_for_delivery',
      label: 'Out for Delivery',
      icon: <Bike className="w-4 h-4" />,
      desc: 'Delivery partner on the way in Tadikonda',
    },
    {
      status: 'delivered',
      label: 'Delivered',
      icon: <Home className="w-4 h-4" />,
      desc: 'Enjoy your hot meal!',
    },
  ];

  if (status === 'cancelled') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex items-center gap-4 text-rose-800">
        <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
        <div>
          <h4 className="font-bold text-base">Order Cancelled</h4>
          <p className="text-xs text-rose-600 mt-1">
            This order has been cancelled. If payment was made, full refund will be processed.
          </p>
        </div>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.status === status);

  return (
    <div className="space-y-6">
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const historyEntry = statusHistory.find((h) => h.status === step.status);

          return (
            <div key={step.status} className="relative flex items-start gap-4">
              {/* Step indicator node */}
              <div
                className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  isCurrent
                    ? 'bg-orange-600 text-white ring-4 ring-orange-100 scale-110'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                {step.icon}
              </div>

              {/* Step content */}
              <div className="pt-0.5">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-sm font-bold ${
                      isCurrent
                        ? 'text-orange-600'
                        : isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {historyEntry && (
                    <span className="text-[11px] text-gray-400 font-mono">
                      {new Date(historyEntry.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-0.5">
                  {historyEntry?.note || step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
