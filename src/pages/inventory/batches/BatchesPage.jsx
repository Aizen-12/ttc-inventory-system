// ==================================
// FILE: src/pages/inventory/batches/BatchesPage.jsx
// ==================================
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Search, Filter, AlertTriangle, Clock, CheckCircle, XCircle, Plus, Download } from 'lucide-react';
import { useBatches } from '../../../hooks/useBatches';
import { useWarehouses } from '../../../hooks/useWarehouses';
import { useVariants } from '../../../hooks/useVariants';
import { useProducts } from '../../../hooks/useProducts';
import { useNavigate } from 'react-router-dom';
import { batchesAPI } from '../../../services/api/batches';
import { exportToPDF } from '../../../utils/exportPDF';
import BatchForm from './BatchForm';
import { showSuccess, showError, showConfirm } from '../../../utils/alerts';

export default function BatchesPage() {
  const navigate = useNavigate();
  const { warehouses } = useWarehouses();
  const { variants } = useVariants();
  const { products } = useProducts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState(null);
  
  const [localFilters, setLocalFilters] = useState({
    warehouse_id: '',
    status: '',
    expiring_soon: false,
    expired: false
  });

  const { batches, loading, error, updateFilters, clearFilters: clearApiFilters, markAsExpired, deleteBatch, refetch } = useBatches();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await batchesAPI.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleApplyFilters = () => {
    updateFilters(localFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({
      warehouse_id: '',
      status: '',
      expiring_soon: false,
      expired: false
    });
    clearApiFilters();
  };

  const handleMarkExpired = async (batchId) => {
    const result = await showConfirm(
      'Mark this batch as expired? This will change its status to Inactive.',
      'Mark as Expired'
    );
    
    if (result.isConfirmed) {
      try {
        await markAsExpired(batchId);
        await loadStats();
        showSuccess('Batch marked as expired');
      } catch (err) {
        showError(err.message, 'Failed to update batch');
      }
    }
  };

  const handleDelete = async (batchId) => {
    const result = await showConfirm(
      'Delete this batch? This action cannot be undone.',
      'Delete Batch'
    );
    
    if (result.isConfirmed) {
      try {
        await deleteBatch(batchId);
        await loadStats();
        showSuccess('Batch deleted successfully');
      } catch (err) {
        showError(err.message, 'Failed to delete batch');
      }
    }
  };

  const filteredBatches = batches.filter(batch => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      batch.batch_number?.toLowerCase().includes(searchLower) ||
      batch.variant?.variant_name?.toLowerCase().includes(searchLower) ||
      batch.variant?.sku?.toLowerCase().includes(searchLower) ||
      batch.variant?.product?.product_name?.toLowerCase().includes(searchLower)
    );
  });

  const activeFiltersCount = Object.values(localFilters).filter(v => v).length;

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { text: 'No Expiry', color: 'gray', icon: null };
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { text: 'Expired', color: 'red', icon: <XCircle size={14} /> };
    } else if (daysUntilExpiry <= 7) {
      return { text: `${daysUntilExpiry}d left`, color: 'red', icon: <AlertTriangle size={14} /> };
    } else if (daysUntilExpiry <= 30) {
      return { text: `${daysUntilExpiry}d left`, color: 'orange', icon: <Clock size={14} /> };
    } else {
      return { text: `${daysUntilExpiry}d left`, color: 'green', icon: <CheckCircle size={14} /> };
    }
  };

  const exportToPDFReport = async () => {
    await exportToPDF({
      title: 'Inventory Batches & Expiry Report',
      filename: 'inventory-batches',
      headers: ['Batch Number', 'Product', 'Variant', 'SKU', 'Warehouse', 'Qty Remaining', 'Manufactured', 'Expiry', 'Status'],
      rows: filteredBatches.map(b => [
        b.batch_number,
        b.variant?.product?.product_name || '',
        b.variant?.variant_name || '',
        b.variant?.sku || '',
        b.warehouse?.warehouse_name || '',
        b.quantity_remaining,
        b.manufacture_date || '-',
        b.expiry_date || '-',
        b.status
      ])
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading batches...</div>
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
      <div onClick={() => navigate('/Dashboard')} className="flex items-center mb-6 cursor-pointer">
        <ChevronLeft className="text-gray-400 mr-2" size={20} />
        <span className="text-sm text-gray-500">Back to Dashboard</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
            <Calendar className="text-teal-600" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Batches</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportToPDFReport}
            className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 flex items-center space-x-2"
          >
            <Download size={18} />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Batch</span>
          </button>
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-teal-800">
          <strong>Purpose:</strong> Track product batches with manufacturing and expiry dates. Manage stock rotation 
          using FEFO (First Expired, First Out) method. Get alerts for expiring items to minimize waste and ensure 
          product quality.
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Batches</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_batches}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active_batches}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Expiring Soon</p>
            <p className="text-2xl font-bold text-orange-600">{stats.expiring_soon}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Expired</p>
            <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-purple-600">
              ₱{stats.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by batch number, product, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center space-x-2 ${
              activeFiltersCount > 0 ? 'bg-teal-50 border-teal-500 text-teal-600' : 'hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Warehouse</label>
                <select
                  value={localFilters.warehouse_id}
                  onChange={(e) => setLocalFilters({ ...localFilters, warehouse_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">All Warehouses</option>
                  {warehouses.map(w => (
                    <option key={w.warehouse_id} value={w.warehouse_id}>
                      {w.warehouse_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={localFilters.status}
                  onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localFilters.expiring_soon}
                    onChange={(e) => setLocalFilters({ ...localFilters, expiring_soon: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm">Expiring Soon (30d)</span>
                </label>
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={localFilters.expired}
                    onChange={(e) => setLocalFilters({ ...localFilters, expired: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm">Expired Only</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Form Modal */}
      {showForm && (
        <BatchForm
          onClose={() => {
            setShowForm(false);
            refetch();
            loadStats();
          }}
        />
      )}

      {/* Batches Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Batch #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Warehouse</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Qty Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Manufactured</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || activeFiltersCount > 0
                      ? 'No batches match your filters'
                      : 'No batches found. Add your first batch!'}
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => {
                  const expiryStatus = getExpiryStatus(batch.expiry_date);
                  
                  return (
                    <tr key={batch.batch_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {batch.batch_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {batch.variant?.product?.product_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {batch.variant?.variant_name} • {batch.variant?.sku}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {batch.warehouse?.warehouse_name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-gray-900">{batch.quantity_remaining}</span>
                        <span className="text-xs text-gray-500"> / {batch.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {batch.manufacture_date 
                          ? new Date(batch.manufacture_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {batch.expiry_date ? (
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded flex items-center space-x-1 bg-${expiryStatus.color}-100 text-${expiryStatus.color}-700`}>
                              {expiryStatus.icon}
                              <span>{expiryStatus.text}</span>
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(batch.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No expiry</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          batch.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {batch.status === 'Active' && expiryStatus.color === 'red' && (
                          <button
                            onClick={() => handleMarkExpired(batch.batch_id)}
                            className="text-sm text-orange-600 hover:text-orange-800"
                          >
                            Mark Expired
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(batch.batch_id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredBatches.length} batches</span>
          </div>
        </div>
      </div>
    </div>
  );
}