// ==================================
// FILE: src/pages/inventory/customers/CustomersPage.jsx
// ==================================
import React, { useState } from 'react';
import { ChevronLeft, Users, Search, Plus, Eye, Edit2, MapPin } from 'lucide-react';
import { useCustomers } from '../../../hooks/useCustomers';
import { useNavigate } from 'react-router-dom';
import CustomerForm from './CustomerForm';
import { showSuccess, showError, showConfirm } from '../../../utils/alerts';

export default function CustomersPage() {
  const navigate = useNavigate();
  const { customers, loading, error, createCustomer, updateCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    
    const matchesStatus = !statusFilter || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSaveCustomer = async (customerData) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.customer_id, customerData);
        showSuccess('Customer updated successfully!');
      } else {
        await createCustomer(customerData);
        showSuccess('Customer created successfully!');
      }
      setShowCustomerForm(false);
      setEditingCustomer(null);
    } catch (err) {
      showError(err.message, 'Failed to save customer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading customers...</div>
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
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <Users className="text-purple-600" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
        </div>

        
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-purple-800">
          <strong>Purpose:</strong> Manage your customer database. Track contact information, delivery addresses, 
          order history, and loyalty points. Customer data is shared with your e-commerce system for seamless 
          order processing.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
          onClick={() => { setShowCustomerForm(true); setEditingCustomer(null); }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
        >
          
          <span>Add Customer</span>
        </button>
        </div>
      </div>

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          onCancel={() => { setShowCustomerForm(false); setEditingCustomer(null); }}
        />
      )}

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Preferred Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Points</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter 
                      ? 'No customers match your filters' 
                      : 'No customers yet. Add your first customer!'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.customer_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-purple-600 font-semibold">
                            {customer.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.full_name}</div>
                          <div className="text-xs text-gray-500">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.phone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded capitalize">
                        {customer.preferred_contact || 'phone'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {customer.total_orders || 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₱{parseFloat(customer.total_spent || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {customer.loyalty_points || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        customer.status === 'Active' ? 'bg-green-100 text-green-700' :
                        customer.status === 'Inactive' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/inventory/customers/${customer.customer_id}`)}
                          className="text-purple-600 hover:text-purple-800"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => { setEditingCustomer(customer); setShowCustomerForm(true); }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredCustomers.length} of {customers.length} customers</span>
          </div>
        </div>
      </div>
    </div>
  );
}