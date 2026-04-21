// ==================================
// FILE: src/pages/inventory/procurement/ProcurementsPage.jsx
// ==================================
import React, { useState } from 'react';
import { ChevronLeft, ShoppingBag, Search, Plus, Eye, Filter } from 'lucide-react';
import { useProcurements } from '../../../hooks/useProcurements';
import { useNavigate } from 'react-router-dom';
import ProcurementStatusBadge from './ProcurementStatusBadge';

export default function ProcurementsPage() {
  const navigate = useNavigate();
  const { procurements, loading, error } = useProcurements();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredProcurements = procurements.filter(proc => {
    const matchesSearch = 
      proc.procurement_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.vendor?.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || proc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setStatusFilter('');
    setSearchTerm('');
  };

  const activeFiltersCount = [statusFilter].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading procurements...</div>
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
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <ShoppingBag className="text-green-600" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement Management</h1>
        </div>

       
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-green-800">
          <strong>Purpose:</strong> Create and manage purchase orders from your vendors. Track the procurement 
          lifecycle from draft to received. When stock is received, inventory is automatically updated via 
          database triggers.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Ordered">Ordered</option>
              <option value="Partial">Partial</option>
              <option value="Received">Received</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by procurement number or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
          onClick={() => navigate('/inventory/procurement/create')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
        >
    
          <span>New Procurement</span>
        </button>
        </div>
        
        {activeFiltersCount > 0 && (
          <div className="mt-3 flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">{activeFiltersCount} filter active</span>
            <button onClick={clearFilters} className="text-sm text-green-600 hover:text-green-800">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Procurements Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Procurement #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Cost</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProcurements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter 
                      ? 'No procurements match your filters' 
                      : 'No procurements yet. Create your first procurement!'}
                  </td>
                </tr>
              ) : (
                filteredProcurements.map((proc) => (
                  <tr key={proc.procurement_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      {proc.procurement_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(proc.procurement_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{proc.vendor?.vendor_name}</div>
                      <div className="text-xs text-gray-500">{proc.vendor?.vendor_code}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {proc.warehouse?.warehouse_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₱{parseFloat(proc.total_cost || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <ProcurementStatusBadge status={proc.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/inventory/procurement/${proc.procurement_id}`)}
                        className="text-green-600 hover:text-green-800 inline-flex items-center space-x-1"
                      >
                        <Eye size={16} />
                        <span className="text-sm">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredProcurements.length} of {procurements.length} procurements</span>
          </div>
        </div>
      </div>
    </div>
  );
}