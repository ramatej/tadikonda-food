import { supabase } from './client';
import { IRestaurantService } from '../interfaces';
import { Restaurant, RestaurantStatus } from '../../types';

export function mapDbRestaurant(row: any): Restaurant {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || '',
    cuisine: row.cuisine || [],
    rating: Number(row.rating) || 4.5,
    reviewCount: row.review_count || 0,
    deliveryTimeMinutes: row.delivery_time_minutes || 20,
    priceForTwo: row.price_for_two || 200,
    imageUrl: row.image_url,
    coverImageUrl: row.cover_image_url || undefined,
    locationArea: row.location_area,
    fullAddress: row.full_address,
    isOpen: Boolean(row.is_open),
    status: row.status as RestaurantStatus,
    ownerId: row.owner_id || '',
    phone: row.phone,
    featured: Boolean(row.featured),
    approvedAt: row.approved_at || undefined,
    approvedBy: row.approved_by || undefined,
  };
}

export class SupabaseRestaurantService implements IRestaurantService {
  async getAllRestaurants(): Promise<Restaurant[]> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching restaurants from Supabase:', error);
      return [];
    }

    return (data || []).map(mapDbRestaurant);
  }

  async getRestaurantById(id: string): Promise<Restaurant | null> {
    if (!id) return null;

    let query = supabase.from('restaurants').select('*');
    if (id.includes('-') && id.length === 36) {
      // Valid UUID: match either restaurant ID or owner profile ID
      query = query.or(`id.eq.${id},owner_id.eq.${id}`);
    } else {
      query = query.eq('id', id);
    }

    const { data, error } = await query.maybeSingle();
    if (error || !data) {
      return null;
    }
    return mapDbRestaurant(data);
  }

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAllRestaurants();

    const all = await this.getAllRestaurants();
    return all.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
        r.locationArea.toLowerCase().includes(q)
    );
  }

  async getRestaurantsByCategory(categorySlug: string): Promise<Restaurant[]> {
    const all = await this.getAllRestaurants();
    if (categorySlug === 'all') return all;

    const { data: items } = await supabase
      .from('menu_items')
      .select('restaurant_id')
      .eq('category', categorySlug);

    const matchingIds = new Set((items || []).map((i) => i.restaurant_id));
    return all.filter((r) => matchingIds.has(r.id));
  }

  async updateRestaurant(restaurant: Partial<Restaurant> & { id: string }): Promise<Restaurant> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (restaurant.name !== undefined) payload.name = restaurant.name;
    if (restaurant.tagline !== undefined) payload.tagline = restaurant.tagline;
    if (restaurant.cuisine !== undefined) payload.cuisine = restaurant.cuisine;
    if (restaurant.locationArea !== undefined) payload.location_area = restaurant.locationArea;
    if (restaurant.fullAddress !== undefined) payload.full_address = restaurant.fullAddress;
    if (restaurant.phone !== undefined) payload.phone = restaurant.phone;
    if (restaurant.isOpen !== undefined) payload.is_open = restaurant.isOpen;
    if (restaurant.priceForTwo !== undefined) payload.price_for_two = restaurant.priceForTwo;
    if (restaurant.imageUrl !== undefined) payload.image_url = restaurant.imageUrl;
    if (restaurant.coverImageUrl !== undefined) payload.cover_image_url = restaurant.coverImageUrl;

    const { data, error } = await supabase
      .from('restaurants')
      .update(payload)
      .eq('id', restaurant.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating restaurant in Supabase:', error);
      throw new Error(error.message);
    }

    return mapDbRestaurant(data);
  }

  async toggleOpenStatus(restaurantId: string, isOpen: boolean): Promise<Restaurant> {
    const { data, error } = await supabase
      .from('restaurants')
      .update({ is_open: isOpen, updated_at: new Date().toISOString() })
      .eq('id', restaurantId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling open status:', error);
      throw new Error(error.message);
    }

    return mapDbRestaurant(data);
  }

  async registerRestaurant(
    registration: Omit<Restaurant, 'id' | 'status' | 'rating' | 'reviewCount'>
  ): Promise<Restaurant> {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData.user?.id || registration.ownerId;

    // Check if an existing restaurant record exists for this owner
    const { data: existing } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', currentUserId)
      .maybeSingle();

    if (existing) {
      const { data: updated, error: updateErr } = await supabase
        .from('restaurants')
        .update({
          name: registration.name,
          tagline: registration.tagline,
          cuisine: registration.cuisine,
          delivery_time_minutes: registration.deliveryTimeMinutes,
          price_for_two: registration.priceForTwo,
          image_url: registration.imageUrl,
          cover_image_url: registration.coverImageUrl,
          location_area: registration.locationArea,
          full_address: registration.fullAddress,
          phone: registration.phone,
          featured: registration.featured,
          status: 'pending_approval',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateErr) throw new Error(updateErr.message);
      return mapDbRestaurant(updated);
    }

    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        owner_id: currentUserId,
        name: registration.name,
        tagline: registration.tagline,
        cuisine: registration.cuisine,
        delivery_time_minutes: registration.deliveryTimeMinutes,
        price_for_two: registration.priceForTwo,
        image_url: registration.imageUrl,
        cover_image_url: registration.coverImageUrl,
        location_area: registration.locationArea,
        full_address: registration.fullAddress,
        is_open: false,
        status: 'pending_approval',
        phone: registration.phone,
        featured: registration.featured,
      })
      .select()
      .single();

    if (error) {
      console.error('Error registering restaurant in Supabase:', error);
      throw new Error(error.message);
    }

    return mapDbRestaurant(data);
  }
}

export const supabaseRestaurantService = new SupabaseRestaurantService();
