// ==================================
// FILE: src/hooks/useReports.js
// ==================================
import { useState } from 'react';
import { reportsAPI } from '../services/api/reports';

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async (reportType, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      let data;
      switch (reportType) {
        case 'sales':
          data = await reportsAPI.getSalesReport(filters);
          break;
        case 'salesByProduct':
          data = await reportsAPI.getSalesByProduct(filters);
          break;
        case 'salesByCategory':
          data = await reportsAPI.getSalesByCategory(filters);
          break;
        case 'dailyTrend':
          data = await reportsAPI.getDailySalesTrend(filters);
          break;
        case 'topCustomers':
          data = await reportsAPI.getTopCustomers(filters);
          break;
        case 'inventoryValuation':
          data = await reportsAPI.getInventoryValuation();
          break;
        case 'lowStock':
          data = await reportsAPI.getLowStockItems();
          break;
        case 'overstocked':
          data = await reportsAPI.getOverstockedItems();
          break;
        case 'orderStats':
          data = await reportsAPI.getOrderStatistics(filters);
          break;
        default:
          throw new Error('Invalid report type');
      }

      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error generating report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateReport
  };
}