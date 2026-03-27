// ==================================
// FILE: src/hooks/useVendors.js
// ==================================
import { useState, useEffect } from 'react';
import { vendorsAPI } from '../services/api/vendors';

export function useVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vendorsAPI.getAll();
      setVendors(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const createVendor = async (vendorData) => {
    try {
      const newVendor = await vendorsAPI.create(vendorData);
      setVendors([...vendors, newVendor]);
      return newVendor;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateVendor = async (id, vendorData) => {
    try {
      const updated = await vendorsAPI.update(id, vendorData);
      setVendors(vendors.map(v => v.vendor_id === id ? updated : v));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteVendor = async (id) => {
    try {
      await vendorsAPI.delete(id);
      setVendors(vendors.filter(v => v.vendor_id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    vendors,
    loading,
    error,
    createVendor,
    updateVendor,
    deleteVendor,
    refetch: fetchVendors
  };
}