// ==================================
// FILE: src/hooks/useStockMovements.js
// ==================================
import { useState, useEffect } from 'react';
import { stockMovementsAPI } from '../services/api/stockMovements';

export function useStockMovements(initialFilters = {}) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stockMovementsAPI.getAll(filters);
      setMovements(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    movements,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch: fetchMovements
  };
}