// ==================================
// FILE: src/hooks/useBatches.js
// ==================================
import { useState, useEffect } from 'react';
import { batchesAPI } from '../services/api/batches';

export function useBatches(initialFilters = {}) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await batchesAPI.getAll(filters);
      setBatches(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [filters]);

  const createBatch = async (batchData) => {
    try {
      const newBatch = await batchesAPI.create(batchData);
      await fetchBatches();
      return newBatch;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateBatch = async (batchId, batchData) => {
    try {
      await batchesAPI.update(batchId, batchData);
      await fetchBatches();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const markAsExpired = async (batchId) => {
    try {
      await batchesAPI.markAsExpired(batchId);
      await fetchBatches();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteBatch = async (batchId) => {
    try {
      await batchesAPI.delete(batchId);
      setBatches(batches.filter(b => b.batch_id !== batchId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    batches,
    loading,
    error,
    filters,
    createBatch,
    updateBatch,
    markAsExpired,
    deleteBatch,
    updateFilters,
    clearFilters,
    refetch: fetchBatches
  };
}