// ==================================
// FILE: src/services/api/users.js (FIXED)
// Key fix: hashPassword() and verifyPassword() now use bcryptjs
// instead of btoa() (base64 is NOT a hash — users created/reset
// via this file were getting passwords that auth.js bcrypt could
// never verify, making those users unable to log in).
// ==================================

import { supabase } from '../supabase';
import { auditLogsAPI } from './audit';
import bcrypt from 'bcryptjs';

// FIXED: real bcrypt hash — compatible with auth.js and DB pgcrypto bf
const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

// FIXED: real bcrypt verify
const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// ==========================================
// USER CRUD OPERATIONS
// ==========================================

export async function createUser(userData) {
  try {
    // FIXED: await the async hash
    const hashedPassword = await hashPassword(userData.password);

    const { data, error } = await supabase
      .from('users')
      .insert({
        username: userData.username,
        password_hash: hashedPassword,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role || 'Staff',
        phone: userData.phone,
        status: 'Active'
      })
      .select()
      .single();

    if (error) throw error;

    await auditLogsAPI.logAudit({
      action: 'INSERT',
      table_name: 'users',
      record_id: null, // user_id is UUID; audit_logs.record_id is INTEGER
      new_values: { username: data.username, role: data.role, email: data.email }
    });

    return data;
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
}

export async function getUsers(filters = {}) {
  try {
    let query = supabase
      .from('users')
      .select('user_id, username, email, full_name, role, phone, status, created_at, updated_at, last_login')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (filters.role) query = query.eq('role', filters.role);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.search) {
      query = query.or(
        `username.ilike.%${filters.search}%,` +
        `full_name.ilike.%${filters.search}%,` +
        `email.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get users error:', error);
    throw error;
  }
}

export async function getUserById(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('user_id, username, email, full_name, role, phone, status, created_at, updated_at, last_login')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
}

export async function updateUser(userId, updates) {
  try {
    const { data: oldData } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Strip raw password fields — never pass them to a plain update
    const { password, password_hash, ...safeUpdates } = updates;

    const { data, error } = await supabase
      .from('users')
      .update({ ...safeUpdates, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    await auditLogsAPI.logAudit({
      action: 'UPDATE',
      table_name: 'users',
      record_id: null, // user_id is UUID; audit_logs.record_id is INTEGER
      old_values: oldData,
      new_values: data
    });

    return data;
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
}

export async function changePassword(userId, currentPassword, newPassword) {
  try {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('password_hash, username')
      .eq('user_id', userId)
      .single();

    if (fetchError || !user) throw new Error('User not found');

    // FIXED: await the async verify
    const isValid = await verifyPassword(currentPassword, user.password_hash);
    if (!isValid) throw new Error('Current password is incorrect');

    // FIXED: await the async hash
    const hashedPassword = await hashPassword(newPassword);

    const { error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;

    await auditLogsAPI.logAudit({
      action: 'UPDATE',
      table_name: 'users',
      record_id: null, // user_id is UUID; audit_logs.record_id is INTEGER
      new_values: { action: 'password_changed' }
    });

    return true;
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
}

export async function resetUserPassword(userId, newPassword) {
  try {
    // FIXED: await the async hash
    const hashedPassword = await hashPassword(newPassword);

    const { error } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;

    await auditLogsAPI.logAudit({
      action: 'UPDATE',
      table_name: 'users',
      record_id: null, // user_id is UUID; audit_logs.record_id is INTEGER
      new_values: { action: 'password_reset_by_admin' }
    });

    return true;
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
}

export async function deleteUser(userId, deletedBy) {
  try {
    const { data: oldData } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { error } = await supabase
      .from('users')
      .update({ status: 'Inactive', deleted_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;

    await auditLogsAPI.logAudit({
      action: 'DELETE',
      table_name: 'users',
      record_id: null, // user_id is UUID; audit_logs.record_id is INTEGER
      old_values: oldData,
      new_values: { deleted: true, deleted_by: deletedBy }
    });

    return true;
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
}

export async function activateUser(userId) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ status: 'Active', deleted_at: null, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;

    await auditLogsAPI.logAudit({
      action: 'UPDATE',
      table_name: 'users',
      record_id: null, // user_id is UUID; audit_logs.record_id is INTEGER
      new_values: { action: 'user_activated', status: 'Active' }
    });

    return true;
  } catch (error) {
    console.error('Activate user error:', error);
    throw error;
  }
}

export async function getUserActivity(userId, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get user activity error:', error);
    return [];
  }
}

export async function getUserStats() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role, status')
      .is('deleted_at', null);

    if (error) throw error;

    return {
      total: data.length,
      byRole: {
        Admin: data.filter(u => u.role === 'Admin').length,
        Manager: data.filter(u => u.role === 'Manager').length,
        Staff: data.filter(u => u.role === 'Staff').length,
        Customer: data.filter(u => u.role === 'Customer').length
      },
      byStatus: {
        Active: data.filter(u => u.status === 'Active').length,
        Inactive: data.filter(u => u.status === 'Inactive').length
      }
    };
  } catch (error) {
    console.error('Get user stats error:', error);
    throw error;
  }
}

export async function bulkUpdateUsers(userIds, updates) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .in('user_id', userIds)
      .select();

    if (error) throw error;

    for (const userId of userIds) {
      await auditLogsAPI.logAudit({
        action: 'UPDATE',
        table_name: 'users',
        record_id: null, // user_id is UUID; audit_logs.record_id is INTEGER
        new_values: { ...updates, bulk_update: true }
      });
    }

    return data;
  } catch (error) {
    console.error('Bulk update users error:', error);
    throw error;
  }
}

export async function exportUsers(filters = {}) {
  try {
    const users = await getUsers(filters);
    const headers = ['Username', 'Full Name', 'Email', 'Phone', 'Role', 'Status', 'Created At'];
    const rows = users.map(u => [
      u.username, u.full_name, u.email, u.phone || '',
      u.role, u.status, new Date(u.created_at).toLocaleDateString()
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    return csv;
  } catch (error) {
    console.error('Export users error:', error);
    throw error;
  }
}

// ==========================================
// EXPORT — both naming conventions
// ==========================================
export const usersAPI = {
  createUser, getUsers, getUserById, updateUser,
  changePassword, resetUserPassword, deleteUser, activateUser,
  getUserActivity, getUserStats, bulkUpdateUsers, exportUsers,
  // aliases
  create: createUser,
  getAll: getUsers,
  getById: getUserById,
  update: updateUser,
  updatePassword: resetUserPassword,
  deactivate: deleteUser,
  activate: activateUser,
  remove: deleteUser,
  delete: deleteUser
};

export default usersAPI;