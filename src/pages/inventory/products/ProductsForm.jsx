import React, { useState } from 'react';

export default function ProductForm({ product, brands, categories, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    product_name: product?.product_name || '',
    slug: product?.slug || '',
    brand_id: product?.brand_id || '',
    category_id: product?.category_id || '',
    description: product?.description || '',
  });

  const generateSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{product ? 'Edit Product' : 'Add Product'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input 
                type="text" 
                value={formData.product_name} 
                onChange={(e) => setFormData({ 
                  ...formData, 
                  product_name: e.target.value,
                  slug: product ? formData.slug : generateSlug(e.target.value)
                })} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <select 
                value={formData.brand_id} 
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand.brand_id} value={brand.brand_id}>{brand.brand_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select 
                value={formData.category_id} 
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} 
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.parent_category_id ? '  ↳ ' : ''}{cat.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}