// ==================================
// FILE: src/pages/inventory/stock/AdjustmentForm.jsx (COMPLETE)
// ==================================
import React, { useState } from 'react';
import { X, Plus, Minus, Package, TrendingUp, TrendingDown, AlertCircle, AlertTriangle } from 'lucide-react';

export default function AdjustmentForm({ inventory, onSave, onCancel }) {
  const [adjustmentType, setAdjustmentType] = useState('add'); // add, subtract, set, condition_change
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [newCondition, setNewCondition] = useState(inventory.condition || 'Good');
  const [conditionChangeQty, setConditionChangeQty] = useState('');
  const [targetCondition, setTargetCondition] = useState('Damaged');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (adjustmentType === 'condition_change') {
      // Validate condition change
      if (!conditionChangeQty || conditionChangeQty === '0') {
        newErrors.conditionChangeQty = 'Quantity to change is required';
      }

      const changeQty = parseInt(conditionChangeQty);
      const currentQty = inventory.quantity_available || 0;

      if (changeQty < 0) {
        newErrors.conditionChangeQty = 'Quantity cannot be negative';
      }

      if (changeQty > currentQty) {
        newErrors.conditionChangeQty = `Cannot change more than available quantity (${currentQty})`;
      }

      if (newCondition === targetCondition) {
        newErrors.targetCondition = 'Target condition must be different from current condition';
      }
    } else {
      // Validate regular adjustment
      if (!quantity || quantity === '0') {
        newErrors.quantity = 'Quantity is required and must be greater than 0';
      }

      if (parseInt(quantity) < 0) {
        newErrors.quantity = 'Quantity cannot be negative';
      }

      if (adjustmentType === 'subtract') {
        const currentQty = inventory.quantity_available || 0;
        if (parseInt(quantity) > currentQty) {
          newErrors.quantity = `Cannot subtract more than available quantity (${currentQty})`;
        }
      }
    }

    if (!reason) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    if (adjustmentType === 'condition_change') {
      // Handle condition change (split inventory)
      const changeQty = parseInt(conditionChangeQty);
      const currentQty = inventory.quantity_available || 0;
      const remainingQty = currentQty - changeQty;

      onSave({
        adjustment_type: 'condition_change',
        quantity_to_change: changeQty,
        remaining_quantity: remainingQty,
        from_condition: newCondition,
        to_condition: targetCondition,
        adjustment_reason: reason,
        adjustment_notes: notes,
        inventory_id: inventory.inventory_id,
        variant_id: inventory.variant_id,
        warehouse_id: inventory.warehouse_id
      });
    } else {
      // Handle regular adjustment
      let newQuantity;
      const currentQty = inventory.quantity_available || 0;
      const adjustQty = parseInt(quantity);

      switch (adjustmentType) {
        case 'add':
          newQuantity = currentQty + adjustQty;
          break;
        case 'subtract':
          newQuantity = currentQty - adjustQty;
          break;
        case 'set':
          newQuantity = adjustQty;
          break;
        default:
          newQuantity = currentQty;
      }

      onSave({
        quantity_available: newQuantity,
        condition: newCondition,
        adjustment_reason: reason,
        adjustment_notes: notes,
        adjustment_type: adjustmentType,
        adjustment_quantity: adjustQty,
        previous_quantity: currentQty,
        previous_condition: inventory.condition || 'Good'
      });
    }
  };

  const getPreviewQuantity = () => {
    if (adjustmentType === 'condition_change') {
      const changeQty = parseInt(conditionChangeQty) || 0;
      const currentQty = inventory.quantity_available || 0;
      return currentQty - changeQty;
    }

    const currentQty = inventory.quantity_available || 0;
    const adjustQty = parseInt(quantity) || 0;

    switch (adjustmentType) {
      case 'add':
        return currentQty + adjustQty;
      case 'subtract':
        return currentQty - adjustQty;
      case 'set':
        return adjustQty;
      default:
        return currentQty;
    }
  };

  const getConditionBadge = (condition) => {
    const colors = {
      'Good': 'bg-green-100 text-green-700',
      'Damaged': 'bg-red-100 text-red-700',
      'Returned': 'bg-yellow-100 text-yellow-700',
      'Refurbished': 'bg-blue-100 text-blue-700',
      'Expired': 'bg-gray-100 text-gray-700'
    };
    return colors[condition] || 'bg-gray-100 text-gray-700';
  };

  const previewQty = getPreviewQuantity();
  const currentQty = inventory.quantity_available || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="text-green-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Adjust Inventory</h2>
              <p className="text-sm text-gray-500">{inventory.sku} - {inventory.variant_name}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Current Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-600">Product</p>
                <p className="text-sm font-medium text-gray-900">{inventory.product_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Warehouse</p>
                <p className="text-sm font-medium text-gray-900">{inventory.warehouse_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Current Quantity</p>
                <p className="text-sm font-bold text-gray-900">{currentQty.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Reserved</p>
                <p className="text-sm font-medium text-orange-600">
                  {(inventory.quantity_reserved || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Current Condition</p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionBadge(inventory.condition || 'Good')}`}>
                  {inventory.condition || 'Good'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-600">Stock Status</p>
                <p className="text-sm font-medium text-gray-900">{inventory.stock_status}</p>
              </div>
            </div>
          </div>

          {/* Adjustment Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Adjustment Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                  adjustmentType === 'add'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Plus className={adjustmentType === 'add' ? 'text-green-600' : 'text-gray-400'} size={24} />
                <span className={`text-sm font-medium ${adjustmentType === 'add' ? 'text-green-600' : 'text-gray-600'}`}>
                  Add Stock
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('subtract')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                  adjustmentType === 'subtract'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Minus className={adjustmentType === 'subtract' ? 'text-red-600' : 'text-gray-400'} size={24} />
                <span className={`text-sm font-medium ${adjustmentType === 'subtract' ? 'text-red-600' : 'text-gray-600'}`}>
                  Subtract Stock
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('set')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                  adjustmentType === 'set'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Package className={adjustmentType === 'set' ? 'text-blue-600' : 'text-gray-400'} size={24} />
                <span className={`text-sm font-medium ${adjustmentType === 'set' ? 'text-blue-600' : 'text-gray-600'}`}>
                  Set Exact Count
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('condition_change')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                  adjustmentType === 'condition_change'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <AlertTriangle className={adjustmentType === 'condition_change' ? 'text-orange-600' : 'text-gray-400'} size={24} />
                <span className={`text-sm font-medium ${adjustmentType === 'condition_change' ? 'text-orange-600' : 'text-gray-600'}`}>
                  Change Condition
                </span>
              </button>
            </div>
          </div>

          {/* Condition Change Section */}
          {adjustmentType === 'condition_change' ? (
            <div className="space-y-4 mb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="text-orange-600 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Move Items to Different Condition</p>
                    <p className="text-xs text-orange-700 mt-1">
                      This will move the specified quantity from "{inventory.condition || 'Good'}" condition to a different condition category.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity to Move <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={currentQty}
                  value={conditionChangeQty}
                  onChange={(e) => setConditionChangeQty(e.target.value)}
                  className={`w-full px-4 py-3 text-lg font-semibold border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none ${
                    errors.conditionChangeQty ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={`Enter quantity (max ${currentQty})`}
                />
                {errors.conditionChangeQty && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.conditionChangeQty}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Move To Condition <span className="text-red-500">*</span>
                </label>
                <select
                  value={targetCondition}
                  onChange={(e) => setTargetCondition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  {['Good', 'Damaged', 'Returned', 'Refurbished', 'Expired']
                    .filter(c => c !== (inventory.condition || 'Good'))
                    .map(cond => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))
                  }
                </select>
              </div>

              {/* Preview */}
              {conditionChangeQty && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Preview Change</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Current "{inventory.condition || 'Good'}":</span>
                      <span className="font-bold text-blue-900">{currentQty} units</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">After change "{inventory.condition || 'Good'}":</span>
                      <span className="font-bold text-blue-900">{currentQty - parseInt(conditionChangeQty)} units</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-blue-200 pt-2">
                      <span className="text-blue-700">New "{targetCondition}":</span>
                      <span className="font-bold text-orange-600">+{parseInt(conditionChangeQty)} units</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Regular Quantity Adjustment */
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`w-full px-4 py-3 text-lg font-semibold border rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={
                    adjustmentType === 'set' 
                      ? 'Enter exact quantity' 
                      : `Enter quantity to ${adjustmentType}`
                  }
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.quantity}
                  </p>
                )}
              </div>

              {/* Preview */}
              {quantity && !errors.quantity && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Preview Change</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-700">Current Quantity</p>
                      <p className="text-2xl font-bold text-blue-900">{currentQty.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center px-4">
                      {adjustmentType === 'add' ? (
                        <TrendingUp className="text-green-600" size={32} />
                      ) : adjustmentType === 'subtract' ? (
                        <TrendingDown className="text-red-600" size={32} />
                      ) : (
                        <Package className="text-blue-600" size={32} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-blue-700">New Quantity</p>
                      <p className={`text-2xl font-bold ${
                        previewQty > currentQty ? 'text-green-600' : 
                        previewQty < currentQty ? 'text-red-600' : 'text-blue-900'
                      }`}>
                        {previewQty.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Condition (only for non-condition-change adjustments) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Condition <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option value="Good">Good</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Returned">Returned</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Expired">Expired</option>
                </select>
                {newCondition !== (inventory.condition || 'Good') && (
                  <p className="mt-1 text-sm text-orange-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    Condition will be changed from "{inventory.condition || 'Good'}" to "{newCondition}"
                  </p>
                )}
              </div>
            </>
          )}

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Adjustment <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none ${
                errors.reason ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a reason...</option>
              <option value="Stock Receipt">Stock Receipt from Supplier</option>
              <option value="Stock Return">Stock Return from Customer</option>
              <option value="Physical Count">Physical Inventory Count</option>
              <option value="Damage">Damaged Items</option>
              <option value="Theft/Loss">Theft or Loss</option>
              <option value="Expiration">Expired Products</option>
              <option value="Transfer">Transfer Between Warehouses</option>
              <option value="Correction">Data Entry Correction</option>
              <option value="Quality Issue">Quality Control Issue</option>
              <option value="Condition Change">Condition Change (Good → Damaged, etc.)</option>
              <option value="Other">Other</option>
            </select>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.reason}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Enter any additional details about this adjustment..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}