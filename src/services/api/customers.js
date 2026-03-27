// ==================================
// FILE: src/services/api/customers.js
// ==================================
import { supabase } from '../supabase';

export const customersAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .is('deleted_at', null)
      .order('full_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('customers')
      .select('*, addresses:customer_addresses(*)')
      .eq('customer_id', id)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(customerData) {
  const { address, addresses, ...cleanCustomer } = customerData;

  const { data, error } = await supabase
    .from('customers')
    .insert([cleanCustomer])
    .select()
    .single();

  if (error) throw error;
  return data;
},

  async update(id, customerData) {
    const { data, error } = await supabase
      .from('customers')
      .update(customerData)
      .eq('customer_id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async searchByEmail(email) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .is('deleted_at', null)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Address Management
  async createAddress(addressData) {
    const { data, error } = await supabase
      .from('customer_addresses')
      .insert([addressData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateAddress(addressId, addressData) {
    const { data, error } = await supabase
      .from('customer_addresses')
      .update(addressData)
      .eq('address_id', addressId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteAddress(addressId) {
    const { data, error } = await supabase
      .from('customer_addresses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('address_id', addressId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async setDefaultAddress(customerId, addressId) {
    // First, unset all default addresses for this customer
    await supabase
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('customer_id', customerId);

    // Then set the new default
    const { data, error } = await supabase
      .from('customer_addresses')
      .update({ is_default: true })
      .eq('address_id', addressId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get customer with order statistics
  async getCustomerStats(customerId) {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        addresses:customer_addresses(*),
        orders(
          order_id,
          order_number,
          order_date,
          total_amount,
          order_status,
          payment_status
        )
      `)
      .eq('customer_id', customerId)
      .is('deleted_at', null)
      .single();
    
    if (error) throw error;
    return data;
  }
};