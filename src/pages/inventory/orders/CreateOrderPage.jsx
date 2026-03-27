// ==================================
// FILE: src/pages/inventory/orders/CreateOrderPage.jsx (ENHANCED)
// ==================================
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Plus, Trash2, UserPlus, Filter, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomers } from '../../../hooks/useCustomers';
import { useProducts } from '../../../hooks/useProducts';
import { useVariants } from '../../../hooks/useVariants';
import { useInventory } from '../../../hooks/useInventory';
import { useBrands } from '../../../hooks/useBrands';
import { useCategories } from '../../../hooks/useCategories';
import { ordersAPI } from '../../../services/api/orders';
import { customersAPI } from '../../../services/api/customers';
import { showSuccess, showError, showLoading, closeLoading } from '../../../utils/alerts';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchByEmail, createCustomer } = useCustomers();
  const { products } = useProducts();
  const { variants } = useVariants();
  const { inventory } = useInventory();
  const { brands } = useBrands();
  const { categories } = useCategories();

  const [step, setStep] = useState(1);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customer, setCustomer] = useState(null);
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [orderDetails, setOrderDetails] = useState({
    payment_method: 'cod',
    delivery_method: 'delivery',
    delivery_address_id: null,
    delivery_fee: 0,
    discount_amount: 0,
    customer_notes: '',
    contact_method: 'phone',
    contact_value: ''
  });

  // If customer passed from navigation (e.g., from customer details page)
  useEffect(() => {
    if (location.state?.customer) {
      setCustomer(location.state.customer);
      setStep(2);
      if (location.state.customer.addresses) {
        setCustomerAddresses(location.state.customer.addresses.filter(a => !a.deleted_at));
      }
    }
  }, [location.state]);

  // Step 1: Find or Create Customer
  const handleSearchCustomer = async () => {
    try {
      const found = await searchByEmail(customerEmail);
      if (found) {
        const fullCustomer = await customersAPI.getById(found.customer_id);
        setCustomer(fullCustomer);
        setCustomerAddresses(fullCustomer.addresses?.filter(a => !a.deleted_at) || []);
        setOrderDetails({
          ...orderDetails,
          contact_method: fullCustomer.preferred_contact || 'phone',
          contact_value: fullCustomer[fullCustomer.preferred_contact] || fullCustomer.phone || fullCustomer.email
        });
        setStep(2);
      } else {
        setShowNewCustomerForm(true);
      }
    } catch (err) {
      showError(err.message, 'Error searching customer');
    }
  };

  const handleCreateCustomer = async (customerData) => {
  try {
    showLoading('Creating customer...');

    // 1️⃣ Split customer vs address
    const { address, ...customerOnly } = customerData;

    // 2️⃣ Create customer (NO address included)
    const newCustomer = await createCustomer({
      ...customerOnly,
      email: customerEmail
    });

    // 3️⃣ Create address separately (if provided)
    if (address) {
      const savedAddress = await customersAPI.createAddress({
        ...address,
        customer_id: newCustomer.customer_id
      });

      setCustomerAddresses([savedAddress]);
      setOrderDetails(prev => ({
        ...prev,
        delivery_address_id: savedAddress.address_id
      }));
    }

    closeLoading();
    setCustomer(newCustomer);
    setShowNewCustomerForm(false);
    setStep(2);
    showSuccess('Customer created successfully!');
  } catch (err) {
    closeLoading();
    showError(err.message, 'Failed to create customer');
  }
};


  // Step 2: Add Items
  const handleAddItem = (variant) => {
    const existingItem = orderItems.find(item => item.variant_id === variant.variant_id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.variant_id === variant.variant_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const product = products.find(p => p.product_id === variant.product_id);
      const inventoryRecord = inventory.find(i => i.variant_id === variant.variant_id);
      
      setOrderItems([...orderItems, {
        variant_id: variant.variant_id,
        product_name: product?.product_name || '',
        variant_name: variant.variant_name,
        sku: variant.sku,
        quantity: 1,
        unit_price: parseFloat(variant.unit_price),
        discount_amount: 0,
        available_stock: inventoryRecord?.quantity_unreserved || 0
      }]);
    }
  };

  const handleUpdateQuantity = (variantId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(variantId);
      return;
    }
    
    setOrderItems(orderItems.map(item =>
      item.variant_id === variantId
        ? { ...item, quantity: parseInt(newQuantity) }
        : item
    ));
  };

  const handleRemoveItem = (variantId) => {
    setOrderItems(orderItems.filter(item => item.variant_id !== variantId));
  };

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => 
    sum + (item.unit_price * item.quantity), 0
  );
  const totalDiscount = parseFloat(orderDetails.discount_amount || 0);
  const deliveryFee = parseFloat(orderDetails.delivery_fee || 0);
  const taxAmount = 0;
  const totalAmount = subtotal - totalDiscount + deliveryFee + taxAmount;

  // Step 3: Create Order
  const handleCreateOrder = async () => {
    try {
      showLoading('Creating order...');
      
      const order = await ordersAPI.create({
        customer_id: customer.customer_id,
        subtotal,
        discount_amount: totalDiscount,
        tax_amount: taxAmount,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        payment_method: orderDetails.payment_method,
        delivery_method: orderDetails.delivery_method,
        delivery_address_id: orderDetails.delivery_address_id,
        customer_notes: orderDetails.customer_notes,
        contact_method: orderDetails.contact_method,
        contact_value: orderDetails.contact_value,
        order_status: 'Pending',
        payment_status: 'Pending'
      });

      const items = orderItems.map(item => ({
        order_id: order.order_id,
        variant_id: item.variant_id,
        product_name: item.product_name,
        variant_name: item.variant_name,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_amount: item.discount_amount,
        tax_amount: 0,
        subtotal: (item.unit_price * item.quantity) - item.discount_amount
      }));
      
      await ordersAPI.createOrderItems(items);

      closeLoading();
      await showSuccess('Order created successfully!', 'Success!');
      navigate('/inventory/orders');
    } catch (err) {
      closeLoading();
      showError(err.message, 'Failed to create order');
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/inventory/orders')} className="flex items-center text-gray-500 hover:text-gray-700">
          <ChevronLeft className="mr-2" size={20} />
          <span className="text-sm">Back to Orders</span>
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Order</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>How it works:</strong> This 3-step wizard helps you create orders efficiently. 
          <strong> Step 1:</strong> Find or create customer. 
          <strong> Step 2:</strong> Add products and check stock availability. 
          <strong> Step 3:</strong> Review totals and submit. The system will automatically reserve inventory when confirmed.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
            <span className="ml-2 font-medium">Customer</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
            <span className="ml-2 font-medium">Items</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
            <span className="ml-2 font-medium">Review</span>
          </div>
        </div>
      </div>

      {/* Step 1: Customer */}
      {step === 1 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Find or Create Customer</h2>
          
          {!showNewCustomerForm ? (
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    placeholder="Enter customer email..."
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchCustomer()}
                  />
                </div>
                <button
                  onClick={handleSearchCustomer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Search or Create
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Enter email to find existing customer or create new one
              </p>
            </div>
          ) : (
            <NewCustomerForm
              email={customerEmail}
              onSave={handleCreateCustomer}
              onCancel={() => setShowNewCustomerForm(false)}
            />
          )}
        </div>
      )}

      {/* Step 2: Add Items */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Customer</h2>
                <p className="text-sm text-gray-600">{customer?.full_name} • {customer?.email}</p>
                {customer?.phone && <p className="text-xs text-gray-500">Phone: {customer.phone}</p>}
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Change
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Add Items</h2>
            
            <EnhancedVariantSelector
              variants={variants}
              products={products}
              brands={brands}
              categories={categories}
              inventory={inventory}
              onSelectVariant={handleAddItem}
            />

            {orderItems.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Order Items ({orderItems.length})</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.variant_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">{item.variant_name} • {item.sku}</p>
                        <p className={`text-xs ${item.available_stock < item.quantity ? 'text-red-600' : 'text-gray-400'}`}>
                          Available: {item.available_stock}
                          {item.available_stock < item.quantity && ' (Insufficient stock!)'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <input
                          type="number"
                          min="1"
                          max={item.available_stock}
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.variant_id, e.target.value)}
                          className="w-20 px-2 py-1 border rounded text-center"
                        />
                        <span className="w-24 text-right font-semibold">
                          ₱{(item.unit_price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.variant_id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {orderItems.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={orderItems.some(item => item.quantity > item.available_stock)}
                >
                  Continue to Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select
                    value={orderDetails.payment_method}
                    onChange={(e) => setOrderDetails({ ...orderDetails, payment_method: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="gcash">GCash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Method</label>
                  <select
                    value={orderDetails.delivery_method}
                    onChange={(e) => setOrderDetails({ ...orderDetails, delivery_method: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="delivery">Delivery</option>
                    <option value="pickup">Pickup</option>
                    <option value="express">Express Delivery</option>
                  </select>
                </div>
              </div>

              {/* Delivery Address Selection */}
              {orderDetails.delivery_method === 'delivery' && customerAddresses.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Address</label>
                  <select
                    value={orderDetails.delivery_address_id || ''}
                    onChange={(e) => setOrderDetails({ ...orderDetails, delivery_address_id: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select an address...</option>
                    {customerAddresses.map((addr) => (
                      <option key={addr.address_id} value={addr.address_id}>
                        {addr.street_address}, {addr.city}, {addr.province} {addr.is_default ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Contact Method */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Method</label>
                  <select
                    value={orderDetails.contact_method}
                    onChange={(e) => setOrderDetails({ ...orderDetails, contact_method: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="phone">Phone</option>
                    <option value="messenger">Messenger</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Contact Value</label>
                  <input
                    type="text"
                    value={orderDetails.contact_value}
                    onChange={(e) => setOrderDetails({ ...orderDetails, contact_value: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder={
                      orderDetails.contact_method === 'phone' ? '0917-123-4567' :
                      orderDetails.contact_method === 'messenger' ? '@customer' :
                      'customer@email.com'
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Customer Notes</label>
                <textarea
                  value={orderDetails.customer_notes}
                  onChange={(e) => setOrderDetails({ ...orderDetails, customer_notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Special instructions or notes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Delivery Fee</label>
                  <input
                    type="number"
                    value={orderDetails.delivery_fee}
                    onChange={(e) => setOrderDetails({ ...orderDetails, delivery_fee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount</label>
                  <input
                    type="number"
                    value={orderDetails.discount_amount}
                    onChange={(e) => setOrderDetails({ ...orderDetails, discount_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span className="text-red-600">-₱{totalDiscount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee:</span>
                  <span>₱{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>₱{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleCreateOrder}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ENHANCED Variant Selector with Filters
function EnhancedVariantSelector({ variants, products, brands, categories, inventory, onSelectVariant }) {
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredVariants = variants.filter(v => {
    const product = products.find(p => p.product_id === v.product_id);
    const matchesSearch = 
      v.sku?.toLowerCase().includes(search.toLowerCase()) ||
      v.variant_name?.toLowerCase().includes(search.toLowerCase()) ||
      product?.product_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesBrand = !brandFilter || product?.brand_id?.toString() === brandFilter;
    const matchesCategory = !categoryFilter || product?.category_id?.toString() === categoryFilter;
    
    return matchesSearch && matchesBrand && matchesCategory;
  }).slice(0, 20);

  const clearFilters = () => {
    setBrandFilter('');
    setCategoryFilter('');
  };

  const activeFiltersCount = [brandFilter, categoryFilter].filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center space-x-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products by SKU or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg flex items-center space-x-2 ${activeFiltersCount > 0 ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
        >
          <Filter size={18} />
          {activeFiltersCount > 0 && <span className="text-sm">({activeFiltersCount})</span>}
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">Filters</h4>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-800">
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Brand</label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand.brand_id} value={brand.brand_id}>{brand.brand_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {search && filteredVariants.length > 0 && (
        <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
          {filteredVariants.map((variant) => {
            const product = products.find(p => p.product_id === variant.product_id);
            const stock = inventory.find(i => i.variant_id === variant.variant_id);
            const availableStock = stock?.quantity_unreserved || 0;
            
            return (
              <button
                key={variant.variant_id}
                onClick={() => onSelectVariant(variant)}
                disabled={availableStock === 0}
                className={`w-full p-3 hover:bg-gray-50 text-left flex items-center justify-between ${availableStock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex-1">
                  <p className="font-medium">{product?.product_name}</p>
                  <p className="text-sm text-gray-500">{variant.variant_name} • {variant.sku}</p>
                  <p className={`text-xs ${availableStock === 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {availableStock === 0 ? 'Out of stock' : `Stock: ${availableStock}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-semibold">₱{parseFloat(variant.unit_price).toLocaleString()}</span>
                  {availableStock > 0 && (
                    <div className="text-xs text-green-600 flex items-center justify-end mt-1">
                      <Plus size={12} className="mr-1" />
                      Add
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {search && filteredVariants.length === 0 && (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-sm text-gray-500">No products found matching your search</p>
        </div>
      )}
    </div>
  );
}

// New Customer Form with Address
function NewCustomerForm({ email, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    messenger_account: '',
    preferred_contact: 'phone',
    address: null
  });
  
  const [showAddressForm, setShowAddressForm] = useState(false);

  const handleSubmit = () => {
    if (!formData.full_name) {
      showError('Please enter customer name');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="border-t pt-4">
      <div className="flex items-center space-x-2 mb-4">
        <UserPlus className="text-blue-600" size={20} />
        <h3 className="font-semibold">Create New Customer</h3>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 border rounded-lg bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0917-123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Messenger</label>
            <input
              type="text"
              value={formData.messenger_account}
              onChange={(e) => setFormData({ ...formData, messenger_account: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="@username"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Preferred Contact</label>
          <select
            value={formData.preferred_contact}
            onChange={(e) => setFormData({ ...formData, preferred_contact: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="phone">Phone</option>
            <option value="messenger">Messenger</option>
            <option value="email">Email</option>
          </select>
        </div>

        {!showAddressForm && !formData.address && (
          <button
            type="button"
            onClick={() => setShowAddressForm(true)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Add Delivery Address (Optional)
          </button>
        )}

        {formData.address && (
          <div className="border rounded-lg p-3 bg-green-50">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">Delivery Address Added</p>
                <p className="text-xs text-gray-600 mt-1">{formData.address.street_address}</p>
                <p className="text-xs text-gray-600">{formData.address.city}, {formData.address.province}</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, address: null })}
                className="text-red-600 hover:text-red-800"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {showAddressForm && !formData.address && (
          <QuickAddressForm
            onSave={(addr) => {
              setFormData({ ...formData, address: addr });
              setShowAddressForm(false);
            }}
            onCancel={() => setShowAddressForm(false)}
          />
        )}

        <div className="flex space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.full_name}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Customer & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// Quick Address Form
function QuickAddressForm({ onSave, onCancel }) {
  const [addressData, setAddressData] = useState({
    address_type: 'Shipping',
    street_address: '',
    barangay: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Philippines',
    is_default: true
  });

  return (
    <div className="border rounded-lg p-3 bg-blue-50">
      <h4 className="font-medium text-sm mb-3">Add Delivery Address</h4>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Street Address *"
          value={addressData.street_address}
          onChange={(e) => setAddressData({ ...addressData, street_address: e.target.value })}
          className="w-full px-3 py-2 text-sm border rounded-lg"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Barangay"
            value={addressData.barangay}
            onChange={(e) => setAddressData({ ...addressData, barangay: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-lg"
          />
          <input
            type="text"
            placeholder="City *"
            value={addressData.city}
            onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-lg"
          />
          <input
            type="text"
            placeholder="Province *"
            value={addressData.province}
            onChange={(e) => setAddressData({ ...addressData, province: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-lg"
          />
          <input
            type="text"
            placeholder="Postal Code *"
            value={addressData.postal_code}
            onChange={(e) => setAddressData({ ...addressData, postal_code: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-lg"
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!addressData.street_address || !addressData.city || !addressData.province || !addressData.postal_code) {
                showError('Please fill in all required address fields');
                return;
              }
              onSave(addressData);
            }}
            className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Address
          </button>
        </div>
      </div>
    </div>
  );
}