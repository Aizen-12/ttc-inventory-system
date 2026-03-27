import { useState, useEffect } from 'react';
import { categoriesAPI } from '../services/api/categories';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createCategory = async (categoryData) => {
    try {
      const newCategory = await categoriesAPI.create(categoryData);
      setCategories([...categories, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      const updated = await categoriesAPI.update(id, categoryData);
      setCategories(categories.map(c => c.category_id === id ? updated : c));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoriesAPI.delete(id);
      setCategories(categories.filter(c => c.category_id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories
  };
}