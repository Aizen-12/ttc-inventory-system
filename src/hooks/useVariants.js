import { useState, useEffect } from 'react';
import { variantsAPI } from '../services/api/variants';

export function useVariants(productId = null) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = productId 
        ? await variantsAPI.getByProductId(productId)
        : await variantsAPI.getAll();
      setVariants(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching variants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const createVariant = async (variantData) => {
    try {
      const newVariant = await variantsAPI.create(variantData);
      setVariants([...variants, newVariant]);
      return newVariant;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateVariant = async (id, variantData) => {
    try {
      const updated = await variantsAPI.update(id, variantData);
      setVariants(variants.map(v => v.variant_id === id ? updated : v));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteVariant = async (id) => {
    try {
      await variantsAPI.delete(id);
      setVariants(variants.filter(v => v.variant_id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    variants,
    loading,
    error,
    createVariant,
    updateVariant,
    deleteVariant,
    refetch: fetchVariants
  };
}