// ==================================
// FILE: src/hooks/useDashboard.js (ALL YOU NEED)
// ==================================
import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api/orders';
import { inventoryAPI } from '../services/api/inventory';
import { customersAPI } from '../services/api/customers';
import { procurementsAPI } from '../services/api/procurements';

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    // Sales
    todaySales: 0,
    weeklySales: 0,
    monthlySales: 0,
    totalRevenue: 0,
    salesGrowth: 0,
    
    // Orders
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedToday: 0,
    
    // Inventory
    totalProducts: 0,
    lowStockItems: 0,
    outOfStock: 0,
    inventoryValue: 0,
    
    // Customers
    totalCustomers: 0,
    newCustomers: 0,
    topCustomer: null,
    
    // Procurement
    pendingProcurements: 0,
    receivedThisWeek: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data using your EXISTING APIs
      const [orders, inventory, customers, procurements] = await Promise.all([
        ordersAPI.getAll ? ordersAPI.getAll() : [],
        inventoryAPI.getAll ? inventoryAPI.getAll() : [],
        customersAPI.getAll ? customersAPI.getAll() : [],
        procurementsAPI.getAll ? procurementsAPI.getAll() : []
      ]);

      // Date calculations
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // === SALES CALCULATIONS ===
      // Include Delivered orders regardless of payment status to capture COD revenue
      const completedOrders = orders?.filter(o => 
        o.order_status === 'Delivered'
      ) || [];

      const todayOrders = completedOrders.filter(o => 
        new Date(o.order_date) >= todayStart
      );

      const weekOrders = completedOrders.filter(o => 
        new Date(o.order_date) >= weekAgo
      );

      const monthOrders = completedOrders.filter(o => 
        new Date(o.order_date) >= monthStart
      );

      const todaySales = todayOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const weeklySales = weekOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const monthlySales = monthOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
      const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

      // Compare this week vs previous week for a meaningful growth metric
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const prevWeekOrders = completedOrders.filter(o =>
        new Date(o.order_date) >= twoWeeksAgo && new Date(o.order_date) < weekAgo
      );
      const prevWeekSales = prevWeekOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

      // === ORDER STATS ===
      const pending = orders?.filter(o => 
        ['Pending', 'Confirmed'].includes(o.order_status)
      ) || [];

      const processing = orders?.filter(o => 
        ['Processing', 'Shipped'].includes(o.order_status)
      ) || [];

      // === INVENTORY STATS ===
      // v_inventory_summary is a flat view — fields like reorder_level,
      // unit_price, and stock_status are top-level, not nested under variant
      const lowStock = inventory?.filter(inv => {
        const available = inv.quantity_available || 0;
        const reorderLevel = inv.reorder_level || 10;
        return available > 0 && available <= reorderLevel;
      }) || [];

      const outOfStock = inventory?.filter(inv => 
        (inv.quantity_available || 0) === 0
      ) || [];

      const inventoryValue = inventory?.reduce((sum, inv) => {
        const qty = inv.quantity_available || 0;
        const price = parseFloat(inv.unit_price || 0);
        return sum + (qty * price);
      }, 0) || 0;

      // === CUSTOMER STATS ===
      const newCustomersThisMonth = customers?.filter(c => 
        new Date(c.created_at) >= monthStart
      ) || [];

      const topCustomer = customers?.length > 0
        ? [...customers].sort((a, b) => 
            parseFloat(b.total_spent || 0) - parseFloat(a.total_spent || 0)
          )[0]
        : null;

      // === PROCUREMENT STATS ===
      const pendingProc = procurements?.filter(p => 
        ['Pending', 'Approved', 'Ordered'].includes(p.status)
      ) || [];

      const receivedThisWeek = procurements?.filter(p => 
        ['Received', 'Partial'].includes(p.status) && 
        new Date(p.updated_at || p.created_at) >= weekAgo
      ) || [];

      // Set all stats
      setStats({
        todaySales,
        weeklySales,
        monthlySales,
        totalRevenue,
        salesGrowth: calculateGrowth(weeklySales, prevWeekSales),
        totalOrders: orders?.length || 0,
        pendingOrders: pending.length,
        processingOrders: processing.length,
        completedToday: todayOrders.length,
        totalProducts: new Set(inventory?.map(i => i.variant_id) || []).size,
        lowStockItems: lowStock.length,
        outOfStock: outOfStock.length,
        inventoryValue,
        totalCustomers: customers?.length || 0,
        newCustomers: newCustomersThisMonth.length,
        topCustomer,
        pendingProcurements: pendingProc.length,
        receivedThisWeek: receivedThisWeek.length
      });

      setRecentOrders(orders?.slice(0, 10) || []);
      setPendingOrders(pending);

    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    loading,
    error,
    stats,
    recentOrders,
    pendingOrders,
    reload: loadDashboardData
  };
}