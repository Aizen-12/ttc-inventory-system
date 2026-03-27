import { useState, useEffect } from 'react';
import { brandsAPI } from '../services/api/brands';

export function useBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await brandsAPI.getAll();
      setBrands(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const createBrand = async (brandData) => {
    try {
      const newBrand = await brandsAPI.create(brandData);
      setBrands([...brands, newBrand]);
      return newBrand;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateBrand = async (id, brandData) => {
    try {
      const updated = await brandsAPI.update(id, brandData);
      setBrands(brands.map(b => b.brand_id === id ? updated : b));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteBrand = async (id) => {
    try {
      await brandsAPI.delete(id);
      setBrands(brands.filter(b => b.brand_id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    brands,
    loading,
    error,
    createBrand,
    updateBrand,
    deleteBrand,
    refetch: fetchBrands
  };
}