// ==================================
// FILE: src/services/api/orders.js
// ==================================
import { supabase } from '../supabase';
// ------------------------------
// 1️⃣ Check & Reserve Stock on Processing
// ------------------------------


export const ordersAPI = {
  // Get all orders with details
  async getAll() {
    const { data, error } = await supabase
      .from('v_order_details')
      .select('*')
      .order('order_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get single order with items
  async getById(id) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        order_items(
          *,
          variant:product_variants(
            *,
            product:products(*)
          )
        )
      `)
      .eq('order_id', id)
      .single();
    
    if (orderError) throw orderError;
    return order;
  },

  // Create order
  async create(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create order items
  async createOrderItems(items) {
    const { data, error } = await supabase
      .from('order_items')
      .insert(items)
      .select();
    
    if (error) throw error;
    return data;
  },

  
async updateStatus(id, status, userId) {
  const updates = {
    order_status: status,
    updated_at: new Date().toISOString()
  };

  // Add timestamp fields based on status
  if (status === 'Confirmed') {
    updates.verified_by = userId;
    updates.verified_at = new Date().toISOString();
  } else if (status === 'Processing') {
    updates.processed_by = userId;
    updates.processed_at = new Date().toISOString();
  } else if (status === 'Shipped') {
    updates.shipped_at = new Date().toISOString();
  } else if (status === 'Delivered') {
    updates.delivered_at = new Date().toISOString();
  } else if (status === 'Cancelled') {
    updates.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('order_id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
},
  // Cancel order with reason.
  // Stock release is handled entirely by the DB trigger
  // handle_order_cancellation (BEFORE UPDATE on orders) which:
  //   1. Releases quantity_reserved via inventory_reservations records
  //   2. Cancels all active reservations for the order
  //   3. Sets payment_status = 'Refunded' if order was already paid
  //   4. Inserts cancellation notifications
  // No JS-side inventory manipulation needed or safe here.
  async cancelOrder(id, cancellationReason = null) {
    const updates = {
      order_status: 'Cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: cancellationReason,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('order_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  // Update payment status
  async updatePaymentStatus(id, paymentStatus, paymentReference = null) {
    const updates = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    };

    if (paymentStatus === 'Paid') {
      updates.payment_date = new Date().toISOString();
      if (paymentReference) {
        updates.payment_reference = paymentReference;
      }
    } else if (paymentStatus === 'Failed') {
      // Store failure reason in payment_reference
      if (paymentReference) {
        updates.payment_reference = `Failed: ${paymentReference}`;
      }
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('order_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete order (soft delete)
  async delete(id) {
    const { data, error } = await supabase
      .from('orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('order_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get order statistics
  async getStats() {
    const { data: orders } = await supabase
      .from('orders')
      .select('order_status, total_amount, payment_status')
      .is('deleted_at', null);

    const stats = {
      total: orders?.length || 0,
      pending: orders?.filter(o => o.order_status === 'Pending').length || 0,
      confirmed: orders?.filter(o => o.order_status === 'Confirmed').length || 0,
      processing: orders?.filter(o => o.order_status === 'Processing').length || 0,
      shipped: orders?.filter(o => o.order_status === 'Shipped').length || 0,
      delivered: orders?.filter(o => o.order_status === 'Delivered').length || 0,
      cancelled: orders?.filter(o => o.order_status === 'Cancelled').length || 0,
      totalRevenue: orders?.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0,
      paidOrders: orders?.filter(o => o.payment_status === 'Paid').length || 0,
      pendingPayment: orders?.filter(o => o.payment_status === 'Pending').length || 0,
    };

    return stats;
  }
};