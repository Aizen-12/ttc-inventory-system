import React, { useState } from 'react';

export default function VariantForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    sku: '',
    variant_name: '',
    color: '',
    size: '',
    unit_price: 0,
    unit_cost: 0,
    reorder_level: 10,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add Variant to {product?.product_name}</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">SKU *</label>
              <input 
                type="text" 
                value={formData.sku} 
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Variant Name *</label>
              <input 
                type="text" 
                value={formData.variant_name} 
                onChange={(e) => setFormData({ ...formData, variant_name: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input 
                  type="text" 
                  value={formData.color} 
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <input 
                  type="text" 
                  value={formData.size} 
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.unit_price} 
                  onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })} 
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.unit_cost} 
                  onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) })} 
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reorder Level</label>
              <input 
                type="number" 
                value={formData.reorder_level} 
                onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) })} 
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}