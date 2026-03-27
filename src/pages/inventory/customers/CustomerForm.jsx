// ==================================
// FILE: src/pages/inventory/customers/CustomerForm.jsx
// ==================================
import React, { useState, useEffect } from 'react';
import { X, MapPin, Plus, Trash2 } from 'lucide-react';
import { customersAPI } from '../../../services/api/customers';

export default function CustomerForm({ customer, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    messenger_account: '',
    preferred_contact: 'phone',
    status: 'Active'
  });

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        messenger_account: customer.messenger_account || '',
        preferred_contact: customer.preferred_contact || 'phone',
        status: customer.status || 'Active'
      });
      if (customer.addresses) {
        setAddresses(customer.addresses.filter(a => !a.deleted_at));
      }
    }
  }, [customer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save customer first
    const savedCustomer = await onSave(formData);
    
    // Then save addresses if new customer
    if (!customer && addresses.length > 0) {
      for (const address of addresses) {
        await customersAPI.createAddress({
          ...address,
          customer_id: savedCustomer.customer_id
        });
      }
    }
  };

  const handleAddAddress = (addressData) => {
    if (customer) {
      // If editing existing customer, save directly to DB
      customersAPI.createAddress({
        ...addressData,
        customer_id: customer.customer_id
      }).then(() => {
        setAddresses([...addresses, addressData]);
        setShowAddressForm(false);
      });
    } else {
      // If new customer, just add to state
      setAddresses([...addresses, addressData]);
      setShowAddressForm(false);
    }
  };

  const handleRemoveAddress = (index) => {
    const address = addresses[index];
    if (address.address_id) {
      customersAPI.deleteAddress(address.address_id);
    }
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Juan Dela Cruz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="juan@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="0917-123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Messenger Account</label>
                <input
                  type="text"
                  value={formData.messenger_account}
                  onChange={(e) => setFormData({ ...formData, messenger_account: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="@juandelacruz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preferred Contact Method</label>
                <select
                  value={formData.preferred_contact}
                  onChange={(e) => setFormData({ ...formData, preferred_contact: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="phone">Phone</option>
                  <option value="messenger">Messenger</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="mr-2" size={20} />
                Addresses
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressForm(true)}
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <MapPin className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm text-gray-500">No addresses added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address, index) => (
                  <div key={index} className="border rounded-lg p-4 relative">
                    {address.is_default && (
                      <span className="absolute top-2 right-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {address.address_type === 'Both' ? 'Billing & Shipping' : address.address_type}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.street_address}
                          {address.barangay && `, Brgy. ${address.barangay}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.province} {address.postal_code}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAddress(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Address Form */}
          {showAddressForm && (
            <AddressForm
              onSave={handleAddAddress}
              onCancel={() => setShowAddressForm(false)}
            />
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {customer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Address Sub-Form Component
function AddressForm({ onSave, onCancel }) {
  const [addressData, setAddressData] = useState({
    address_type: 'Shipping',
    street_address: '',
    barangay: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Philippines',
    is_default: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(addressData);
  };

  return (
    <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
      <h4 className="font-semibold mb-3">Add New Address</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={addressData.address_type}
              onChange={(e) => setAddressData({ ...addressData, address_type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="Shipping">Shipping</option>
              <option value="Billing">Billing</option>
              <option value="Both">Both</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={addressData.is_default}
                onChange={(e) => setAddressData({ ...addressData, is_default: e.target.checked })}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm">Set as default</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Street Address *</label>
          <input
            type="text"
            required
            value={addressData.street_address}
            onChange={(e) => setAddressData({ ...addressData, street_address: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            placeholder="123 Main Street"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Barangay</label>
            <input
              type="text"
              value={addressData.barangay}
              onChange={(e) => setAddressData({ ...addressData, barangay: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Barangay Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <input
              type="text"
              required
              value={addressData.city}
              onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Quezon City"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Province *</label>
            <input
              type="text"
              required
              value={addressData.province}
              onChange={(e) => setAddressData({ ...addressData, province: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Metro Manila"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Postal Code *</label>
            <input
              type="text"
              required
              value={addressData.postal_code}
              onChange={(e) => setAddressData({ ...addressData, postal_code: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="1100"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Add Address
          </button>
        </div>
      </form>
    </div>
  );
}