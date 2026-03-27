// ==================================
// FILE: src/components/inventory/categories/CategoryForm.jsx
// ==================================
import React, { useState } from 'react';

export default function CategoryForm({ category, categories, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    category_name: category?.category_name || '',
    parent_category_id: category?.parent_category_id || '',
    slug: category?.slug || '',
    description: category?.description || '',
  });

  const generateSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      ...formData, 
      parent_category_id: formData.parent_category_id || null 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{category ? 'Edit Category' : 'Add Category'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category Name *</label>
              <input
                type="text"
                value={formData.category_name}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  category_name: e.target.value, 
                  slug: category ? formData.slug : generateSlug(e.target.value) 
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Parent Category</label>
              <select
                value={formData.parent_category_id}
                onChange={(e) => setFormData({ ...formData, parent_category_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">None (Top Level)</option>
                {categories.filter(c => c.category_id !== category?.category_id).map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}