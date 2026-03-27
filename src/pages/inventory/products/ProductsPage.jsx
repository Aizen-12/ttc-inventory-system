// ==================================
// FILE: src/pages/inventory/products/ProductsPage.jsx
// ==================================
import React, { useState } from 'react';
import { ChevronLeft, Package, Search, Plus, Edit2 } from 'lucide-react';
import { useProducts } from '../../../hooks/useProducts';
import { useBrands } from '../../../hooks/useBrands';
import { useCategories } from '../../../hooks/useCategories';
import { useVariants } from '../../../hooks/useVariants';
import ProductForm from './ProductsForm';
import VariantForm from './VariantForm';
import { showSuccess, showError, showConfirm } from '../../../utils/alerts';
import { useNavigate } from 'react-router-dom';


export default function ProductsPage() {
  const { products, loading, error, createProduct, updateProduct } = useProducts();
  const { brands } = useBrands();
  const { categories } = useCategories();
  const { variants, createVariant } = useVariants();
  const navigate = useNavigate();
  const [showProductForm, setShowProductForm] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  const handleSaveProduct = async (productData) => {
  try {
    if (editingProduct) {
      await updateProduct(editingProduct.product_id, productData);
      showSuccess('Product updated successfully!');
    } else {
      await createProduct(productData);
      showSuccess('Product created successfully!');
    }
    setShowProductForm(false);
    setEditingProduct(null);
  } catch (err) {
    showError(err.message, 'Failed to save product');
  }
};

// Update handleSaveVariant:
const handleSaveVariant = async (variantData) => {
  try {
    await createVariant({ ...variantData, product_id: selectedProduct.product_id });
    showSuccess('Variant created successfully!');
    setShowVariantForm(false);
  } catch (err) {
    showError(err.message, 'Failed to save variant');
  }
};

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id?.toString() === selectedCategory;
    const matchesBrand = !selectedBrand || product.brand_id?.toString() === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
  };

  const activeFiltersCount = [selectedCategory, selectedBrand].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading products...</div>
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
            <button onClick={() => navigate('/Dashboard')} className="flex items-center text-gray-500 hover:text-gray-700">
              <ChevronLeft className="mr-2" size={20} />
              <span className="text-sm">Back to Dashboard</span>
            </button>
          </div>

      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
          <Package className="text-blue-600" size={20} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
  <p className="text-sm text-blue-800">
    <strong>Purpose:</strong> Manage your product catalog and variants. A product represents the general item 
    (e.g., "Air Force 1"), while variants represent specific versions (e.g., "Black/Size 41", "White/Size 42"). 
    Each variant has its own SKU, price, and inventory tracking.
  </p>
</div> 

      <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.parent_category_id ? '  ↳ ' : ''}{cat.category_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand.brand_id} value={brand.brand_id}>{brand.brand_name}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => { setShowProductForm(true); setEditingProduct(null); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            
            <span>Add Product</span>
          </button>
        </div>
        {activeFiltersCount > 0 && (
          <div className="mt-3 flex items-center space-x-2">
            <span className="text-sm text-gray-600">{activeFiltersCount} filters active</span>
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800">Clear all</button>
          </div>
        )}
      </div>

      {showProductForm && (
        <ProductForm 
          product={editingProduct} 
          brands={brands} 
          categories={categories} 
          onSave={handleSaveProduct} 
          onCancel={() => setShowProductForm(false)} 
        />
      )}
      
      {showVariantForm && (
        <VariantForm 
          product={selectedProduct} 
          onSave={handleSaveVariant} 
          onCancel={() => setShowVariantForm(false)} 
        />
      )}

      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.product_id} className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{product.product_name}</h3>
                    <p className="text-sm text-gray-500">
                      {product.brand?.brand_name} • {product.category?.category_name}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => { setSelectedProduct(product); setShowVariantForm(true); }} 
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      Add Variant
                    </button>
                    <button 
                      onClick={() => { setEditingProduct(product); setShowProductForm(true); }} 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">SKU</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Variant</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Color</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Size</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Price</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {variants.filter(v => v.product_id === product.product_id).map((variant) => (
                      <tr key={variant.variant_id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-mono text-xs">{variant.sku}</td>
                        <td className="px-6 py-3">{variant.variant_name}</td>
                        <td className="px-6 py-3">{variant.color || '-'}</td>
                        <td className="px-6 py-3">{variant.size || '-'}</td>
                        <td className="px-6 py-3 text-right">₱{parseFloat(variant.unit_price).toLocaleString()}</td>
                        <td className="px-6 py-3 text-right text-gray-500">
                          {variant.unit_cost ? `₱${parseFloat(variant.unit_cost).toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    ))}
                    {variants.filter(v => v.product_id === product.product_id).length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500 text-sm">
                          No variants yet. Click "Add Variant" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}