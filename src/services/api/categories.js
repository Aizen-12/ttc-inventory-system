import { supabase } from '../supabase';

export const categoriesAPI = {
  // Get all categories
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('deleted_at', null)
      .order('category_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get single category
  async getById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('category_id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create category
  async create(categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update category
  async update(id, categoryData) {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('category_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete category (soft delete)
  async delete(id) {
    const { data, error } = await supabase
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('category_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};