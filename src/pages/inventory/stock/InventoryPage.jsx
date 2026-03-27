// ==================================
// FILE: src/pages/inventory/stock/InventoryPage.jsx (FIXED)
// Changes:
// - navigate('/dashboard') lowercase (was '/Dashboard' — 404 bug)
// - stats.outOfStock uses 'Normal'/'Low'/'Overstocked' — matches view values
// - All inv.* field references already flat — no changes needed there
//   (InventoryPage was already using flat fields correctly)
// ==================================

import React, { useState } from 'react';
import {
  ChevronLeft,
  Warehouse,
  Search,
  Filter,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../../../hooks/useInventory';
import AdjustmentForm from './AdjustmentForm';
import { showSuccess, showError } from '../../../utils/alerts';
import { inventoryAPI } from '../../../services/api/inventory';

export default function InventoryPage() {
  const navigate = useNavigate();
  const { inventory, loading, error, adjustInventory, reload } = useInventory();

  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // FIX: view returns 'Normal'/'Low'/'Overstocked' — not 'In Stock'/'Out of Stock'
  const stats = {
    totalSKUs: inventory.length,
    goodCondition: inventory.filter(i => i.condition === 'Good').length,
    damaged: inventory.filter(i => i.condition === 'Damaged').length,
    lowStock: inventory.filter(i => i.stock_status === 'Low').length,
    outOfStock: inventory.filter(i => i.quantity_available === 0).length
  };

  // Get unique warehouses from flat field
  const warehouses = [...new Set(inventory.map(i => i.warehouse_name))].filter(Boolean);

  const handleAdjust = async (adjustment) => {
    try {
      if (adjustment.adjustment_type === 'condition_change') {
        await inventoryAPI.changeCondition(
          adjustment.inventory_id,
          adjustment.quantity_to_change,
          adjustment.from_condition,
          adjustment.to_condition,
          adjustment.adjustment_reason,
          adjustment.adjustment_notes
        );
        await reload();
      } else {
        await adjustInventory(selectedInventory.inventory_id, adjustment);
      }

      showSuccess('Inventory adjusted successfully!');
      setShowAdjustForm(false);
      setSelectedInventory(null);
    } catch (err) {
      console.error('Adjust error:', err);
      showError(err.message, 'Failed to adjust inventory');
    }
  };

  // FIX: status filter values aligned to view's stock_status values
  const filteredInventory = inventory.filter(inv => {
    const matchesSearch = !searchTerm ||
      inv.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.variant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.product_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCondition = conditionFilter === 'all' || inv.condition === conditionFilter;

    // FIX: map UI labels to view values
    let matchesStatus = true;
    if (statusFilter === 'In Stock') matchesStatus = inv.stock_status === 'Normal';
    else if (statusFilter === 'Low') matchesStatus = inv.stock_status === 'Low';
    else if (statusFilter === 'Out of Stock') matchesStatus = inv.quantity_available === 0;
    else if (statusFilter === 'Overstocked') matchesStatus = inv.stock_status === 'Overstocked';

    const matchesWarehouse = warehouseFilter === 'all' || inv.warehouse_name === warehouseFilter;

    return matchesSearch && matchesCondition && matchesStatus && matchesWarehouse;
  });

  const getConditionBadge = (condition) => {
    const colors = {
      'Good': 'bg-green-100 text-green-700 border-green-200',
      'Damaged': 'bg-red-100 text-red-700 border-red-200',
      'Returned': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Refurbished': 'bg-blue-100 text-blue-700 border-blue-200',
      'Expired': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[condition] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // FIX: badge colours mapped to view's stock_status values
  const getStatusBadge = (inv) => {
    if (inv.quantity_available === 0) return 'bg-red-100 text-red-700 border-red-200';
    if (inv.stock_status === 'Low') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (inv.stock_status === 'Overstocked') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getStatusLabel = (inv) => {
    if (inv.quantity_available === 0) return 'Out of Stock';
    if (inv.stock_status === 'Low') return 'Low';
    if (inv.stock_status === 'Overstocked') return 'Overstocked';
    return 'In Stock';
  };

  const getStatusIcon = (inv) => {
    if (inv.quantity_available === 0) return <XCircle size={14} className="mr-1" />;
    if (inv.stock_status === 'Low') return <AlertTriangle size={14} className="mr-1" />;
    return <CheckCircle size={14} className="mr-1" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="animate-spin text-green-600" size={32} />
          <div className="text-gray-500 font-medium">Loading inventory...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-red-600 mb-3" size={48} />
          <div className="text-red-600 font-semibold mb-2">Error Loading Inventory</div>
          <div className="text-gray-600 text-sm">{error}</div>
          <button
            onClick={reload}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header — FIX: lowercase /dashboard */}
      <div className="flex items-center mb-6 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <ChevronLeft className="text-gray-400 mr-2" size={20} />
        <span className="text-sm text-gray-500 hover:text-gray-700">Back to Dashboard</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
            <Warehouse className="text-green-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
            <p className="text-sm text-gray-500">Monitor and adjust inventory levels</p>
          </div>
        </div>
        <button
          onClick={reload}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-green-800">
          <strong>Purpose:</strong> Monitor and manage stock levels for all product variants across
          warehouses. Track available quantities, reserved stock, item conditions, and low stock alerts.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total SKUs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSKUs}</p>
            </div>
            <Package className="text-gray-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Good Condition</p>
              <p className="text-2xl font-bold text-green-600">{stats.goodCondition}</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Damaged</p>
              <p className="text-2xl font-bold text-red-600">{stats.damaged}</p>
            </div>
            <XCircle className="text-red-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
            </div>
            <AlertTriangle className="text-yellow-400" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <TrendingDown className="text-red-400" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Filters</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Filter size={16} />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by SKU, variant, or product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Condition</label>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
              >
                <option value="all">All Conditions</option>
                <option value="Good">Good</option>
                <option value="Damaged">Damaged</option>
                <option value="Returned">Returned</option>
                <option value="Refurbished">Refurbished</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Stock Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
              >
                <option value="all">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Overstocked">Overstocked</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Warehouse</label>
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
              >
                <option value="all">All Warehouses</option>
                {warehouses.map(wh => (
                  <option key={wh} value={wh}>{wh}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {(searchTerm || conditionFilter !== 'all' || statusFilter !== 'all' || warehouseFilter !== 'all') && (
          <div className="mt-4 flex items-center space-x-2 text-xs text-gray-600">
            <span>Active filters:</span>
            {searchTerm && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Search: "{searchTerm}"</span>}
            {conditionFilter !== 'all' && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Condition: {conditionFilter}</span>}
            {statusFilter !== 'all' && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Status: {statusFilter}</span>}
            {warehouseFilter !== 'all' && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Warehouse: {warehouseFilter}</span>}
            <button
              onClick={() => { setSearchTerm(''); setConditionFilter('all'); setStatusFilter('all'); setWarehouseFilter('all'); }}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {showAdjustForm && selectedInventory && (
        <AdjustmentForm
          inventory={selectedInventory}
          onSave={handleAdjust}
          onCancel={() => { setShowAdjustForm(false); setSelectedInventory(null); }}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Current Stock Levels</h2>
            <div className="text-sm text-gray-500">
              Showing {filteredInventory.length} of {inventory.length} SKU{inventory.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Variant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Available</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reserved</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Condition</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <Package className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500 font-medium mb-1">
                      {searchTerm || conditionFilter !== 'all' || statusFilter !== 'all' || warehouseFilter !== 'all'
                        ? 'No inventory records match your filters'
                        : 'No inventory records found'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {searchTerm || conditionFilter !== 'all' || statusFilter !== 'all' || warehouseFilter !== 'all'
                        ? 'Try adjusting your filters or search term'
                        : 'Start by adding products and variants'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((inv) => (
                  <tr key={inv.inventory_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono font-medium text-gray-900">{inv.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{inv.product_name}</span>
                        {inv.brand_name && <span className="text-xs text-gray-500">{inv.brand_name}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{inv.variant_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{inv.warehouse_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">
                        {(inv.quantity_available || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-orange-600">
                        {(inv.quantity_reserved || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getConditionBadge(inv.condition)}`}>
                        {inv.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center px-3 py-1 text-xs font-medium rounded-full border w-fit ${getStatusBadge(inv)}`}>
                        {getStatusIcon(inv)}
                        {getStatusLabel(inv)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setSelectedInventory(inv); setShowAdjustForm(true); }}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}