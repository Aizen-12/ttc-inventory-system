// ==================================
// FILE: src/pages/permissions/PermissionsPage.jsx (COMPLETE)
// ==================================
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Shield, Lock, Unlock, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import permissionsAPI from '../../services/api/permissions';
import { showSuccess, showError } from '../../utils/alerts';

export default function PermissionsPage() {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const matrix = await permissionsAPI.getAllRolePermissions();
      
      // Group by resource
      const grouped = matrix.reduce((acc, perm) => {
        if (!acc[perm.resource]) {
          acc[perm.resource] = [];
        }
        acc[perm.resource].push(perm);
        return acc;
      }, {});

      setPermissions(grouped);
    } catch (error) {
      showError(error.message, 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = async (permission, role) => {
    try {
      setUpdating(true);

      // Get current state - check if permission is currently granted
      const isCurrentlyGranted = permission[role] === true;

      console.log('Toggling permission:', {
        permission_name: permission.permission_name,
        permission_id: permission.permission_id,
        role: role,
        currentState: isCurrentlyGranted,
        newState: !isCurrentlyGranted
      });

      if (isCurrentlyGranted) {
        // Remove permission
        await permissionsAPI.removeFromRole(role, permission.permission_id);
      } else {
        // Grant permission
        await permissionsAPI.assignToRole(role, permission.permission_id);
      }

      // Update local state immediately for instant UI feedback
      setPermissions(prevPermissions => {
        const updated = { ...prevPermissions };
        Object.keys(updated).forEach(resource => {
          updated[resource] = updated[resource].map(perm =>
            perm.permission_id === permission.permission_id
              ? { ...perm, [role]: !isCurrentlyGranted }
              : perm
          );
        });
        return updated;
      });

      showSuccess(
        `Permission ${isCurrentlyGranted ? 'removed from' : 'granted to'} ${role}`,
        'Permission Updated'
      );
    } catch (error) {
      console.error('Toggle permission error:', error);
      showError(error.message, 'Failed to update permission');
      // Reload to ensure UI matches database
      loadPermissions();
    } finally {
      setUpdating(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return <Shield className="text-red-600" size={16} />;
      case 'Manager':
        return <Lock className="text-orange-600" size={16} />;
      case 'Staff':
        return <Lock className="text-blue-600" size={16} />;
      case 'Customer':
        return <Lock className="text-gray-600" size={16} />;
      default:
        return null;
    }
  };

  const PermissionToggle = ({ permission, role }) => {
    const isGranted = permission[role] === true;

    return (
      <button
        onClick={() => handleTogglePermission(permission, role)}
        disabled={updating}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          transition-all duration-200 
          ${isGranted 
            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
          }
          ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={`${isGranted ? 'Revoke' : 'Grant'} ${permission.permission_name} for ${role}`}
      >
        {isGranted ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading permissions...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center mb-6 cursor-pointer" onClick={() => navigate('/users')}>
        <ChevronLeft className="text-gray-400 mr-2" size={20} />
        <span className="text-sm text-gray-500">Back to Users</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
            <Shield className="text-indigo-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Role Permissions</h1>
            <p className="text-sm text-gray-500">Manage what each role can access</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-indigo-800">
          <strong>Purpose:</strong> Configure role-based access control. Click to toggle permissions for each role. 
          Admins have full access by default. Be careful when modifying Manager and Staff permissions.
        </p>
      </div>

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Admin role has all permissions enabled. Changing Admin permissions will apply immediately for all users with that role.
        </p>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  RESOURCE / PERMISSION
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-red-600 uppercase tracking-wider">
                  <div className="flex items-center justify-center space-x-2">
                    {getRoleIcon('Admin')}
                    <span>ADMIN</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-orange-600 uppercase tracking-wider">
                  <div className="flex items-center justify-center space-x-2">
                    {getRoleIcon('Manager')}
                    <span>MANAGER</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  <div className="flex items-center justify-center space-x-2">
                    {getRoleIcon('Staff')}
                    <span>STAFF</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center justify-center space-x-2">
                    {getRoleIcon('Customer')}
                    <span>CUSTOMER</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.keys(permissions).sort().map((resource) => (
                <React.Fragment key={resource}>
                  {/* Resource Header */}
                  <tr className="bg-gray-100">
                    <td colSpan="5" className="px-6 py-3 text-sm font-bold text-gray-900 uppercase">
                      {resource}
                    </td>
                  </tr>

                  {/* Permissions for this resource */}
                  {permissions[resource].map((permission) => (
                    <tr key={permission.permission_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {permission.permission_name.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {permission.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <PermissionToggle permission={permission} role="Admin" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <PermissionToggle permission={permission} role="Manager" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <PermissionToggle permission={permission} role="Staff" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <PermissionToggle permission={permission} role="Customer" />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={16} />
            </div>
            <span className="text-sm text-gray-600">Permission Granted</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <AlertCircle className="text-gray-400" size={16} />
            </div>
            <span className="text-sm text-gray-600">Permission Denied</span>
          </div>
        </div>
      </div>

      {/* Role Descriptions */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="text-red-600" size={20} />
            <h4 className="font-semibold text-red-600">Admin</h4>
          </div>
          <p className="text-xs text-gray-600">
            Full system access. Can manage all resources, users, and settings.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="text-orange-600" size={20} />
            <h4 className="font-semibold text-orange-600">Manager</h4>
          </div>
          <p className="text-xs text-gray-600">
            Can manage operations, view reports, and handle procurement. Limited admin access.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="text-blue-600" size={20} />
            <h4 className="font-semibold text-blue-600">Staff</h4>
          </div>
          <p className="text-xs text-gray-600">
            Can view and create orders, manage inventory. Cannot access settings or financial data.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="text-gray-600" size={20} />
            <h4 className="font-semibold text-gray-600">Customer</h4>
          </div>
          <p className="text-xs text-gray-600">
            E-commerce access only. Can view products, place orders, and track deliveries. For future e-commerce frontend.
          </p>
        </div>
      </div>
    </div>
  );
}