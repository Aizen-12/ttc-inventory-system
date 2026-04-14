//==================================
// FILE: src/pages/VendorsPage.jsx
// ==================================
import React, { useState } from 'react';
import { ChevronLeft, Truck, Search, Plus, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import { useVendors } from '../../../hooks/useVendors';
import VendorForm from './VendorsForm';
import { showSuccess, showError, showConfirm } from '../../../utils/alerts';
import { useNavigate } from 'react-router-dom';
export default function VendorsPage() {
  const { vendors, loading, error, createVendor, updateVendor, deleteVendor } = useVendors();
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const handleSave = async (vendorData) => {
  try {
    if (editingVendor) {
      await updateVendor(editingVendor.vendor_id, vendorData);
      showSuccess('Vendor updated successfully!');
    } else {
      await createVendor(vendorData);
      showSuccess('Vendor created successfully!');
    }
    setShowForm(false);
    setEditingVendor(null);
  } catch (err) {
    showError(err.message, 'Failed to save vendor');
  }
};

// Update handleDelete:
const handleDelete = async (id) => {
  const result = await showConfirm('This vendor will be deleted. This action cannot be undone.');
  
  if (result.isConfirmed) {
    try {
      await deleteVendor(id);
      showSuccess('Vendor deleted successfully!');
    } catch (err) {
      showError(err.message, 'Failed to delete vendor');
    }
  }
};

  const filteredVendors = vendors.filter(v =>
    v.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vendor_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading vendors...</div>
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
                  <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-gray-700">
                    <ChevronLeft className="mr-2" size={20} />
                    <span className="text-sm">Back to Dashboard</span>
                  </button>
                </div>

      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
          <Truck className="text-indigo-600" size={20} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
  <p className="text-sm text-indigo-800">
    <strong>Purpose:</strong> Maintain a directory of your suppliers and vendors. Store contact information, 
    addresses, and vendor codes for easy reference. This helps when you need to reorder products or contact 
    suppliers for on-demand items.
  </p>
</div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold mb-4">Suppliers & Vendors</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              onClick={() => { setShowForm(true); setEditingVendor(null); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
             
              <span>Add Vendor</span>
            </button>
          </div>
        </div>

        {showForm && (
          <VendorForm
            vendor={editingVendor}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingVendor(null); }}
          />
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Code</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Vendor Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Contact Person</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Contact Info</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Address</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No vendors found
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.vendor_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{vendor.vendor_code}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{vendor.vendor_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{vendor.contact_person || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {vendor.phone && (
                        <div className="flex items-center space-x-1 mb-1">
                          <Phone size={14} className="text-gray-400" />
                          <span>{vendor.phone}</span>
                        </div>
                      )}
                      {vendor.email && (
                        <div className="flex items-center space-x-1">
                          <Mail size={14} className="text-gray-400" />
                          <span>{vendor.email}</span>
                        </div>
                      )}
                      {!vendor.phone && !vendor.email && '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{vendor.address || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => { setEditingVendor(vendor); setShowForm(true); }} 
                        className="text-blue-600 hover:text-blue-800 inline-flex"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(vendor.vendor_id)} 
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