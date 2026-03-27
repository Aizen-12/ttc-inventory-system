// ==================================
// FILE: src/services/api/stockMovements.js
// ==================================
import { supabase } from '../supabase';

export const stockMovementsAPI = {
  // Get all stock movements with filters
  async getAll(filters = {}) {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        variant:product_variants(
          variant_id,
          variant_name,
          sku,
          product:products(
            product_id,
            product_name
          )
        ),
        warehouse:warehouses(
          warehouse_id,
          warehouse_name,
          warehouse_code
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.variant_id) {
      query = query.eq('variant_id', filters.variant_id);
    }
    if (filters.warehouse_id) {
      query = query.eq('warehouse_id', filters.warehouse_id);
    }
    if (filters.movement_type) {
      query = query.eq('movement_type', filters.movement_type);
    }
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters.reference_type) {
      query = query.eq('reference_type', filters.reference_type);
    }

    const { data, error } = await query.limit(filters.limit || 100);
    
    if (error) throw error;
    return data;
  },

  // Get movements for a specific variant
  async getByVariant(variantId) {
    const { data, error } = await supabase
      .from('stock_movements')
      .select(`
        *,
        warehouse:warehouses(warehouse_id, warehouse_name)
      `)
      .eq('variant_id', variantId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    return data;
  },

  // Get movements by reference (order_id or procurement_id)
  async getByReference(referenceType, referenceId) {
    const { data, error } = await supabase
      .from('stock_movements')
      .select(`
        *,
        variant:product_variants(variant_id, variant_name, sku),
        warehouse:warehouses(warehouse_id, warehouse_name)
      `)
      .eq('reference_type', referenceType)
      .eq('reference_id', referenceId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get statistics
  async getStats(filters = {}) {
    let query = supabase
      .from('stock_movements')
      .select('movement_type, quantity, unit_cost');

    // Apply date filters
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    const { data } = await query;

    const stats = {
      totalMovements: data?.length || 0,
      purchases: data?.filter(m => m.movement_type === 'Purchase').length || 0,
      sales: data?.filter(m => m.movement_type === 'Sale').length || 0,
      adjustments: data?.filter(m => m.movement_type === 'Adjustment').length || 0,
      totalValue: data?.reduce((sum, m) => {
        const value = Math.abs(m.quantity) * (m.unit_cost || 0);
        return sum + value;
      }, 0) || 0
    };

    return stats;
  }
};