// ==================================
// FILE: src/services/api/vendors.js
// ==================================
import { supabase } from '../supabase';

export const vendorsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .is('deleted_at', null)
      .order('vendor_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('vendor_id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(vendorData) {
    const { data, error } = await supabase
      .from('vendors')
      .insert([vendorData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, vendorData) {
    const { data, error } = await supabase
      .from('vendors')
      .update(vendorData)
      .eq('vendor_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('vendors')
      .update({ deleted_at: new Date().toISOString() })
      .eq('vendor_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
