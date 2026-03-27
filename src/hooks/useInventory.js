// ==================================
// FILE: src/hooks/useInventory.js (FIXED)
// - Now reads from v_inventory_summary view via inventoryAPI
// - All field paths are flat (no more item.variant?.sku etc)
// - adjustInventory delegates to inventoryAPI (no direct supabase)
// - getStockStatus removed — view already computes stock_status
// ==================================

import { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/api/inventory';

export function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Hits v_inventory_summary view — flat fields, no transform needed
      const data = await inventoryAPI.getAll();
      setInventory(data);
    } catch (err) {
      console.error('Load inventory error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const adjustInventory = async (inventoryId, adjustment) => {
    try {
      await inventoryAPI.adjustInventory(inventoryId, adjustment);
      await loadData();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    inventory,
    loading,
    error,
    adjustInventory,
    reload: loadData
  };
}