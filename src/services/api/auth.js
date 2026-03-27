// src/services/api/auth.js
import { supabase } from '../supabase';
import bcrypt from 'bcryptjs';

const SESSION_KEY = 'ttc_user_session';
const SESSION_EXPIRY_HOURS = 24;

// Login user
export async function loginUser(username, password) {
  try {
    // Query user by username
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('status', 'Active')
      .limit(1);

    if (queryError) throw queryError;

    if (!users || users.length === 0) {
      throw new Error('Invalid username or password');
    }

    const user = users[0];

    // Verify password with bcrypt
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    // Create session data (excluding sensitive info)
    const sessionData = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()
    };

    // Store in localStorage with encryption-like encoding
    const encodedSession = btoa(JSON.stringify(sessionData));
    localStorage.setItem(SESSION_KEY, encodedSession);

    // Log login action
    await logAuditAction(user.user_id, 'LOGIN');

    return sessionData;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout user
export async function logoutUser() {
  try {
    const session = getCurrentUser();
    
    if (session) {
      // Log logout action
      await logAuditAction(session.user_id, 'LOGOUT');
    }

    // Clear session
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

// Get current user from session
export function getCurrentUser() {
  try {
    const encodedSession = localStorage.getItem(SESSION_KEY);
    if (!encodedSession) return null;

    // Decode session
    const sessionData = atob(encodedSession);
    const user = JSON.parse(sessionData);
    
    // Check if session is expired
    const expiresAt = new Date(user.expiresAt);
    const now = new Date();
    
    if (now > expiresAt) {
      // Session expired
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

// Verify password using bcrypt
async function verifyPassword(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// Hash password for user creation/update
export async function hashPassword(plainPassword) {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

// Log audit action
async function logAuditAction(userId, action) {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        table_name: 'users',
        action: action,
        ip_address: null, // You can capture this if needed
        user_agent: navigator.userAgent
      });
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - audit log failure shouldn't prevent login/logout
  }
}

// Check if user has permission
export async function hasPermission(user, permissionName) {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'Admin') return true;
  
  try {
    // Check from role_permissions table
    const { data: permissions, error } = await supabase
      .from('role_permissions')
      .select(`
        permission:permissions(permission_name)
      `)
      .eq('role', user.role);

    if (error) throw error;

    // Check if permission exists in user's role permissions
    return permissions.some(p => p.permission?.permission_name === permissionName);
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

// Get all permissions for a role
export async function getRolePermissions(role) {
  try {
    const { data: permissions, error } = await supabase
      .from('role_permissions')
      .select(`
        permission:permissions(
          permission_id,
          permission_name,
          resource,
          action,
          description
        )
      `)
      .eq('role', role);

    if (error) throw error;

    return permissions.map(p => p.permission);
  } catch (error) {
    console.error('Get role permissions error:', error);
    return [];
  }
}

// Validate session token (for API calls)
export function getAuthHeaders() {
  const user = getCurrentUser();
  if (!user) return {};
  
  return {
    'X-User-ID': user.user_id,
    'X-User-Role': user.role
  };
}