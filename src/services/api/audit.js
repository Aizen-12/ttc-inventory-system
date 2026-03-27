import { supabase } from '../supabase';
import { getCurrentUser } from '../api/auth';
export const auditLogsAPI = {
  // ================================
  // 📝 1. LOG AUDIT (from audit.js)
  // ================================
  async logAudit({ action, table_name, record_id, old_values, new_values }) {
    try {
      const currentUser = getCurrentUser() || {};

      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: currentUser.user_id || null,
          action,
          table_name,
          record_id,
          old_values: old_values || null,
          new_values: new_values || null,
          ip_address: null,
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Audit log error:', error);
      }
    } catch (error) {
      console.error('Audit log exception:', error);
    }
  },

  // ====================================
  // 📄 2. GET SINGLE LOG BY ID (NEW)
  // ====================================
  async getById(logId) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:users(user_id, username, full_name, email)
      `)
      .eq('log_id', logId)
      .single();

    if (error) throw error;
    return data;
  },

  // ================================
  // 📊 EXISTING FUNCTIONS (UNCHANGED)
  // ================================

  async getAll(filters = {}) {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        user:users(user_id, username, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (filters.user_id) query = query.eq('user_id', filters.user_id);
    if (filters.table_name) query = query.eq('table_name', filters.table_name);
    if (filters.action) query = query.eq('action', filters.action);
    if (filters.start_date) query = query.gte('created_at', filters.start_date);
    if (filters.end_date) query = query.lte('created_at', filters.end_date);
    if (filters.record_id) query = query.eq('record_id', filters.record_id);

    const { data, error } = await query.limit(filters.limit || 100);
    if (error) throw error;

    return data;
  },

  async getByUser(userId, limit = 50) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getByRecord(tableName, recordId, limit = 50) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        user:users(user_id, username, full_name)
      `)
      .eq('table_name', tableName)
      .eq('record_id', recordId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getStats(filters = {}) {
    const logs = await this.getAll({ ...filters, limit: 10000 });

    return {
      total: logs.length,
      inserts: logs.filter(l => l.action === 'INSERT').length,
      updates: logs.filter(l => l.action === 'UPDATE').length,
      deletes: logs.filter(l => l.action === 'DELETE').length,
      logins: logs.filter(l => l.action === 'LOGIN').length,
      unique_users: new Set(logs.map(l => l.user_id)).size,
      tables_affected: new Set(logs.map(l => l.table_name)).size
    };
  },

  async getTimeline(filters = {}) {
    const logs = await this.getAll({ ...filters, limit: 1000 });

    const timeline = {};

    logs.forEach(log => {
      const date = new Date(log.created_at).toISOString().split('T')[0];

      if (!timeline[date]) {
        timeline[date] = {
          date,
          count: 0,
          actions: {}
        };
      }

      timeline[date].count += 1;
      timeline[date].actions[log.action] =
        (timeline[date].actions[log.action] || 0) + 1;
    });

    return Object.values(timeline).sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  },

  async getMostActiveUsers(limit = 10) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        user_id,
        user:users(user_id, username, full_name, email)
      `);

    if (error) throw error;

    const userCounts = {};
    data.forEach(log => {
      if (log.user_id) {
        userCounts[log.user_id] = (userCounts[log.user_id] || 0) + 1;
      }
    });

    return Object.entries(userCounts)
      .map(([userId, count]) => ({
        user: data.find(l => l.user_id === userId)?.user,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
};