import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { reviewService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { Order } from '../../types';
import {
  ArrowRight,
  Star,
  Receipt,
  Store,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const OrderHistoryPage: React.FC = () => {
  const { orders } = useOrders();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Orders for current user
  const userOrders = orders.filter((o) => o.customerId === user?.id);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder) return;

    await reviewService.addReview({
      orderId: reviewOrder.id,
      restaurantId: reviewOrder.restaurantId,
      userId: user?.id ?? '',
      userName: user?.name ?? '',
      rating,
      comment,
    });

    showToast('Thank you! Your review has been submitted.', 'success');
    setReviewOrder(null);
    setComment('');
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-950 tracking-tight">Your Orders</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Track active food orders and review past meals from Tadikonda restaurants
        </p>
      </div>

      {userOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
          <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <Receipt className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">No Orders Placed Yet</h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            You haven't ordered any food yet. Check out delicious breakfast tiffins and biryanis!
          </p>
          <Link
            to="/restaurants"
            className="inline-block bg-orange-600 text-white font-bold text-xs px-6 py-3 rounded-full shadow-md"
          >
            Order Food Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => {
            const isDelivered = order.status === 'delivered';
            const isActive = order.status !== 'delivered' && order.status !== 'cancelled';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-5 border shadow-sm transition-all ${
                  isActive ? 'border-orange-300 ring-2 ring-orange-500/10' : 'border-gray-100'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-orange-600" />
                      <h2 className="text-sm font-extrabold text-gray-900">
                        {order.restaurantName}
                      </h2>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Order #{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Items preview */}
                <div className="py-3 text-xs text-gray-600 space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.quantity} × {item.name}</span>
                      <span className="font-semibold text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer action bar */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-gray-400">Total: </span>
                    <strong className="text-sm font-black text-gray-950">₹{order.total.toFixed(2)}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {isDelivered && (
                      <button
                        onClick={() => setReviewOrder(order)}
                        className="text-xs font-bold text-gray-700 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 px-3 py-1.5 rounded-full border border-gray-200 transition-colors flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>Rate & Review</span>
                      </button>
                    )}

                    <Link
                      to={`/orders/${order.id}`}
                      className={`text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      <span>{isActive ? 'Track Live' : 'View Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Modal
        isOpen={Boolean(reviewOrder)}
        onClose={() => setReviewOrder(null)}
        title={`Review ${reviewOrder?.restaurantName}`}
        maxWidth="sm"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-600 font-semibold mb-2">Overall Rating</label>
            <div className="flex items-center gap-2 justify-center py-2 bg-gray-50 rounded-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-600 font-semibold mb-1">
              Your Experience / Comment
            </label>
            <textarea
              rows={3}
              placeholder="How was the food? Was it piping hot and authentic Guntur flavor?"
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-2xl focus:border-orange-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setReviewOrder(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
