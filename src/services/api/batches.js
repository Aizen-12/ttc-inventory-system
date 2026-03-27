// ==================================
// FILE: src/services/api/batches.js
// ==================================
import { supabase } from '../supabase';

export const batchesAPI = {
  // Get all batches with filters
  async getAll(filters = {}) {
    let query = supabase
      .from('inventory_batches')
      .select(`
        *,
        variant:product_variants(
          variant_id,
          variant_name,
          sku,
          product:products(
            product_id,
            product_name,
            brand:brands(brand_name),
            category:categories(category_name)
          )
        ),
        warehouse:warehouses(
          warehouse_id,
          warehouse_name,
          warehouse_code
        )
      `)
      .is('deleted_at', null)
      .order('expiry_date', { ascending: true, nullsLast: true });

    // Apply filters
    if (filters.variant_id) {
      query = query.eq('variant_id', filters.variant_id);
    }
    if (filters.warehouse_id) {
      query = query.eq('warehouse_id', filters.warehouse_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.expiring_soon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query = query.lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0]);
    }
    if (filters.expired) {
      const today = new Date().toISOString().split('T')[0];
      query = query.lt('expiry_date', today);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  // Get batches for a specific variant
  async getByVariant(variantId, warehouseId = null) {
    let query = supabase
      .from('inventory_batches')
      .select(`
        *,
        warehouse:warehouses(warehouse_id, warehouse_name)
      `)
      .eq('variant_id', variantId)
      .is('deleted_at', null)
      .gt('quantity_remaining', 0)
      .order('expiry_date', { ascending: true, nullsLast: true });

    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get expiring batches (within 30 days)
  async getExpiringBatches(daysFromNow = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysFromNow);

    const { data, error } = await supabase
      .from('inventory_batches')
      .select(`
        *,
        variant:product_variants(
          variant_id,
          variant_name,
          sku,
          product:products(product_id, product_name)
        ),
        warehouse:warehouses(warehouse_id, warehouse_name)
      `)
      .is('deleted_at', null)
      .eq('status', 'Active')
      .gt('quantity_remaining', 0)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', futureDate.toISOString().split('T')[0])
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get expired batches
  async getExpiredBatches() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('inventory_batches')
      .select(`
        *,
        variant:product_variants(
          variant_id,
          variant_name,
          sku,
          product:products(product_id, product_name)
        ),
        warehouse:warehouses(warehouse_id, warehouse_name)
      `)
      .is('deleted_at', null)
      .eq('status', 'Active')
      .gt('quantity_remaining', 0)
      .lt('expiry_date', today)
      .order('expiry_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Create batch
  async create(batchData) {
    const { data, error } = await supabase
      .from('inventory_batches')
      .insert([batchData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update batch
  async update(batchId, batchData) {
    const { data, error } = await supabase
      .from('inventory_batches')
      .update(batchData)
      .eq('batch_id', batchId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mark batch as expired (change status)
  async markAsExpired(batchId) {
    const { data, error } = await supabase
      .from('inventory_batches')
      .update({ 
        status: 'Inactive',
        updated_at: new Date().toISOString()
      })
      .eq('batch_id', batchId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete batch (soft delete)
  async delete(batchId) {
    const { data, error } = await supabase
      .from('inventory_batches')
      .update({ deleted_at: new Date().toISOString() })
      .eq('batch_id', batchId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get batch statistics
  async getStats() {
    const [allBatches, expiring, expired] = await Promise.all([
      this.getAll(),
      this.getExpiringBatches(30),
      this.getExpiredBatches()
    ]);

    const totalValue = allBatches.reduce((sum, batch) => {
      return sum + (batch.quantity_remaining * (batch.unit_cost || 0));
    }, 0);

    return {
      total_batches: allBatches.length,
      active_batches: allBatches.filter(b => b.status === 'Active' && b.quantity_remaining > 0).length,
      expiring_soon: expiring.length,
      expired: expired.length,
      total_value: totalValue
    };
  }
};