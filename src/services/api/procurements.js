// ==================================
// FILE: src/services/api/procurements.js (FIXED)
// Key fix: receiveItems() no longer manually updates inventory,
// creates batches, or logs stock movements.
// The DB trigger (trg_update_inventory_procurement) does all of that
// automatically when status is set to 'Received' or 'Partial'.
// Doing it in JS AND via trigger was doubling every received quantity.
// ==================================

import { supabase } from '../supabase';

export const procurementsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('procurements')
      .select(`
        *,
        vendor:vendors(vendor_id, vendor_name, vendor_code),
        warehouse:warehouses(warehouse_id, warehouse_name)
      `)
      .is('deleted_at', null)
      .order('procurement_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data: procurement, error: procurementError } = await supabase
      .from('procurements')
      .select(`
        *,
        vendor:vendors(*),
        warehouse:warehouses(*),
        procurement_items(
          *,
          variant:product_variants(
            *,
            product:products(*)
          )
        )
      `)
      .eq('procurement_id', id)
      .single();

    if (procurementError) throw procurementError;
    return procurement;
  },

  async create(procurementData) {
    const { data, error } = await supabase
      .from('procurements')
      .insert([procurementData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createProcurementItems(items) {
    const { data, error } = await supabase
      .from('procurement_items')
      .insert(items)
      .select();

    if (error) throw error;
    return data;
  },

  async updateStatus(id, status, userId) {
    const updates = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'Approved') {
      updates.approved_by = userId;
      updates.approved_at = new Date().toISOString();
    } else if (status === 'Received') {
      updates.actual_delivery_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('procurements')
      .update(updates)
      .eq('procurement_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, procurementData) {
    const { data, error } = await supabase
      .from('procurements')
      .update(procurementData)
      .eq('procurement_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // FIXED: receiveItems now only does two things:
  //   1. Updates quantity_received on each procurement_item row
  //   2. Sets the procurement status (Partial / Received)
  //
  // The DB trigger (trg_update_inventory_procurement) fires on the
  // status UPDATE and handles inventory, batches, and stock_movements
  // automatically — with proper ON CONFLICT upserts.
  // Previously Steps 2/3/4 here were duplicating all of that work.
  async receiveItems(procurementId, itemsReceived) {
    try {
      console.log('🔄 receiveItems START:', { procurementId, itemsReceived });

      if (!itemsReceived || itemsReceived.length === 0) {
        throw new Error('No items provided to receive');
      }

      // ====================================
      // STEP 1: Update quantity_received on each procurement_item
      // ====================================
      for (const item of itemsReceived) {
        console.log('\n--- Processing Item ---');
        console.log('Item data:', item);

        const { data: procItem, error: procItemError } = await supabase
          .from('procurement_items')
          .select('quantity_received')
          .eq('procurement_item_id', item.procurement_item_id)
          .single();

        if (procItemError) throw procItemError;

        const previouslyReceived = procItem.quantity_received || 0;
        const newTotalReceived = item.quantity_received || 0;
        const receivingNow = newTotalReceived - previouslyReceived;

        console.log('📊 Quantities:', {
          previously_received: previouslyReceived,
          new_total: newTotalReceived,
          receiving_now: receivingNow
        });

        if (receivingNow <= 0) {
          console.log('⏭️ Skip - no new quantity');
          continue;
        }

        const { error: updateError } = await supabase
          .from('procurement_items')
          .update({
            quantity_received: newTotalReceived,
            updated_at: new Date().toISOString()
          })
          .eq('procurement_item_id', item.procurement_item_id);

        if (updateError) {
          console.error('❌ Update procurement_items failed:', updateError);
          throw updateError;
        }

        console.log('✅ Updated procurement_items');
        // NOTE: inventory / batch / stock_movement updates are handled
        // by the DB trigger when we update the procurement status below.
      }

      // ====================================
      // STEP 2: Calculate and set new procurement status
      // The DB trigger fires HERE on this status update.
      // Guard: fetch current status first — if it's already 'Received'
      // do NOT update again, which would re-fire the trigger and
      // double-credit inventory (the core bug we're defending against).
      // ====================================
      const { data: allItems } = await supabase
        .from('procurement_items')
        .select('quantity_ordered, quantity_received')
        .eq('procurement_id', procurementId);

      const allReceived = allItems?.every(i => (i.quantity_received || 0) >= i.quantity_ordered);
      const partialReceived = allItems?.some(i => (i.quantity_received || 0) > 0) && !allReceived;

      const newStatus = allReceived ? 'Received' : partialReceived ? 'Partial' : 'Ordered';

      console.log('\n📊 New status:', newStatus);

      // Fetch the procurement's CURRENT status before updating
      const { data: currentProc } = await supabase
        .from('procurements')
        .select('status')
        .eq('procurement_id', procurementId)
        .single();

      const currentStatus = currentProc?.status;

      // Only update if the status is actually changing — prevents
      // re-triggering the DB trigger with the same status value
      if (newStatus !== currentStatus) {
        await this.updateStatus(procurementId, newStatus, null);
        console.log(`\n✅ Status changed: ${currentStatus} → ${newStatus}`);
      } else {
        console.log(`\n⏭️ Status unchanged (${currentStatus}), skipping update`);
      }

      console.log('\n🎉 RECEIVE COMPLETE!\n');

      return { success: true, status: newStatus };

    } catch (error) {
      console.error('\n❌ RECEIVE FAILED:', error);
      throw error;
    }
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('procurements')
      .update({ deleted_at: new Date().toISOString() })
      .eq('procurement_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getStats() {
    const { data: procurements } = await supabase
      .from('procurements')
      .select('status, total_cost')
      .is('deleted_at', null);

    const stats = {
      total: procurements?.length || 0,
      draft: procurements?.filter(p => p.status === 'Draft').length || 0,
      pending: procurements?.filter(p => p.status === 'Pending').length || 0,
      approved: procurements?.filter(p => p.status === 'Approved').length || 0,
      ordered: procurements?.filter(p => p.status === 'Ordered').length || 0,
      partial: procurements?.filter(p => p.status === 'Partial').length || 0,
      received: procurements?.filter(p => p.status === 'Received').length || 0,
      totalCost: procurements?.reduce((sum, p) => sum + parseFloat(p.total_cost || 0), 0) || 0
    };

    return stats;
  }
};

export default procurementsAPI;