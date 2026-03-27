// ==================================
// FILE: src/pages/inventory/CategoriesPage.jsx
// ==================================
import React, { useState } from 'react';
import { ChevronLeft, FolderTree, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useCategories } from '../../../hooks/useCategories';
import CategoryForm from './CategoryForm';
import { showSuccess, showError, showConfirm } from '../../../utils/alerts';
import { useNavigate } from 'react-router-dom';

export default function CategoriesPage() {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  // Update handleSave:
const handleSave = async (categoryData) => {
  try {
    if (editingCategory) {
      await updateCategory(editingCategory.category_id, categoryData);
      showSuccess('Category updated successfully!');
    } else {
      await createCategory(categoryData);
      showSuccess('Category created successfully!');
    }
    setShowForm(false);
    setEditingCategory(null);
  } catch (err) {
    showError(err.message, 'Failed to save category');
  }
};

// Update handleDelete:
const handleDelete = async (id) => {
  const result = await showConfirm('This category will be deleted. This action cannot be undone.');
  
  if (result.isConfirmed) {
    try {
      await deleteCategory(id);
      showSuccess('Category deleted successfully!');
    } catch (err) {
      showError(err.message, 'Failed to delete category');
    }
  }
};

  const filteredCategories = categories.filter(c =>
    c.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading categories...</div>
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
      <div className="flex items-center mb-6">
                  <button onClick={() => navigate('/inventory/products')} className="flex items-center text-gray-500 hover:text-gray-700">
                    <ChevronLeft className="mr-2" size={20} />
                    <span className="text-sm">Go to Products</span>
                  </button>
                </div>

      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
          <FolderTree className="text-purple-600" size={20} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
  <p className="text-sm text-purple-800">
    <strong>Purpose:</strong> Organize products into categories and subcategories. Use hierarchical categories 
    (parent and child) to create a logical product structure. For example: Footwear (parent) → Running Shoes (child). 
    This helps with product navigation and filtering.
  </p>
</div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Current Category Overview</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search item or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <button
              onClick={() => { setShowForm(true); setEditingCategory(null); }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {showForm && (
          <CategoryForm
            category={editingCategory}
            categories={categories}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingCategory(null); }}
          />
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Category Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Parent</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Slug</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.category_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{category.category_id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.category_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {category.parent_category_id 
                        ? categories.find(c => c.category_id === category.parent_category_id)?.category_name || '-'
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{category.slug}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        {category.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => { setEditingCategory(category); setShowForm(true); }} 
                        className="text-blue-600 hover:text-blue-800 inline-flex"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.category_id)} 
                        className="text-red-600 hover:text-red-800 inline-flex"
                      >
                        <Trash2 size={16} />
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