// ==================================
// FILE: src/hooks/useProcurements.js
// ==================================
import { useState, useEffect } from 'react';
import { procurementsAPI } from '../services/api/procurements';

export function useProcurements() {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProcurements = async () => {
    try {
      setLoading(true);
      const data = await procurementsAPI.getAll();
      setProcurements(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProcurements();
  }, []);

  return {
    procurements,
    loading,
    error,
    reload: loadProcurements
  };
}