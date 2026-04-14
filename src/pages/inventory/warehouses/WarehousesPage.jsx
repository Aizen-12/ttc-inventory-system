// ==================================
// FILE: src/pages/inventory/warehouses/WarehousesPage.jsx
// ==================================
import React, { useState } from 'react';
import { ChevronLeft, Warehouse, Search, Plus, Edit2, Trash2, Star } from 'lucide-react';
import { useWarehouses } from '../../../hooks/useWarehouses';
import WarehouseForm from './WarehouseForm';
import { showSuccess, showError, showConfirm } from '../../../utils/alerts';
import { useNavigate } from 'react-router-dom';

export default function WarehousesPage() {
  const navigate = useNavigate();
  const { warehouses, loading, error, createWarehouse, updateWarehouse, deleteWarehouse, setPrimaryWarehouse } = useWarehouses();
  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = async (warehouseData) => {
    try {
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.warehouse_id, warehouseData);
        showSuccess('Warehouse updated successfully!');
      } else {
        await createWarehouse(warehouseData);
        showSuccess('Warehouse created successfully!');
      }
      setShowForm(false);
      setEditingWarehouse(null);
    } catch (err) {
      showError(err.message, 'Failed to save warehouse');
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('This warehouse will be deleted. This action cannot be undone.');
    
    if (result.isConfirmed) {
      try {
        await deleteWarehouse(id);
        showSuccess('Warehouse deleted successfully!');
      } catch (err) {
        showError(err.message, 'Failed to delete warehouse');
      }
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await setPrimaryWarehouse(id);
      showSuccess('Primary warehouse updated!');
    } catch (err) {
      showError(err.message, 'Failed to update primary warehouse');
    }
  };

  const filteredWarehouses = warehouses.filter(w =>
    w.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.warehouse_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading warehouses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div onClick={() => navigate('/dashboard')} className="flex items-center mb-6 cursor-pointer">
        <ChevronLeft className="text-gray-400 mr-2" size={20} />
        <span className="text-sm text-gray-500">Back to Dashboard</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
            <Warehouse className="text-orange-600" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
        </div>

        
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-orange-800">
          <strong>Purpose:</strong> Manage your storage locations and warehouses. Track inventory across multiple 
          locations, assign managers, and set a primary warehouse for default operations. Each warehouse maintains 
          its own inventory levels.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
        <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search warehouses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingWarehouse(null); }}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
        >
       
          <span>Add Warehouse</span>
        </button>
        </div>
      </div>

      {/* Warehouse Form Modal */}
      {showForm && (
        <WarehouseForm
          warehouse={editingWarehouse}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingWarehouse(null); }}
        />
      )}

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWarehouses.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border p-12 text-center">
            <Warehouse className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'Create your first warehouse to get started'}
            </p>
          </div>
        ) : (
          filteredWarehouses.map((warehouse) => (
            <div key={warehouse.warehouse_id} className="bg-white rounded-lg border hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{warehouse.warehouse_name}</h3>
                      {warehouse.is_primary && (
                        <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{warehouse.warehouse_code}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    warehouse.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {warehouse.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {warehouse.address && (
                    <p className="text-sm text-gray-600">{warehouse.address}</p>
                  )}
                  {warehouse.city && warehouse.province && (
                    <p className="text-sm text-gray-600">
                      {warehouse.city}, {warehouse.province}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  {!warehouse.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(warehouse.warehouse_id)}
                      className="flex-1 px-3 py-2 text-sm border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50"
                      title="Set as Primary"
                    >
                      <Star size={14} className="inline mr-1" />
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => { setEditingWarehouse(warehouse); setShowForm(true); }}
                    className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(warehouse.warehouse_id)}
                    className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}