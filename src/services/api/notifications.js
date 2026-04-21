// ==================================
// FILE: src/services/api/notifications.js
// ==================================
import { supabase } from '../supabase';

export const notificationsAPI = {
  // Get all notifications for current user (or all if no user system yet)
  async getAll(limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get unread count
  async getUnreadCount() {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .is('deleted_at', null);
    
    if (error) throw error;
    return count || 0;
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('notification_id', notificationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mark all as read
  async markAllAsRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('is_read', false)
      .is('deleted_at', null);
    
    if (error) throw error;
  },

  // Delete notification (soft delete)
  async delete(notificationId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ deleted_at: new Date().toISOString() })
      .eq('notification_id', notificationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create notification (for testing or manual creation)
  async create(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get notifications by type
  async getByType(type, limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('notification_type', type)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};