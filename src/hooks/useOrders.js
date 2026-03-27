// ==================================
// FILE: src/hooks/useOrders.js
// ==================================
import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api/orders';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const createOrder = async (orderData) => {
    try {
      const newOrder = await ordersAPI.create(orderData);
      await fetchOrders(); // Refetch to get full details
      return newOrder;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateOrderStatus = async (id, status, userId) => {
    try {
      await ordersAPI.updateStatus(id, status, userId);
      await fetchOrders();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updatePaymentStatus = async (id, paymentStatus, paymentReference) => {
    try {
      await ordersAPI.updatePaymentStatus(id, paymentStatus, paymentReference);
      await fetchOrders();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteOrder = async (id) => {
    try {
      await ordersAPI.delete(id);
      setOrders(orders.filter(o => o.order_id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
    refetch: fetchOrders
  };
}
