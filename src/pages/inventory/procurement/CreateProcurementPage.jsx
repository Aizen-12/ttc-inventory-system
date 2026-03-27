// ==================================
// FILE: src/pages/inventory/procurement/CreateProcurementPage.jsx (FIXED)
// ==================================
import React, { useState } from 'react';
import { ChevronLeft, Search, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVendors } from '../../../hooks/useVendors';
import { useWarehouses } from '../../../hooks/useWarehouses';
import { useVariants } from '../../../hooks/useVariants';
import { useProducts } from '../../../hooks/useProducts';
import { procurementsAPI } from '../../../services/api/procurements';
import { showSuccess, showError, showLoading, closeLoading } from '../../../utils/alerts';
import { getCurrentUser } from '../../../services/api/auth';

export default function CreateProcurementPage() {
  const navigate = useNavigate();
  const { vendors } = useVendors();
  const { warehouses } = useWarehouses();
  const { variants } = useVariants();
  const { products } = useProducts();

  const [step, setStep] = useState(1); // 1: Vendor/Warehouse, 2: Items, 3: Review
  const [procurementData, setProcurementData] = useState({
    vendor_id: '',
    warehouse_id: '',
    expected_delivery_date: '',
    notes: ''
  });

  const [procurementItems, setProcurementItems] = useState([]);

  // Step 2: Add Items
  const handleAddItem = (variant) => {
    const existingItem = procurementItems.find(item => item.variant_id === variant.variant_id);
    
    if (existingItem) {
      setProcurementItems(procurementItems.map(item =>
        item.variant_id === variant.variant_id
          ? { ...item, quantity_ordered: item.quantity_ordered + 1 }
          : item
      ));
    } else {
      const product = products.find(p => p.product_id === variant.product_id);
      
      setProcurementItems([...procurementItems, {
        variant_id: variant.variant_id,
        product_name: product?.product_name || '',
        variant_name: variant.variant_name,
        sku: variant.sku,
        quantity_ordered: 1,
        unit_cost: parseFloat(variant.unit_cost || variant.unit_price),
        batch_number: '',
        manufacture_date: '',
        expiry_date: ''
      }]);
    }
  };

  const handleUpdateQuantity = (variantId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(variantId);
      return;
    }
    
    setProcurementItems(procurementItems.map(item =>
      item.variant_id === variantId
        ? { ...item, quantity_ordered: parseInt(newQuantity) }
        : item
    ));
  };

  const handleUpdateCost = (variantId, newCost) => {
    setProcurementItems(procurementItems.map(item =>
      item.variant_id === variantId
        ? { ...item, unit_cost: parseFloat(newCost) || 0 }
        : item
    ));
  };

  const handleUpdateBatchInfo = (variantId, field, value) => {
    setProcurementItems(procurementItems.map(item =>
      item.variant_id === variantId
        ? { ...item, [field]: value }
        : item
    ));
  };

  const handleRemoveItem = (variantId) => {
    setProcurementItems(procurementItems.filter(item => item.variant_id !== variantId));
  };

  // Calculate totals
  const subtotal = procurementItems.reduce((sum, item) => 
    sum + (item.unit_cost * item.quantity_ordered), 0
  );
  const taxAmount = 0; // Can add tax calculation
  const shippingCost = 0; // Can add shipping
  const totalCost = subtotal + taxAmount + shippingCost;

  // Step 3: Create Procurement
  const handleCreateProcurement = async () => {
    try {
      showLoading('Creating procurement...');
      
      // Get current logged-in user (using your existing auth system)
      const currentUser = getCurrentUser();
      const userId = currentUser?.user_id || null;
      
      // Create procurement
      const procurement = await procurementsAPI.create({
        vendor_id: procurementData.vendor_id,
        warehouse_id: procurementData.warehouse_id,
        user_id: userId, // Will be the logged-in user's ID or null
        expected_delivery_date: procurementData.expected_delivery_date || null,
        subtotal,
        tax_amount: taxAmount,
        shipping_cost: shippingCost,
        total_cost: totalCost,
        notes: procurementData.notes,
        status: 'Draft'
      });

      // Create procurement items
      const items = procurementItems.map(item => ({
        procurement_id: procurement.procurement_id,
        variant_id: item.variant_id,
        quantity_ordered: item.quantity_ordered,
        unit_cost: item.unit_cost,
        tax_amount: 0,
        subtotal: item.unit_cost * item.quantity_ordered,
        batch_number: item.batch_number || null,
        manufacture_date: item.manufacture_date || null,
        expiry_date: item.expiry_date || null
      }));
      
      await procurementsAPI.createProcurementItems(items);

      closeLoading();
      await showSuccess('Procurement created successfully!', 'Success!');
      navigate('/inventory/procurement');
    } catch (err) {
      closeLoading();
      showError(err.message, 'Failed to create procurement');
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/inventory/procurement')} className="flex items-center text-gray-500 hover:text-gray-700">
          <ChevronLeft className="mr-2" size={20} />
          <span className="text-sm">Back to Procurements</span>
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Procurement</h1>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-green-800">
          <strong>How it works:</strong> This 3-step wizard helps you create purchase orders. 
          <strong> Step 1:</strong> Select vendor and warehouse. 
          <strong> Step 2:</strong> Add products with quantities and costs. 
          <strong> Step 3:</strong> Review and submit. Stock will be added to inventory when you mark it as "Received".
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>1</div>
            <span className="ml-2 font-medium">Vendor & Warehouse</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>2</div>
            <span className="ml-2 font-medium">Items</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>3</div>
            <span className="ml-2 font-medium">Review</span>
          </div>
        </div>
      </div>

      {/* Step 1: Vendor & Warehouse */}
      {step === 1 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Select Vendor & Warehouse</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor *</label>
              <select
                value={procurementData.vendor_id}
                onChange={(e) => setProcurementData({ ...procurementData, vendor_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                required
              >
                <option value="">Select a vendor...</option>
                {vendors.map(vendor => (
                  <option key={vendor.vendor_id} value={vendor.vendor_id}>
                    {vendor.vendor_name} ({vendor.vendor_code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Warehouse *</label>
              <select
                value={procurementData.warehouse_id}
                onChange={(e) => setProcurementData({ ...procurementData, warehouse_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                required
              >
                <option value="">Select a warehouse...</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                    {warehouse.warehouse_name} {warehouse.is_primary && '(Primary)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Expected Delivery Date</label>
              <input
                type="date"
                value={procurementData.expected_delivery_date}
                onChange={(e) => setProcurementData({ ...procurementData, expected_delivery_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={procurementData.notes}
                onChange={(e) => setProcurementData({ ...procurementData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                rows="3"
                placeholder="Any special instructions or notes..."
              />
            </div>

            <div className="pt-4">
              <button
                onClick={() => setStep(2)}
                disabled={!procurementData.vendor_id || !procurementData.warehouse_id}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Add Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Add Items */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Selected Details</h2>
                <p className="text-sm text-gray-600">
                  Vendor: {vendors.find(v => v.vendor_id.toString() === procurementData.vendor_id)?.vendor_name} • 
                  Warehouse: {warehouses.find(w => w.warehouse_id.toString() === procurementData.warehouse_id)?.warehouse_name}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Change
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Add Items</h2>
            
            <VariantSelector
              variants={variants}
              products={products}
              onSelectVariant={handleAddItem}
            />

            {procurementItems.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Procurement Items ({procurementItems.length})</h3>
                <div className="space-y-4">
                  {procurementItems.map((item) => (
                    <div key={item.variant_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-gray-500">{item.variant_name} • {item.sku}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.variant_id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity_ordered}
                            onChange={(e) => handleUpdateQuantity(item.variant_id, e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Unit Cost</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_cost}
                            onChange={(e) => handleUpdateCost(item.variant_id, e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Batch Number</label>
                          <input
                            type="text"
                            value={item.batch_number}
                            onChange={(e) => handleUpdateBatchInfo(item.variant_id, 'batch_number', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Expiry Date</label>
                          <input
                            type="date"
                            value={item.expiry_date}
                            onChange={(e) => handleUpdateBatchInfo(item.variant_id, 'expiry_date', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm font-semibold text-right">
                          Subtotal: ₱{(item.unit_cost * item.quantity_ordered).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {procurementItems.length > 0 && (
              <div className="mt-6 pt-4 border-t flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
            <h2 className="text-lg font-semibold mb-4">Procurement Summary</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Vendor</p>
                  <p className="font-medium">{vendors.find(v => v.vendor_id.toString() === procurementData.vendor_id)?.vendor_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Warehouse</p>
                  <p className="font-medium">{warehouses.find(w => w.warehouse_id.toString() === procurementData.warehouse_id)?.warehouse_name}</p>
                </div>
                {procurementData.expected_delivery_date && (
                  <div>
                    <p className="text-gray-500">Expected Delivery</p>
                    <p className="font-medium">{new Date(procurementData.expected_delivery_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-3">Items ({procurementItems.length})</h3>
                <div className="space-y-2">
                  {procurementItems.map((item) => (
                    <div key={item.variant_id} className="flex justify-between text-sm py-2 border-b">
                      <div>
                        <p className="font-medium">{item.product_name} - {item.variant_name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity_ordered} × ₱{item.unit_cost.toLocaleString()}</p>
                      </div>
                      <p className="font-semibold">₱{(item.unit_cost * item.quantity_ordered).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₱{subtotal.toLocaleString()}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>₱{taxAmount.toLocaleString()}</span>
                  </div>
                )}
                {shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>₱{shippingCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total Cost:</span>
                  <span>₱{totalCost.toLocaleString()}</span>
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
                onClick={handleCreateProcurement}
                className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Procurement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Component: Variant Selector
function VariantSelector({ variants, products, onSelectVariant }) {
  const [search, setSearch] = useState('');

  const filteredVariants = variants.filter(v =>
    v.sku?.toLowerCase().includes(search.toLowerCase()) ||
    v.variant_name?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10);

  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search products by SKU or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
        />
      </div>

      {search && filteredVariants.length > 0 && (
        <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
          {filteredVariants.map((variant) => {
            const product = products.find(p => p.product_id === variant.product_id);
            return (
              <button
                key={variant.variant_id}
                onClick={() => onSelectVariant(variant)}
                className="w-full p-3 hover:bg-gray-50 text-left flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{product?.product_name}</p>
                  <p className="text-sm text-gray-500">{variant.variant_name} • {variant.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Cost: ₱{parseFloat(variant.unit_cost || variant.unit_price).toLocaleString()}</p>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <Plus size={12} className="mr-1" />
                    Add
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}