// ==================================
// FILE: src/services/api/warehouses.js
// ==================================
import { supabase } from '../supabase';

export const warehousesAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .is('deleted_at', null)
      .order('warehouse_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('warehouse_id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(warehouseData) {
    const { data, error } = await supabase
      .from('warehouses')
      .insert([warehouseData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, warehouseData) {
    const { data, error } = await supabase
      .from('warehouses')
      .update(warehouseData)
      .eq('warehouse_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('warehouses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('warehouse_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async setPrimary(id) {
    // First, unset all primary warehouses
    await supabase
      .from('warehouses')
      .update({ is_primary: false })
      .is('deleted_at', null);

    // Then set the new primary
    const { data, error } = await supabase
      .from('warehouses')
      .update({ is_primary: true })
      .eq('warehouse_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};