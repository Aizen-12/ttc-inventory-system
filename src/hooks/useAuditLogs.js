// ==================================
// FILE: src/hooks/useAuditLogs.js
// ==================================
import { useState, useEffect } from 'react';
import { auditLogsAPI } from '../services/api/audit';

export function useAuditLogs(initialFilters = {}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await auditLogsAPI.getAll(filters);
      setLogs(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    logs,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch: fetchLogs
  };
}