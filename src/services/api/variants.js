// ==================================
// FILE: src/services/api/variants.js (UPDATED)
// ==================================
import { supabase } from '../supabase';

export const variantsAPI = {
  // Get all variants for a product
  async getByProductId(productId) {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .is('deleted_at', null)
      .order('variant_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get all variants
  async getAll() {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .is('deleted_at', null)
      .order('sku', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Create variant (with automatic inventory creation via trigger)
  async create(variantData) {
    const { data, error } = await supabase
      .from('product_variants')
      .insert([variantData])
      .select()
      .single();
    
    if (error) throw error;
    
    // The trigger will automatically create inventory records
    // But we'll verify it was created
    const { data: inventoryCheck } = await supabase
      .from('inventory')
      .select('*')
      .eq('variant_id', data.variant_id);
    
    console.log('Inventory created for variant:', inventoryCheck);
    
    return data;
  },

  // Update variant
  async update(id, variantData) {
    const { data, error } = await supabase
      .from('product_variants')
      .update(variantData)
      .eq('variant_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete variant (soft delete)
  async delete(id) {
    const { data, error } = await supabase
      .from('product_variants')
      .update({ deleted_at: new Date().toISOString() })
      .eq('variant_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};