// ==================================
// FILE: src/pages/inventory/BrandsPage.jsx
// ==================================
import React, { useState } from 'react';
import { ChevronLeft, Tag, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useBrands } from '../../../hooks/useBrands';
import BrandForm from './BrandForm';
import { showSuccess, showError, showConfirm } from '../../../utils/alerts';
import { useNavigate } from 'react-router-dom';

export default function BrandsPage() {
  const { brands, loading, error, createBrand, updateBrand, deleteBrand } = useBrands();
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSave = async (brandData) => {
  try {
    if (editingBrand) {
      await updateBrand(editingBrand.brand_id, brandData);
      showSuccess('Brand updated successfully!');
    } else {
      await createBrand(brandData);
      showSuccess('Brand created successfully!');
    }
    setShowForm(false);
    setEditingBrand(null);
  } catch (err) {
    showError(err.message, 'Failed to save brand');
  }
};

  const handleDelete = async (id) => {
  const result = await showConfirm('This brand will be deleted. This action cannot be undone.');
  
  if (result.isConfirmed) {
    try {
      await deleteBrand(id);
      showSuccess('Brand deleted successfully!');
    } catch (err) {
      showError(err.message, 'Failed to delete brand');
    }
  }
};

  const filteredBrands = brands.filter(b =>
    b.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading brands...</div>
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
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
          <Tag className="text-orange-600" size={20} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Brand Management</h1>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
  <p className="text-sm text-orange-800">
    <strong>Purpose:</strong> Manage product brands and manufacturers. Brands help organize your products 
    and make it easier for customers to find items from their preferred manufacturers. Add brands like Nike, 
    Adidas, or your own house brand here.
  </p>
</div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Current Brand Overview</h2>
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
              onClick={() => { setShowForm(true); setEditingBrand(null); }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
            >
              
              <span>Add Brand</span>
            </button>
          </div>
        </div>

        {showForm && (
          <BrandForm
            brand={editingBrand}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingBrand(null); }}
          />
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Brand Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No brands found
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.brand_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{brand.brand_id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{brand.brand_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{brand.description || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        {brand.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => { setEditingBrand(brand); setShowForm(true); }} 
                        className="text-blue-600 hover:text-blue-800 inline-flex"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(brand.brand_id)} 
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