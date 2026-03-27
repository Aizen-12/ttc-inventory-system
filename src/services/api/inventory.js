// ==================================
// FILE: src/services/api/inventory.js (FINAL FIX - Stock Movements)
// ==================================
import { supabase } from '../supabase';

export const inventoryAPI = {
  // Get inventory with full details using the view
  async getAll() {
    const { data, error } = await supabase
      .from('v_inventory_summary')
      .select('*')
      .order('product_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get inventory for specific warehouse
  async getByWarehouse(warehouseId) {
    const { data, error } = await supabase
      .from('v_inventory_summary')
      .select('*')
      .eq('warehouse_id', warehouseId);
    
    if (error) throw error;
    return data;
  },

  // Get low stock items
  async getLowStock() {
    const { data, error } = await supabase
      .from('v_inventory_summary')
      .select('*')
      .eq('stock_status', 'Low');
    
    if (error) throw error;
    return data;
  },

  // ✅ FIXED: Adjust inventory with correct stock_movements columns
  async adjustInventory(inventoryId, adjustmentData) {
    try {
      console.log('📊 Adjusting inventory:', inventoryId, adjustmentData);

      // Get current inventory
      const { data: current, error: fetchError } = await supabase
        .from('inventory')
        .select(`
          *,
          variant:product_variants (
            *,
            product:products (
              *,
              brand:brands (*),
              category:categories (*)
            )
          ),
          warehouse:warehouses (*)
        `)
        .eq('inventory_id', inventoryId)
        .single();

      if (fetchError) throw fetchError;

      const quantityBefore = current.quantity_available;
      const quantityAfter = adjustmentData.quantity_available;
      const quantityChange = quantityAfter - quantityBefore;

      // Update inventory
      const { data, error } = await supabase
        .from('inventory')
        .update({
          quantity_available: quantityAfter,
          condition: adjustmentData.condition || current.condition,
          updated_at: new Date().toISOString()
        })
        .eq('inventory_id', inventoryId)
        .select(`
          *,
          variant:product_variants (
            *,
            product:products (
              *,
              brand:brands (*),
              category:categories (*)
            )
          ),
          warehouse:warehouses (*)
        `)
        .single();

      if (error) throw error;

      // ✅ FIXED: Log stock movement with required columns
      const movementType = 
        adjustmentData.adjustment_type === 'add' ? 'Adjustment In' :
        adjustmentData.adjustment_type === 'subtract' ? 'Adjustment Out' :
        adjustmentData.adjustment_type === 'set' ? 'Adjustment' :
        'Adjustment';

      await supabase.from('stock_movements').insert({
        variant_id: data.variant_id,
        warehouse_id: data.warehouse_id,
        movement_type: movementType,
        quantity: quantityChange,
        quantity_before: quantityBefore,
        quantity_after: quantityAfter,
        reference_type: 'Manual Adjustment',
        notes: adjustmentData.adjustment_notes || `${adjustmentData.adjustment_reason || 'Stock adjustment'}: Adjusted from ${quantityBefore} to ${quantityAfter}`
      });

      console.log('✅ Inventory adjusted and logged');

      return data;

    } catch (error) {
      console.error('❌ Adjust inventory error:', error);
      throw error;
    }
  },

  // ✅ FIXED: Change condition with correct stock_movements columns
  async changeCondition(inventoryId, quantity, fromCondition, toCondition, reason, notes) {
    try {
      console.log('🔄 changeCondition called with:', {
        inventoryId,
        quantity,
        fromCondition,
        toCondition,
        reason,
        notes
      });

      // Get current inventory record
      const { data: currentInventory, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .eq('inventory_id', inventoryId)
        .single();

      if (fetchError) throw fetchError;
      if (!currentInventory) throw new Error('Inventory not found');

      console.log('Current inventory:', currentInventory);

      const sourceQtyBefore = currentInventory.quantity_available;
      const sourceQtyAfter = sourceQtyBefore - quantity;

      if (sourceQtyAfter < 0) {
        throw new Error('Cannot move more items than available');
      }

      // Step 1: Update current inventory (reduce quantity)
      const { error: updateError } = await supabase
        .from('inventory')
        .update({
          quantity_available: sourceQtyAfter,
          updated_at: new Date().toISOString()
        })
        .eq('inventory_id', inventoryId);

      if (updateError) throw updateError;

      console.log(`✅ Reduced source inventory from ${sourceQtyBefore} to ${sourceQtyAfter}`);

      // Step 2: Check if target condition inventory exists
      const { data: existingTarget, error: targetFetchError } = await supabase
        .from('inventory')
        .select('*')
        .eq('variant_id', currentInventory.variant_id)
        .eq('warehouse_id', currentInventory.warehouse_id)
        .eq('condition', toCondition)
        .maybeSingle();

      if (targetFetchError) throw targetFetchError;

      let targetQtyBefore = 0;
      let targetQtyAfter = quantity;

      if (existingTarget) {
        // Update existing target
        targetQtyBefore = existingTarget.quantity_available;
        targetQtyAfter = targetQtyBefore + quantity;

        const { error: targetUpdateError } = await supabase
          .from('inventory')
          .update({
            quantity_available: targetQtyAfter,
            updated_at: new Date().toISOString()
          })
          .eq('inventory_id', existingTarget.inventory_id);

        if (targetUpdateError) throw targetUpdateError;

        console.log(`✅ Updated target inventory from ${targetQtyBefore} to ${targetQtyAfter}`);
      } else {
        // Create new target inventory
        const { data: newInventory, error: insertError } = await supabase
          .from('inventory')
          .insert({
            variant_id: currentInventory.variant_id,
            warehouse_id: currentInventory.warehouse_id,
            quantity_available: quantity,
            quantity_reserved: 0,
            condition: toCondition
          })
          .select()
          .single();

        if (insertError) throw insertError;

        console.log('✅ Created new target inventory:', newInventory.inventory_id);
      }

      // Step 3: Log stock movement for source (reduction)
      await supabase.from('stock_movements').insert({
        variant_id: currentInventory.variant_id,
        warehouse_id: currentInventory.warehouse_id,
        movement_type: 'Condition Change',
        quantity: -quantity,
        quantity_before: sourceQtyBefore,
        quantity_after: sourceQtyAfter,
        reference_type: 'Condition Change',
        notes: `${reason}: Moved ${quantity} units from ${fromCondition} to ${toCondition}${notes ? ' - ' + notes : ''}`
      });

      // Step 4: Log stock movement for destination (addition)
      await supabase.from('stock_movements').insert({
        variant_id: currentInventory.variant_id,
        warehouse_id: currentInventory.warehouse_id,
        movement_type: 'Condition Change',
        quantity: quantity,
        quantity_before: targetQtyBefore,
        quantity_after: targetQtyAfter,
        reference_type: 'Condition Change',
        notes: `${reason}: Received ${quantity} units from ${fromCondition} as ${toCondition}${notes ? ' - ' + notes : ''}`
      });

      console.log('✅ Stock movements logged');

      return {
        success: true,
        from: { condition: fromCondition, remaining: sourceQtyAfter },
        to: { condition: toCondition, quantity: targetQtyAfter }
      };

    } catch (error) {
      console.error('❌ Change condition error:', error);
      throw error;
    }
  },

  // Legacy adjust function (kept for backward compatibility)
  async adjust(inventoryId, adjustment) {
    const { data: current, error: fetchError } = await supabase
      .from('inventory')
      .select('*')
      .eq('inventory_id', inventoryId)
      .single();
    
    if (fetchError) throw fetchError;

    const quantityBefore = current.quantity_available;
    const newQuantity = quantityBefore + adjustment.quantity;
    
    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        quantity_available: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('inventory_id', inventoryId)
      .select()
      .single();
    
    if (error) throw error;

    await supabase
      .from('stock_movements')
      .insert({
        variant_id: current.variant_id,
        warehouse_id: current.warehouse_id,
        movement_type: adjustment.type || 'Adjustment',
        quantity: adjustment.quantity,
        quantity_before: quantityBefore,
        quantity_after: newQuantity,
        reference_type: 'Manual Adjustment',
        notes: adjustment.notes || adjustment.reason || 'Stock adjustment'
      });

    return data;
  }
};

export default inventoryAPI;