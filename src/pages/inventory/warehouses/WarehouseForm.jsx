// ==================================
// FILE: src/pages/inventory/warehouses/WarehouseForm.jsx
// ==================================
import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function WarehouseForm({ warehouse, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    warehouse_name: warehouse?.warehouse_name || '',
    warehouse_code: warehouse?.warehouse_code || '',
    address: warehouse?.address || '',
    city: warehouse?.city || '',
    province: warehouse?.province || '',
    country: warehouse?.country || 'Philippines',
    is_primary: warehouse?.is_primary || false,
    status: warehouse?.status || 'Active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {warehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Warehouse Name *</label>
              <input
                type="text"
                required
                value={formData.warehouse_name}
                onChange={(e) => setFormData({ ...formData, warehouse_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Main Warehouse"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Warehouse Code *</label>
              <input
                type="text"
                required
                value={formData.warehouse_code}
                onChange={(e) => setFormData({ ...formData, warehouse_code: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="WH-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Quezon City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Province</label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Metro Manila"
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium">Set as Primary Warehouse</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                The primary warehouse is used as the default location for orders and procurements
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              {warehouse ? 'Update Warehouse' : 'Create Warehouse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}