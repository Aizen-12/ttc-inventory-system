import { supabase } from '../supabase';

export const productsAPI = {
  // Get all products with related data
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(brand_id, brand_name),
        category:categories(category_id, category_name, slug)
      `)
      .is('deleted_at', null)
      .order('product_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get single product
  async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brand:brands(*),
        category:categories(*)
      `)
      .eq('product_id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create product
  async create(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update product
  async update(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('product_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete product (soft delete)
  async delete(id) {
    const { data, error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('product_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};