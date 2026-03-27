// ==================================
// FILE: src/pages/inventory/batches/BatchForm.jsx
// ==================================
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useVariants } from '../../../hooks/useVariants';
import { useProducts } from '../../../hooks/useProducts';
import { useWarehouses } from '../../../hooks/useWarehouses';
import { batchesAPI } from '../../../services/api/batches';
import { showSuccess, showError, showLoading, closeLoading } from '../../../utils/alerts';

export default function BatchForm({ onClose }) {
  const { variants } = useVariants();
  const { products } = useProducts();
  const { warehouses } = useWarehouses();

  const [formData, setFormData] = useState({
    variant_id: '',
    warehouse_id: '',
    batch_number: '',
    quantity: '',
    manufacture_date: '',
    expiry_date: '',
    unit_cost: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      showLoading('Creating batch...');
      
      await batchesAPI.create({
        ...formData,
        variant_id: parseInt(formData.variant_id),
        warehouse_id: parseInt(formData.warehouse_id),
        quantity: parseInt(formData.quantity),
        quantity_remaining: parseInt(formData.quantity),
        unit_cost: parseFloat(formData.unit_cost) || null,
        manufacture_date: formData.manufacture_date || null,
        expiry_date: formData.expiry_date || null,
        status: 'Active'
      });
      
      closeLoading();
      showSuccess('Batch created successfully!');
      onClose();
    } catch (err) {
      closeLoading();
      showError(err.message, 'Failed to create batch');
    }
  };

  const filteredVariants = variants.filter(v => {
    if (!searchTerm) return true;
    const product = products.find(p => p.product_id === v.product_id);
    return (
      v.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.variant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }).slice(0, 20);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add New Batch</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Search Product/Variant *</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by SKU, product, or variant name..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none mb-2"
            />
            {searchTerm && filteredVariants.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {filteredVariants.map(variant => {
                  const product = products.find(p => p.product_id === variant.product_id);
                  return (
                    <button
                      key={variant.variant_id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, variant_id: variant.variant_id.toString(), unit_cost: variant.unit_cost || '' });
                        setSearchTerm('');
                      }}
                      className={`w-full p-3 text-left hover:bg-gray-50 border-b last:border-0 ${
                        formData.variant_id === variant.variant_id.toString() ? 'bg-teal-50' : ''
                      }`}
                    >
                      <div className="font-medium">{product?.product_name}</div>
                      <div className="text-sm text-gray-500">{variant.variant_name} • {variant.sku}</div>
                    </button>
                  );
                })}
              </div>
            )}
            {formData.variant_id && (
              <div className="mt-2 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="text-sm font-medium text-teal-900">
                  Selected: {variants.find(v => v.variant_id.toString() === formData.variant_id)?.variant_name}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Warehouse *</label>
              <select
                required
                value={formData.warehouse_id}
                onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="">Select warehouse...</option>
                {warehouses.map(w => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>
                    {w.warehouse_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Batch Number *</label>
              <input
                type="text"
                required
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="BATCH-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Unit Cost</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Manufacture Date</label>
              <input
                type="date"
                value={formData.manufacture_date}
                onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.variant_id}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}