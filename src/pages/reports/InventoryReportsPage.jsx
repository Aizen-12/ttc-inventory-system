// ==================================
// FILE: src/pages/reports/InventoryReportsPage.jsx
// ==================================
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Package, AlertTriangle, TrendingUp, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../../hooks/useReports';

export default function InventoryReportsPage() {
  const navigate = useNavigate();
  const { generateReport, loading } = useReports();

  const [valuation, setValuation] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [overstocked, setOverstocked] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [valuationData, lowStockData, overstockedData] = await Promise.all([
        generateReport('inventoryValuation'),
        generateReport('lowStock'),
        generateReport('overstocked')
      ]);

      setValuation(valuationData);
      setLowStock(lowStockData);
      setOverstocked(overstockedData);
    } catch (err) {
      console.error('Error loading inventory reports:', err);
    }
  };

  const exportToCSV = (data, filename) => {
    const rows = data.map(item => ({
      Product: item.variant?.product?.product_name || '',
      Variant: item.variant?.variant_name || '',
      SKU: item.variant?.sku || '',
      Warehouse: item.warehouse?.warehouse_name || '',
      'Quantity Available': item.quantity_available,
      'Unit Cost': item.unit_cost || item.variant?.unit_cost || 0,
      'Total Value': item.total_value || (item.quantity_available * (item.variant?.unit_price || 0))
    }));

    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(','),
      ...rows.map(row => headers.map(h => row[h] || '').join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <div onClick={() => navigate('/reports/report')} className="flex items-center mb-6 cursor-pointer">
        <ChevronLeft className="text-gray-400 mr-2" size={20} />
        <span className="text-sm text-gray-500">Back to Reports</span>
      </div>

      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
          <Package className="text-indigo-600" size={20} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Reports</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading inventory reports...</div>
        </div>
      ) : (
        <>
          {/* Valuation Summary */}
          {valuation && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white border rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-1">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{valuation.total_items}</p>
                <p className="text-xs text-gray-500">{valuation.total_quantity} units</p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{valuation.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ₱{valuation.total_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white border rounded-lg p-6">
                <p className="text-sm text-gray-600 mb-1">Potential Profit</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₱{valuation.potential_profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg border mb-6">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="text-orange-600" size={20} />
                <h2 className="text-lg font-semibold">Low Stock Items</h2>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                  {lowStock.length} items
                </span>
              </div>
              <button
                onClick={() => exportToCSV(lowStock, 'low-stock-items')}
                className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Warehouse</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Available</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Reserved</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Reorder Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lowStock.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No low stock items! All products are well stocked.
                      </td>
                    </tr>
                  ) : (
                    lowStock.map((item) => (
                      <tr key={item.inventory_id} className="hover:bg-orange-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.variant?.product?.product_name}
                          </div>
                          <div className="text-xs text-gray-500">{item.variant?.variant_name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.variant?.sku}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.warehouse?.warehouse_name}</td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className="font-semibold text-orange-600">{item.quantity_available}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">{item.quantity_reserved}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                          {item.variant?.reorder_level}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overstocked Items */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="text-blue-600" size={20} />
                <h2 className="text-lg font-semibold">Overstocked Items</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  {overstocked.length} items
                </span>
              </div>
              <button
                onClick={() => exportToCSV(overstocked, 'overstocked-items')}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Warehouse</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Available</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Max Level</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Tied Capital</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {overstocked.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No overstocked items. Inventory levels are optimal.
                      </td>
                    </tr>
                  ) : (
                    overstocked.map((item) => {
                      const tiedCapital = item.quantity_available * (item.variant?.unit_cost || 0);
                      return (
                        <tr key={item.inventory_id} className="hover:bg-blue-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.variant?.product?.product_name}
                            </div>
                            <div className="text-xs text-gray-500">{item.variant?.variant_name}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.variant?.sku}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.warehouse?.warehouse_name}</td>
                          <td className="px-6 py-4 text-sm text-right">
                            <span className="font-semibold text-blue-600">{item.quantity_available}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                            {item.variant?.max_stock_level}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                            ₱{tiedCapital.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}