// ==================================
// FILE: src/hooks/useCustomers.js (UPDATED)
// ==================================
import { useState, useEffect } from 'react';
import { customersAPI } from '../services/api/customers';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customersAPI.getAll();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const createCustomer = async (customerData) => {
    try {
      const newCustomer = await customersAPI.create(customerData);
      setCustomers([...customers, newCustomer]);
      return newCustomer;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      const updated = await customersAPI.update(id, customerData);
      setCustomers(customers.map(c => c.customer_id === id ? updated : c));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const searchByEmail = async (email) => {
    try {
      const customer = await customersAPI.searchByEmail(email);
      return customer;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await customersAPI.delete(id);
      setCustomers(customers.filter(c => c.customer_id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    createCustomer,
    updateCustomer,
    searchByEmail,
    deleteCustomer,
    refetch: fetchCustomers
  };
}