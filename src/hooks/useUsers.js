// ==================================
// FILE: src/hooks/useUsers.js
// ==================================
import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api/users';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (userData) => {
    try {
      const newUser = await usersAPI.create(userData);
      await fetchUsers();
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      await usersAPI.update(userId, userData);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updatePassword = async (userId, newPassword) => {
    try {
      await usersAPI.updatePassword(userId, newPassword);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deactivateUser = async (userId) => {
    try {
      await usersAPI.deactivate(userId);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const activateUser = async (userId) => {
    try {
      await usersAPI.activate(userId);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await usersAPI.delete(userId);
      setUsers(users.filter(u => u.user_id !== userId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    updatePassword,
    deactivateUser,
    activateUser,
    deleteUser,
    refetch: fetchUsers
  };
}