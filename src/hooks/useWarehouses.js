// ==================================
// FILE: src/hooks/useWarehouses.js
// ==================================
import { useState, useEffect } from 'react';
import { warehousesAPI } from '../services/api/warehouses';

export function useWarehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await warehousesAPI.getAll();
      setWarehouses(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching warehouses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const createWarehouse = async (warehouseData) => {
    try {
      const newWarehouse = await warehousesAPI.create(warehouseData);
      await fetchWarehouses(); // Refetch to get updated is_primary values
      return newWarehouse;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateWarehouse = async (id, warehouseData) => {
    try {
      const updated = await warehousesAPI.update(id, warehouseData);
      await fetchWarehouses();
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteWarehouse = async (id) => {
    try {
      await warehousesAPI.delete(id);
      setWarehouses(warehouses.filter(w => w.warehouse_id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const setPrimaryWarehouse = async (id) => {
    try {
      await warehousesAPI.setPrimary(id);
      await fetchWarehouses();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    warehouses,
    loading,
    error,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    setPrimaryWarehouse,
    refetch: fetchWarehouses
  };
}