import { supabase } from './client';
import { IMenuService } from '../interfaces';
import { MenuItem } from '../../types';

function mapDbMenuItem(row: any): MenuItem {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    restaurantName: row.restaurant_name || 'Restaurant',
    name: row.name,
    description: row.description || '',
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    imageUrl: row.image_url,
    category: row.category,
    isVeg: Boolean(row.is_veg),
    isAvailable: Boolean(row.is_available),
    isBestseller: Boolean(row.is_bestseller),
    rating: Number(row.rating) || 4.5,
    reviewCount: row.review_count || 0,
    preparationTimeMinutes: row.preparation_time_minutes || 15,
  };
}

export class SupabaseMenuService implements IMenuService {
  async getMenuItems(restaurantId?: string): Promise<MenuItem[]> {
    let query = supabase.from('menu_items').select('*');
    if (restaurantId) {
      // If restaurantId is a user UUID, resolve restaurant first if needed
      if (restaurantId.includes('-') && restaurantId.length === 36) {
        const { data: rest } = await supabase
          .from('restaurants')
          .select('id')
          .or(`id.eq.${restaurantId},owner_id.eq.${restaurantId}`)
          .maybeSingle();

        const actualRestId = rest?.id || restaurantId;
        query = query.eq('restaurant_id', actualRestId);
      } else {
        query = query.eq('restaurant_id', restaurantId);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching menu items:', error);
      return [];
    }

    return (data || []).map(mapDbMenuItem);
  }

  async getMenuItemById(id: string): Promise<MenuItem | null> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapDbMenuItem(data);
  }

  async searchMenuItems(query: string): Promise<MenuItem[]> {
    const q = query.toLowerCase().trim();
    if (!q) return this.getMenuItems();

    const all = await this.getMenuItems();
    return all.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }

  async createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    let actualRestaurantId = item.restaurantId;
    if (item.restaurantId.includes('-')) {
      const { data: rest } = await supabase
        .from('restaurants')
        .select('id')
        .or(`id.eq.${item.restaurantId},owner_id.eq.${item.restaurantId}`)
        .maybeSingle();
      if (rest) actualRestaurantId = rest.id;
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        restaurant_id: actualRestaurantId,
        name: item.name,
        description: item.description,
        price: item.price,
        original_price: item.originalPrice,
        image_url: item.imageUrl,
        category: item.category,
        is_veg: item.isVeg,
        is_available: item.isAvailable,
        is_bestseller: item.isBestseller ?? false,
        preparation_time_minutes: item.preparationTimeMinutes ?? 15,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating menu item in Supabase:', error);
      throw new Error(error.message);
    }

    return mapDbMenuItem(data);
  }

  async updateMenuItem(item: Partial<MenuItem> & { id: string }): Promise<MenuItem> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (item.name !== undefined) payload.name = item.name;
    if (item.description !== undefined) payload.description = item.description;
    if (item.price !== undefined) payload.price = item.price;
    if (item.originalPrice !== undefined) payload.original_price = item.originalPrice;
    if (item.imageUrl !== undefined) payload.image_url = item.imageUrl;
    if (item.category !== undefined) payload.category = item.category;
    if (item.isVeg !== undefined) payload.is_veg = item.isVeg;
    if (item.isAvailable !== undefined) payload.is_available = item.isAvailable;

    const { data, error } = await supabase
      .from('menu_items')
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating menu item in Supabase:', error);
      throw new Error(error.message);
    }

    return mapDbMenuItem(data);
  }

  async deleteMenuItem(id: string): Promise<void> {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
      console.error('Error deleting menu item from Supabase:', error);
      throw new Error(error.message);
    }
  }

  async toggleItemAvailability(id: string, isAvailable: boolean): Promise<MenuItem> {
    return this.updateMenuItem({ id, isAvailable });
  }
}

export const supabaseMenuService = new SupabaseMenuService();
