import { supabase } from './client';
import { IAddressService } from '../interfaces';
import { Address } from '../../types';

function mapDbAddress(row: any): Address {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    doorNo: row.door_no,
    street: row.street,
    landmark: row.landmark || undefined,
    villageArea: row.village_area,
    pincode: row.pincode,
    isDefault: Boolean(row.is_default),
  };
}

export class SupabaseAddressService implements IAddressService {
  async getUserAddresses(userId: string): Promise<Address[]> {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching addresses from Supabase:', error);
      return [];
    }

    return (data || []).map(mapDbAddress);
  }

  async addAddress(address: Omit<Address, 'id'>): Promise<Address> {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData.user?.id || address.userId;

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: currentUserId,
        label: address.label,
        door_no: address.doorNo,
        street: address.street,
        landmark: address.landmark,
        village_area: address.villageArea,
        pincode: address.pincode || '522236',
        is_default: address.isDefault ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding address in Supabase:', error);
      throw new Error(error.message);
    }

    return mapDbAddress(data);
  }

  async updateAddress(address: Address): Promise<Address> {
    const { data, error } = await supabase
      .from('addresses')
      .update({
        label: address.label,
        door_no: address.doorNo,
        street: address.street,
        landmark: address.landmark,
        village_area: address.villageArea,
        pincode: address.pincode,
        is_default: address.isDefault,
        updated_at: new Date().toISOString(),
      })
      .eq('id', address.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating address in Supabase:', error);
      throw new Error(error.message);
    }

    return mapDbAddress(data);
  }

  async deleteAddress(id: string): Promise<void> {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) {
      console.error('Error deleting address from Supabase:', error);
      throw new Error(error.message);
    }
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<Address[]> {
    // Unset all default
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    // Set target default
    await supabase.from('addresses').update({ is_default: true }).eq('id', addressId);

    return this.getUserAddresses(userId);
  }
}

export const supabaseAddressService = new SupabaseAddressService();
