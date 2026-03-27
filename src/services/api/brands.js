import { supabase } from '../supabase';

export const brandsAPI = {
  // Get all brands
  async getAll() {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .is('deleted_at', null)
      .order('brand_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get single brand
  async getById(id) {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('brand_id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create brand
  async create(brandData) {
    const { data, error } = await supabase
      .from('brands')
      .insert([brandData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update brand
  async update(id, brandData) {
    const { data, error } = await supabase
      .from('brands')
      .update(brandData)
      .eq('brand_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete brand (soft delete)
  async delete(id) {
    const { data, error } = await supabase
      .from('brands')
      .update({ deleted_at: new Date().toISOString() })
      .eq('brand_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};