// ==================================
// FILE: src/services/api/reports.js
// ==================================
import { supabase } from '../supabase';

export const reportsAPI = {
  // Sales Reports
  async getSalesReport(filters = {}) {
    let query = supabase
      .from('orders')
      .select(`
        order_id,
        order_number,
        order_date,
        total_amount,
        order_status,
        payment_status,
        customer:customers(customer_id, full_name, email),
        order_items(
          order_item_id,
          quantity,
          unit_price,
          subtotal,
          variant:product_variants(
            variant_id,
            variant_name,
            sku,
            product:products(
              product_id,
              product_name,
              brand:brands(brand_name),
              category:categories(category_name)
            )
          )
        )
      `)
      .not('order_status', 'in', '("Cancelled","Archived")')
      .is('deleted_at', null)
      .order('order_date', { ascending: false });

    // Apply date filters
    if (filters.start_date) {
      query = query.gte('order_date', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('order_date', filters.end_date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Sales by Product
  async getSalesByProduct(filters = {}) {
    const salesData = await this.getSalesReport(filters);
    
    const productSales = {};
    
    salesData.forEach(order => {
      order.order_items?.forEach(item => {
        const productId = item.variant?.product?.product_id;
        const productName = item.variant?.product?.product_name || 'Unknown';
        
        if (!productSales[productId]) {
          productSales[productId] = {
            product_id: productId,
            product_name: productName,
            brand: item.variant?.product?.brand?.brand_name,
            category: item.variant?.product?.category?.category_name,
            total_quantity: 0,
            total_revenue: 0,
            order_count: 0
          };
        }
        
        productSales[productId].total_quantity += item.quantity;
        productSales[productId].total_revenue += parseFloat(item.subtotal);
        productSales[productId].order_count += 1;
      });
    });
    
    return Object.values(productSales).sort((a, b) => b.total_revenue - a.total_revenue);
  },

  // Sales by Category
  async getSalesByCategory(filters = {}) {
    const salesData = await this.getSalesReport(filters);
    
    const categorySales = {};
    
    salesData.forEach(order => {
      order.order_items?.forEach(item => {
        const categoryName = item.variant?.product?.category?.category_name || 'Uncategorized';
        
        if (!categorySales[categoryName]) {
          categorySales[categoryName] = {
            category_name: categoryName,
            total_quantity: 0,
            total_revenue: 0,
            order_count: 0
          };
        }
        
        categorySales[categoryName].total_quantity += item.quantity;
        categorySales[categoryName].total_revenue += parseFloat(item.subtotal);
        categorySales[categoryName].order_count += 1;
      });
    });
    
    return Object.values(categorySales).sort((a, b) => b.total_revenue - a.total_revenue);
  },

  // Daily Sales Trend
  async getDailySalesTrend(filters = {}) {
    const salesData = await this.getSalesReport(filters);
    
    const dailySales = {};
    
    salesData.forEach(order => {
      const date = new Date(order.order_date).toISOString().split('T')[0];
      
      if (!dailySales[date]) {
        dailySales[date] = {
          date,
          revenue: 0,
          order_count: 0
        };
      }
      
      dailySales[date].revenue += parseFloat(order.total_amount);
      dailySales[date].order_count += 1;
    });
    
    return Object.values(dailySales).sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  // Customer Reports
  async getTopCustomers(filters = {}) {
    let query = supabase
      .from('customers')
      .select('*')
      .is('deleted_at', null)
      .order('total_spent', { ascending: false })
      .limit(filters.limit || 10);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Inventory Valuation Report
  async getInventoryValuation() {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        inventory_id,
        quantity_available,
        quantity_reserved,
        variant:product_variants(
          variant_id,
          variant_name,
          sku,
          unit_cost,
          unit_price,
          product:products(
            product_id,
            product_name,
            brand:brands(brand_name),
            category:categories(category_name)
          )
        ),
        warehouse:warehouses(warehouse_id, warehouse_name)
      `);

    if (error) throw error;

    const valuation = data.map(inv => {
      const unitCost = parseFloat(inv.variant?.unit_cost || 0);
      const unitPrice = parseFloat(inv.variant?.unit_price || 0);
      const totalCost = unitCost * inv.quantity_available;
      const totalValue = unitPrice * inv.quantity_available;
      const potentialProfit = totalValue - totalCost;

      return {
        ...inv,
        unit_cost: unitCost,
        unit_price: unitPrice,
        total_cost: totalCost,
        total_value: totalValue,
        potential_profit: potentialProfit
      };
    });

    const summary = {
      total_items: valuation.length,
      total_quantity: valuation.reduce((sum, item) => sum + item.quantity_available, 0),
      total_cost: valuation.reduce((sum, item) => sum + item.total_cost, 0),
      total_value: valuation.reduce((sum, item) => sum + item.total_value, 0),
      potential_profit: valuation.reduce((sum, item) => sum + item.potential_profit, 0),
      items: valuation.sort((a, b) => b.total_value - a.total_value)
    };

    return summary;
  },

  // Low Stock Report
  async getLowStockItems() {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        inventory_id,
        quantity_available,
        quantity_reserved,
        variant:product_variants(
          variant_id,
          variant_name,
          sku,
          reorder_level,
          unit_price,
          product:products(product_id, product_name)
        ),
        warehouse:warehouses(warehouse_id, warehouse_name)
      `);

    if (error) throw error;

    const lowStock = data.filter(inv => {
      const available = inv.quantity_available - inv.quantity_reserved;
      return available <= (inv.variant?.reorder_level || 0);
    });

    return lowStock.sort((a, b) => {
      const aAvailable = a.quantity_available - a.quantity_reserved;
      const bAvailable = b.quantity_available - b.quantity_reserved;
      return aAvailable - bAvailable;
    });
  },

  // Overstocked Items Report
  async getOverstockedItems() {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        inventory_id,
        quantity_available,
        variant:product_variants(
          variant_id,
          variant_name,
          sku,
          max_stock_level,
          unit_cost,
          product:products(product_id, product_name)
        ),
        warehouse:warehouses(warehouse_id, warehouse_name)
      `);

    if (error) throw error;

    const overstocked = data.filter(inv => 
      inv.quantity_available >= (inv.variant?.max_stock_level || Infinity)
    );

    return overstocked.sort((a, b) => b.quantity_available - a.quantity_available);
  },

  // Order Statistics
  async getOrderStatistics(filters = {}) {
    const salesData = await this.getSalesReport(filters);

    const stats = {
      total_orders: salesData.length,
      total_revenue: salesData.reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
      average_order_value: 0,
      completed_orders: salesData.filter(o => o.order_status === 'Delivered').length,
      pending_orders: salesData.filter(o => ['Pending', 'Confirmed'].includes(o.order_status)).length,
      processing_orders: salesData.filter(o => ['Processing', 'Shipped'].includes(o.order_status)).length,
      paid_orders: salesData.filter(o => o.payment_status === 'Paid').length,
      pending_payment: salesData.filter(o => o.payment_status === 'Pending').length
    };

    stats.average_order_value = stats.total_orders > 0 
      ? stats.total_revenue / stats.total_orders 
      : 0;

    return stats;
  }
};