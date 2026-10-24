import { supabase } from './client';
import { IReviewService } from '../interfaces';
import { Review } from '../../types';

export function mapDbReview(row: any): Review {
  const profile = row.profiles || {};
  return {
    id: row.id,
    orderId: row.order_id,
    restaurantId: row.restaurant_id,
    userId: row.user_id,
    userName: profile.full_name || row.userName || 'Tadikonda Customer',
    userAvatar: profile.avatar_url || undefined,
    rating: Number(row.rating) || 5,
    comment: row.comment || '',
    createdAt: row.created_at,
  };
}

export class SupabaseReviewService implements IReviewService {
  async getRestaurantReviews(restaurantId: string): Promise<Review[]> {
    if (!restaurantId) return [];

    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }

    return (data || []).map(mapDbReview);
  }

  async addReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        order_id: review.orderId,
        restaurant_id: review.restaurantId,
        user_id: review.userId,
        rating: review.rating,
        comment: review.comment,
      })
      .select('*, profiles(full_name, avatar_url)')
      .single();

    if (error) {
      console.error('Error adding review:', error);
      throw new Error(error.message || 'Failed to submit review');
    }

    return mapDbReview(data);
  }
}

export const supabaseReviewService = new SupabaseReviewService();
