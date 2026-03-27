// ==================================
// FILE: src/pages/inventory/customers/CustomerDetailsPage.jsx
// ==================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, MessageCircle, MapPin, ShoppingBag, Award, Edit2 } from 'lucide-react';
import { customersAPI } from '../../../services/api/customers';
import CustomerForm from './CustomerForm';
import OrderStatusBadge from '../orders/OrderStatusBadge';
import { showSuccess, showError } from '../../../utils/alerts';

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const data = await customersAPI.getCustomerStats(id);
      setCustomer(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCustomer = async (customerData) => {
    try {
      await customersAPI.update(id, customerData);
      await fetchCustomer();
      setShowEditForm(false);
      showSuccess('Customer updated successfully!');
    } catch (err) {
      showError(err.message, 'Failed to update customer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading customer details...</div>
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

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Customer not found</div>
      </div>
    );
  }

  const totalOrders = customer.orders?.length || 0;
  const completedOrders = customer.orders?.filter(o => o.order_status === 'Delivered').length || 0;

  return (
    <div>
      <div onClick={() => navigate('/inventory/customers')} className="flex items-center mb-6 cursor-pointer">
        <ChevronLeft className="text-gray-400 mr-2" size={20} />
        <span className="text-sm text-gray-500">Back to Customers</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl text-purple-600 font-bold">
              {customer.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.full_name}</h1>
            <p className="text-sm text-gray-500">Customer since {new Date(customer.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <button
          onClick={() => setShowEditForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <Edit2 size={18} />
          <span>Edit Customer</span>
        </button>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <CustomerForm
          customer={customer}
          onSave={handleUpdateCustomer}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Customer Info */}
        <div className="col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="text-gray-400 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium">{customer.email}</p>
                </div>
              </div>

              {customer.phone && (
                <div className="flex items-center">
                  <Phone className="text-gray-400 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{customer.phone}</p>
                  </div>
                </div>
              )}

              {customer.messenger_account && (
                <div className="flex items-center">
                  <MessageCircle className="text-gray-400 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Messenger</p>
                    <p className="text-sm font-medium">{customer.messenger_account}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Preferred Contact Method</p>
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded capitalize mt-1 inline-block">
                    {customer.preferred_contact || 'phone'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MapPin className="mr-2" size={20} />
              Addresses
            </h2>
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="space-y-3">
                {customer.addresses.filter(a => !a.deleted_at).map((address) => (
                  <div key={address.address_id} className="border rounded-lg p-4 relative">
                    {address.is_default && (
                      <span className="absolute top-2 right-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                    <p className="font-medium text-sm text-purple-600">
                      {address.address_type === 'Both' ? 'Billing & Shipping' : address.address_type}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {address.street_address}
                      {address.barangay && `, Brgy. ${address.barangay}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.province} {address.postal_code}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No addresses added yet</p>
            )}
          </div>

          {/* Order History */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <ShoppingBag className="mr-2" size={20} />
              Order History ({totalOrders})
            </h2>
            {customer.orders && customer.orders.length > 0 ? (
              <div className="space-y-3">
                {customer.orders
                  .sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
                  .slice(0, 10)
                  .map((order) => (
                    <div 
                      key={order.order_id} 
                      onClick={() => navigate(`/inventory/orders/${order.order_id}`)}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-blue-600">{order.order_number}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.order_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₱{parseFloat(order.total_amount).toLocaleString()}</p>
                          <div className="flex space-x-2 mt-1">
                            <OrderStatusBadge status={order.order_status} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Orders</p>
                <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-purple-600">
                  ₱{parseFloat(customer.total_spent || 0).toLocaleString()}
                </p>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="text-yellow-500 mr-2" size={20} />
                    <span className="text-sm text-gray-500">Loyalty Points</span>
                  </div>
                  <span className="text-xl font-bold text-yellow-600">
                    {customer.loyalty_points || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Account Status</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  customer.status === 'Active' ? 'bg-green-100 text-green-700' :
                  customer.status === 'Inactive' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {customer.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-sm font-medium">
                  {new Date(customer.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              {customer.updated_at && customer.updated_at !== customer.created_at && (
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium">
                    {new Date(customer.updated_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/inventory/orders/create', { state: { customer } })}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Order
              </button>
              <button
                onClick={() => window.location.href = `mailto:${customer.email}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Send Email
              </button>
              {customer.phone && (
                <button
                  onClick={() => window.location.href = `tel:${customer.phone}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Call Customer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}