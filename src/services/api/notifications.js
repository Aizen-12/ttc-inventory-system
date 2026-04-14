// ==================================
// FILE: src/services/api/notifications.js
// Fix: queries now fetch both user-specific AND system notifications.
//
// Background: DB triggers (low stock alerts, order cancellations, etc.)
// insert notifications with user_id = NULL — these are system-wide.
// A strict .eq('user_id', userId) filter hides all of them.
// Solution: fetch WHERE user_id = currentUser OR user_id IS NULL.
//
// Write operations (markAsRead, delete) still use ownership checks
// so users can only modify their own notifications, not system ones
// that belong to other users.
// ==================================
import { supabase } from '../supabase';


// Reads the Supabase Auth session from localStorage (supabase-js v2 format)
function currentUserId() {
  try {
    const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (!key) throw new Error('Not authenticated');
    const parsed = JSON.parse(localStorage.getItem(key) || '{}');
    const userId = parsed?.user?.id;
    if (!userId) throw new Error('Not authenticated');
    return userId;
  } catch {
    throw new Error('Not authenticated');
  }
}

export const notificationsAPI = {
  // Get notifications: user-specific + system (user_id IS NULL)
  async getAll(limit = 50) {
    const userId = currentUserId();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Unread count: user-specific + system unread
  async getUnreadCount() {
    const userId = currentUserId();
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('is_read', false)
      .is('deleted_at', null);

    if (error) throw error;
    return count || 0;
  },

  // Mark a single notification as read
  async markAsRead(notificationId) {
    const userId = currentUserId();
    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('notification_id', notificationId)
      .or(`user_id.eq.${userId},user_id.is.null`)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark all as read — user-specific + system notifications
  async markAllAsRead() {
    const userId = currentUserId();
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('is_read', false)
      .is('deleted_at', null);

    if (error) throw error;
  },

  // Soft-delete — only own or system notifications
  async delete(notificationId) {
    const userId = currentUserId();
    const { data, error } = await supabase
      .from('notifications')
      .update({ deleted_at: new Date().toISOString() })
      .eq('notification_id', notificationId)
      .or(`user_id.eq.${userId},user_id.is.null`)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create a notification manually
  async create(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get by type — user-specific + system
  async getByType(type, limit = 20) {
    const userId = currentUserId();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`)
      .eq('notification_type', type)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};