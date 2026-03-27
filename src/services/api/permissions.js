// ==================================
// FILE: src/services/api/permissions.js (FIXED)
// ==================================
import { supabase } from '../supabase';
import { auditLogsAPI } from './audit';

// ==========================================
// PERMISSIONS OPERATIONS
// ==========================================

export async function getPermissions() {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true })
      .order('action', { ascending: true });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Get permissions error:', error);
    throw error;
  }
}

export async function getPermissionsByResource() {
  try {
    const permissions = await getPermissions();

    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {});

    return grouped;
  } catch (error) {
    console.error('Get permissions by resource error:', error);
    throw error;
  }
}

export async function createPermission(permissionData) {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .insert({
        permission_name: permissionData.permission_name,
        resource: permissionData.resource,
        action: permissionData.action,
        description: permissionData.description
      })
      .select()
      .single();

    if (error) throw error;

    await auditLogsAPI.logAudit({
      action: 'INSERT',
      table_name: 'permissions',
      record_id: data.permission_id,
      new_values: data
    });

    return data;
  } catch (error) {
    console.error('Create permission error:', error);
    throw error;
  }
}

export async function updatePermission(permissionId, updates) {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .update(updates)
      .eq('permission_id', permissionId)
      .select()
      .single();

    if (error) throw error;

    await auditLogsAPI.logAudit({
      action: 'UPDATE',
      table_name: 'permissions',
      record_id: permissionId,
      new_values: updates
    });

    return data;
  } catch (error) {
    console.error('Update permission error:', error);
    throw error;
  }
}

export async function deletePermission(permissionId) {
  try {
    const { error } = await supabase
      .from('permissions')
      .delete()
      .eq('permission_id', permissionId);

    if (error) throw error;

    await auditLogsAPI.logAudit({
      action: 'DELETE',
      table_name: 'permissions',
      record_id: permissionId
    });

    return true;
  } catch (error) {
    console.error('Delete permission error:', error);
    throw error;
  }
}

// ==========================================
// ROLE PERMISSIONS OPERATIONS
// ==========================================

export async function getRolePermissions(role) {
  try {
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        permission_id,
        permissions (
          permission_id,
          permission_name,
          resource,
          action,
          description
        )
      `)
      .eq('role', role);

    if (error) throw error;

    return data.map(rp => rp.permissions);
  } catch (error) {
    console.error('Get role permissions error:', error);
    throw error;
  }
}

export async function getAllRolePermissions() {
  try {
    // Get all permissions
    const { data: allPermissions, error: permError } = await supabase
      .from('permissions')
      .select('*')
      .order('resource', { ascending: true })
      .order('action', { ascending: true });

    if (permError) throw permError;

    // Get all role permissions
    const { data: rolePerms, error: roleError } = await supabase
      .from('role_permissions')
      .select('role, permission_id');

    if (roleError) throw roleError;

    // Format as matrix
    const matrix = allPermissions.map(permission => ({
      ...permission,
      Admin: rolePerms.some(rp => rp.role === 'Admin' && rp.permission_id === permission.permission_id),
      Manager: rolePerms.some(rp => rp.role === 'Manager' && rp.permission_id === permission.permission_id),
      Staff: rolePerms.some(rp => rp.role === 'Staff' && rp.permission_id === permission.permission_id),
      Customer: rolePerms.some(rp => rp.role === 'Customer' && rp.permission_id === permission.permission_id)
    }));

    return matrix;
  } catch (error) {
    console.error('Get all role permissions error:', error);
    throw error;
  }
}

export async function updateRolePermission(role, permissionId, granted) {
  try {
    if (granted) {
      const { error } = await supabase
        .from('role_permissions')
        .insert({
          role: role,
          permission_id: permissionId
        });

      if (error && error.code !== '23505') {
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role', role)
        .eq('permission_id', permissionId);

      if (error) throw error;
    }

    await auditLogsAPI.logAudit({
      action: granted ? 'INSERT' : 'DELETE',
      table_name: 'role_permissions',
      new_values: { role, permission_id: permissionId, granted }
    });

    return true;
  } catch (error) {
    console.error('Update role permission error:', error);
    throw error;
  }
}

/**
 * Assign permission to role (grant access)
 * @param {number} permissionId - Permission ID
 * @param {string} role - Role name (Admin, Manager, Staff, Customer)
 */
// ==================================
// REPLACE assignToRole and removeFromRole with this DEBUG VERSION
// ==================================

export async function assignToRole(param1, param2) {
  console.log('=== assignToRole DEBUG ===');
  console.log('param1:', param1, 'Type:', typeof param1);
  console.log('param2:', param2, 'Type:', typeof param2);
  
  // Auto-detect which is which
  let role, permissionId;
  
  if (typeof param1 === 'string' && (typeof param2 === 'number' || !isNaN(parseInt(param2)))) {
    // param1 is role (string), param2 is permissionId (number)
    role = param1;
    permissionId = parseInt(param2);
    console.log('✅ Detected order: (role, permissionId)');
  } else if (typeof param2 === 'string' && (typeof param1 === 'number' || !isNaN(parseInt(param1)))) {
    // param1 is permissionId (number), param2 is role (string)
    permissionId = parseInt(param1);
    role = param2;
    console.log('✅ Detected order: (permissionId, role)');
  } else {
    console.error('❌ Could not detect parameter types!');
    throw new Error(`Invalid parameters: param1=${param1} (${typeof param1}), param2=${param2} (${typeof param2})`);
  }
  
  console.log('📤 Calling updateRolePermission with:', { role, permissionId, granted: true });
  
  try {
    return await updateRolePermission(role, permissionId, true);
  } catch (error) {
    console.error('❌ Assign to role error:', error);
    throw error;
  }
}

export async function removeFromRole(param1, param2) {
  console.log('=== removeFromRole DEBUG ===');
  console.log('param1:', param1, 'Type:', typeof param1);
  console.log('param2:', param2, 'Type:', typeof param2);
  
  // Auto-detect which is which
  let role, permissionId;
  
  if (typeof param1 === 'string' && (typeof param2 === 'number' || !isNaN(parseInt(param2)))) {
    role = param1;
    permissionId = parseInt(param2);
    console.log('✅ Detected order: (role, permissionId)');
  } else if (typeof param2 === 'string' && (typeof param1 === 'number' || !isNaN(parseInt(param1)))) {
    permissionId = parseInt(param1);
    role = param2;
    console.log('✅ Detected order: (permissionId, role)');
  } else {
    console.error('❌ Could not detect parameter types!');
    throw new Error(`Invalid parameters: param1=${param1} (${typeof param1}), param2=${param2} (${typeof param2})`);
  }
  
  console.log('📤 Calling updateRolePermission with:', { role, permissionId, granted: false });
  
  try {
    return await updateRolePermission(role, permissionId, false);
  } catch (error) {
    console.error('❌ Remove from role error:', error);
    throw error;
  }
}

export async function bulkUpdateRolePermissions(role, permissionIds) {
  try {
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role', role);

    if (permissionIds.length > 0) {
      const inserts = permissionIds.map(permissionId => ({
        role: role,
        permission_id: permissionId
      }));

      const { error } = await supabase
        .from('role_permissions')
        .insert(inserts);

      if (error) throw error;
    }

    await auditLogsAPI.logAudit({
      action: 'UPDATE',
      table_name: 'role_permissions',
      new_values: { role, permission_ids: permissionIds, bulk_update: true }
    });

    return true;
  } catch (error) {
    console.error('Bulk update role permissions error:', error);
    throw error;
  }
}

export async function checkUserPermission(userId, permissionName) {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (userError || !user) return false;

    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        permissions!inner (permission_name)
      `)
      .eq('role', user.role)
      .eq('permissions.permission_name', permissionName)
      .limit(1);

    if (error) throw error;

    return data && data.length > 0;
  } catch (error) {
    console.error('Check permission error:', error);
    return false;
  }
}

export async function checkUserPermissions(userId, permissionNames) {
  try {
    const results = {};
    
    for (const permissionName of permissionNames) {
      results[permissionName] = await checkUserPermission(userId, permissionName);
    }

    return results;
  } catch (error) {
    console.error('Check permissions error:', error);
    return {};
  }
}

export async function getUserPermissions(userId) {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (userError || !user) return [];

    return await getRolePermissions(user.role);
  } catch (error) {
    console.error('Get user permissions error:', error);
    return [];
  }
}

export async function getPermissionStats() {
  try {
    const { data: allPerms, error: permError } = await supabase
      .from('permissions')
      .select('permission_id');

    const { data: rolePerms, error: roleError } = await supabase
      .from('role_permissions')
      .select('role');

    if (permError || roleError) throw permError || roleError;

    const stats = {
      totalPermissions: allPerms.length,
      byRole: {
        Admin: rolePerms.filter(rp => rp.role === 'Admin').length,
        Manager: rolePerms.filter(rp => rp.role === 'Manager').length,
        Staff: rolePerms.filter(rp => rp.role === 'Staff').length,
        Customer: rolePerms.filter(rp => rp.role === 'Customer').length
      }
    };

    return stats;
  } catch (error) {
    console.error('Get permission stats error:', error);
    throw error;
  }
}

// ==========================================
// EXPORT WITH BACKWARD COMPATIBILITY
// ==========================================

export const permissionsAPI = {
  // Main functions
  getPermissions,
  getPermissionsByResource,
  createPermission,
  updatePermission,
  deletePermission,
  getRolePermissions,
  getAllRolePermissions,
  updateRolePermission,
  bulkUpdateRolePermissions,
  checkUserPermission,
  checkUserPermissions,
  getUserPermissions,
  getPermissionStats,
  
  // Role assignment functions
  assignToRole,
  removeFromRole,
  
  // Backward compatibility aliases
  getAll: getPermissions,
  getById: (id) => getPermissions().then(perms => perms.find(p => p.permission_id === id)),
  create: createPermission,
  update: updatePermission,
  delete: deletePermission,
  remove: deletePermission
};

export default permissionsAPI;