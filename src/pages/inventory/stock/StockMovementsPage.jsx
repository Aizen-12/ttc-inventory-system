// ==================================
// FILE: src/pages/inventory/stock/StockMovementsPage.jsx
// ==================================
import React, { useState } from 'react';
import { ChevronLeft, History, Search, Filter, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useStockMovements } from '../../../hooks/useStockMovements';
import { exportToPDF } from '../../../utils/exportPDF';
import { useWarehouses } from '../../../hooks/useWarehouses';
import { useVariants } from '../../../hooks/useVariants';
import { useProducts } from '../../../hooks/useProducts';
import { useNavigate } from 'react-router-dom';

export default function StockMovementsPage() {
  const navigate = useNavigate();
  const { warehouses } = useWarehouses();
  const { variants } = useVariants();
  const { products } = useProducts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    movement_type: '',
    warehouse_id: '',
    start_date: '',
    end_date: '',
    reference_type: ''
  });

  const { movements, loading, error, updateFilters, clearFilters: clearApiFilters } = useStockMovements();

  const handleApplyFilters = () => {
    updateFilters(localFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({
      movement_type: '',
      warehouse_id: '',
      start_date: '',
      end_date: '',
      reference_type: ''
    });
    clearApiFilters();
  };

  const filteredMovements = movements.filter(movement => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      movement.variant?.variant_name?.toLowerCase().includes(searchLower) ||
      movement.variant?.sku?.toLowerCase().includes(searchLower) ||
      movement.variant?.product?.product_name?.toLowerCase().includes(searchLower)
    );
  });

  const activeFiltersCount = Object.values(localFilters).filter(v => v).length;

  const getMovementIcon = (type) => {
    const isPositive = ['Purchase', 'Return', 'Adjustment'].includes(type);
    return isPositive ? (
      <TrendingUp className="text-green-600" size={16} />
    ) : (
      <TrendingDown className="text-red-600" size={16} />
    );
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'Purchase':
        return 'bg-green-100 text-green-700';
      case 'Sale':
        return 'bg-blue-100 text-blue-700';
      case 'Return':
        return 'bg-purple-100 text-purple-700';
      case 'Adjustment':
        return 'bg-orange-100 text-orange-700';
      case 'Transfer':
        return 'bg-indigo-100 text-indigo-700';
      case 'Damage':
        return 'bg-red-100 text-red-700';
      case 'Expiry':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const exportToPDFReport = async () => {
    await exportToPDF({
      title: 'Stock Movements Report',
      filename: 'stock-movements',
      headers: ['Date', 'Product', 'Variant', 'SKU', 'Type', 'Qty', 'Before', 'After', 'Warehouse', 'Reference'],
      rows: filteredMovements.map(m => [
        new Date(m.created_at).toLocaleDateString(),
        m.variant?.product?.product_name || '',
        m.variant?.variant_name || '',
        m.variant?.sku || '',
        m.movement_type,
        m.quantity,
        m.quantity_before,
        m.quantity_after,
        m.warehouse?.warehouse_name || '',
        m.reference_type ? `${m.reference_type} #${m.reference_id}` : '-'
      ])
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading stock movements...</div>
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
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
            <History className="text-indigo-600" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Movement History</h1>
        </div>

        
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-indigo-800">
          <strong>Purpose:</strong> View the complete audit trail of all inventory changes. Track when stock was 
          added (purchases), removed (sales), adjusted, transferred, or damaged. Each movement is automatically 
          logged by the system with timestamps and references to related transactions.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by product name, variant, or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center space-x-2 ${
              activeFiltersCount > 0 ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
            <button
          onClick={exportToPDFReport}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Download size={18} />
          <span>Export PDF</span>
        </button>
        </div>

        {showFilters && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Movement Type</label>
                <select
                  value={localFilters.movement_type}
                  onChange={(e) => setLocalFilters({ ...localFilters, movement_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">All Types</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Sale">Sale</option>
                  <option value="Return">Return</option>
                  <option value="Adjustment">Adjustment</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Damage">Damage</option>
                  <option value="Expiry">Expiry</option>
                </select>
              </div>

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
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={localFilters.start_date}
                  onChange={(e) => setLocalFilters({ ...localFilters, start_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={localFilters.end_date}
                  onChange={(e) => setLocalFilters({ ...localFilters, end_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
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
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Warehouse</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Before</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">After</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || activeFiltersCount > 0
                      ? 'No movements match your filters'
                      : 'No stock movements recorded yet'}
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => (
                  <tr key={movement.movement_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{new Date(movement.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(movement.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {movement.variant?.product?.product_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {movement.variant?.variant_name} • {movement.variant?.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getMovementIcon(movement.movement_type)}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getMovementColor(movement.movement_type)}`}>
                          {movement.movement_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {movement.warehouse?.warehouse_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-semibold ${
                        movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {movement.quantity_before}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                      {movement.quantity_after}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {movement.reference_type ? (
                        <div>
                          <span className="capitalize">{movement.reference_type}</span>
                          <span className="text-gray-400"> #{movement.reference_id}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                      {movement.notes && (
                        <div className="text-xs text-gray-400 mt-1">{movement.notes}</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredMovements.length} movements</span>
          </div>
        </div>
      </div>
    </div>
  );
}