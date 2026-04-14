// ==================================
// FILE: src/services/api/auth.js
// Migrated to Supabase Auth.
//
// Strategy:
// - Login still accepts USERNAME for UX compatibility
// - Look up email from users table, then signInWithPassword(email, password)
// - After auth, fetch full profile from custom users table by email
// - Supabase Auth handles the JWT — no more localStorage base64 session
// - RLS policies can now use auth.uid() and auth.email()
// ==================================

import { supabase } from '../supabase';
import bcrypt from 'bcryptjs';

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginUser(username, password) {
  try {
    // Step 1: resolve username → email
    const { data: users, error: lookupError } = await supabase
      .from('users')
      .select('email, status')
      .eq('username', username)
      .limit(1);

    if (lookupError) throw lookupError;
    if (!users || users.length === 0) throw new Error('Invalid username or password');

    const { email, status } = users[0];
    if (status !== 'Active') throw new Error('Your account is inactive. Contact an administrator.');

    // Step 2: Supabase Auth sign-in
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      if (authError.message.toLowerCase().includes('invalid')) throw new Error('Invalid username or password');
      throw authError;
    }

    // Step 3: fetch full profile from custom users table
    const profile = await getUserProfile(email);

    // Step 4: update last_login
    await supabase.from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('user_id', profile.user_id);

    // Step 5: audit log
    await logAuditAction(profile.user_id, 'LOGIN');

    return profile;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutUser() {
  try {
    const profile = await getCurrentUser();
    if (profile) await logAuditAction(profile.user_id, 'LOGOUT');
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
    await supabase.auth.signOut().catch(() => {});
  }
}

// ─── Get current user (async) ─────────────────────────────────────────────────
export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return null;
    return await getUserProfile(session.user.email);
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// ─── Fetch full profile from custom users table ───────────────────────────────
async function getUserProfile(email) {
  const { data, error } = await supabase
    .from('users')
    .select('user_id, username, email, full_name, role, phone, status, last_login')
    .eq('email', email)
    .eq('status', 'Active')
    .single();
  if (error) throw error;
  if (!data) throw new Error('User profile not found');
  return data;
}

// ─── Hash password (kept for users table password_hash column) ────────────────
export async function hashPassword(plainPassword) {
  try {
    return await bcrypt.hash(plainPassword, 10);
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

// ─── Audit log ────────────────────────────────────────────────────────────────
async function logAuditAction(userId, action) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      table_name: 'users',
      action,
      ip_address: null,
      user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

// ─── Permissions ──────────────────────────────────────────────────────────────
export async function hasPermission(user, permissionName) {
  if (!user) return false;
  if (user.role === 'Admin') return true;
  try {
    const { data: permissions, error } = await supabase
      .from('role_permissions')
      .select('permission:permissions(permission_name)')
      .eq('role', user.role);
    if (error) throw error;
    return permissions.some(p => p.permission?.permission_name === permissionName);
  } catch (error) {
    return false;
  }
}

export async function getRolePermissions(role) {
  try {
    const { data: permissions, error } = await supabase
      .from('role_permissions')
      .select('permission:permissions(permission_id, permission_name, resource, action, description)')
      .eq('role', role);
    if (error) throw error;
    return permissions.map(p => p.permission);
  } catch (error) {
    return [];
  }
}

export function getAuthHeaders() {
  return {};
}