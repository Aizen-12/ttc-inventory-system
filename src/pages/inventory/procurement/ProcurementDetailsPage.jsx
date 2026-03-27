// ==================================
// FILE: src/pages/inventory/procurement/ProcurementDetailsPage.jsx (FIXED)
// No logic changes needed here — procurements.js handles the fix.
// Only change: any navigate('/Dashboard') -> navigate('/dashboard')
// (The page itself had no dashboard nav, kept as-is)
// ==================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, Truck, CheckCircle } from 'lucide-react';
import { procurementsAPI } from '../../../services/api/procurements';
import ProcurementStatusBadge from './ProcurementStatusBadge';
import { showSuccess, showError, showConfirm, showLoading, closeLoading } from '../../../utils/alerts';

export default function ProcurementDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [procurement, setProcurement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receivingMode, setReceivingMode] = useState(false);
  const [receivingNowQuantities, setReceivingNowQuantities] = useState({});

  useEffect(() => {
    fetchProcurement();
  }, [id]);

  const fetchProcurement = async () => {
    try {
      setLoading(true);
      const data = await procurementsAPI.getById(id);
      setProcurement(data);

      const initialQuantities = {};
      data.procurement_items?.forEach(item => {
        initialQuantities[item.procurement_item_id] = 0;
      });
      setReceivingNowQuantities(initialQuantities);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    const result = await showConfirm(
      `Change procurement status to ${newStatus}?`,
      'Update Status'
    );
    if (!result.isConfirmed) return;

    try {
      showLoading('Updating status...');
      await procurementsAPI.updateStatus(id, newStatus, null);
      await fetchProcurement();
      closeLoading();
      showSuccess(`Procurement status updated to ${newStatus}!`);
    } catch (err) {
      closeLoading();
      showError(err.message, 'Failed to update status');
    }
  };

  const handleReceiveItems = async () => {
    try {
      const hasQuantity = Object.values(receivingNowQuantities).some(qty => qty > 0);
      if (!hasQuantity) {
        showError('Please enter quantities to receive', 'No Items Selected');
        return;
      }

      showLoading('Receiving items...');

      const itemsToReceive = procurement.procurement_items
        .filter(item => (receivingNowQuantities[item.procurement_item_id] || 0) > 0)
        .map(item => {
          const receiveNow = receivingNowQuantities[item.procurement_item_id] || 0;
          const previouslyReceived = item.quantity_received || 0;
          return {
            procurement_item_id: item.procurement_item_id,
            variant_id: item.variant_id,
            quantity_received: previouslyReceived + receiveNow
          };
        });

      console.log('Sending to API:', itemsToReceive);

      await procurementsAPI.receiveItems(id, itemsToReceive);
      await fetchProcurement();

      setReceivingMode(false);
      closeLoading();
      showSuccess('Items received! Inventory updated successfully.', 'Success!');
    } catch (err) {
      console.error('Receive error:', err);
      closeLoading();
      showError(err.message, 'Failed to receive items');
    }
  };

  const updateReceivingNowQuantity = (itemId, quantity) => {
    const qty = parseInt(quantity) || 0;
    setReceivingNowQuantities({
      ...receivingNowQuantities,
      [itemId]: qty < 0 ? 0 : qty
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading procurement details...</div>
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

  if (!procurement) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Procurement not found</div>
      </div>
    );
  }

  const hasItemsToReceive = procurement.procurement_items?.some(
    item => (item.quantity_received || 0) < item.quantity_ordered
  );

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/inventory/procurement')}
          className="flex items-center text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="mr-2" size={20} />
          <span className="text-sm">Back to Procurements</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Procurement {procurement.procurement_number}
          </h1>
          <p className="text-sm text-gray-500">
            Created {new Date(procurement.procurement_date).toLocaleDateString()}
          </p>
        </div>
        <ProcurementStatusBadge status={procurement.status} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center">
                  <Package className="mr-2" size={20} />
                  Procurement Items
                </h2>

                {!receivingMode && ['Ordered', 'Partial'].includes(procurement.status) && (
                  hasItemsToReceive ? (
                    <button
                      onClick={() => setReceivingMode(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Receive Items
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                      <CheckCircle size={16} />
                      <span>All Items Received</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {procurement.procurement_items?.map((item) => {
                  const previouslyReceived = item.quantity_received || 0;
                  const receiveNow = receivingNowQuantities[item.procurement_item_id] || 0;
                  const totalWillBe = previouslyReceived + receiveNow;
                  const remaining = item.quantity_ordered - previouslyReceived;

                  return (
                    <div key={item.procurement_item_id} className="pb-4 border-b last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium">{item.variant?.product?.product_name}</p>
                          <p className="text-sm text-gray-500">{item.variant?.variant_name}</p>
                          <p className="text-xs text-gray-400">SKU: {item.variant?.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₱{parseFloat(item.unit_cost).toLocaleString()}</p>
                          <p className="text-sm text-gray-600">per unit</p>
                        </div>
                      </div>

                      {receivingMode && remaining > 0 ? (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="grid grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Ordered</p>
                              <p className="font-medium">{item.quantity_ordered}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Already Received</p>
                              <p className="font-medium">{previouslyReceived}</p>
                            </div>
                            <div>
                              <label className="block text-gray-500 mb-1">Receive Now</label>
                              <input
                                type="number"
                                min="0"
                                max={remaining}
                                value={receiveNow}
                                onChange={(e) => updateReceivingNowQuantity(item.procurement_item_id, e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <p className="text-gray-500">Total After</p>
                              <p className="font-medium text-green-600">{totalWillBe}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <div>
                              <span className="text-gray-500">Ordered: </span>
                              <span className="font-medium">{item.quantity_ordered}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Received: </span>
                              <span className="font-medium text-green-600">{previouslyReceived}</span>
                            </div>
                            {remaining > 0 && (
                              <div>
                                <span className="text-gray-500">Pending: </span>
                                <span className="font-medium text-orange-600">{remaining}</span>
                              </div>
                            )}
                          </div>
                          <p className="font-semibold">₱{parseFloat(item.subtotal).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {receivingMode && (
                <div className="mt-6 pt-6 border-t flex space-x-3">
                  <button
                    onClick={() => setReceivingMode(false)}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReceiveItems}
                    className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Confirm Receipt
                  </button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₱{parseFloat(procurement.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total Cost:</span>
                  <span>₱{parseFloat(procurement.total_cost || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Truck className="mr-2" size={20} />
              Vendor
            </h2>
            <div className="space-y-2">
              <p className="font-medium">{procurement.vendor?.vendor_name}</p>
              <p className="text-sm text-gray-600">{procurement.vendor?.vendor_code}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Warehouse</h2>
            <div className="space-y-2">
              <p className="font-medium">{procurement.warehouse?.warehouse_name}</p>
              <p className="text-sm text-gray-600">{procurement.warehouse?.warehouse_code}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              {procurement.status === 'Draft' && (
                <button
                  onClick={() => handleUpdateStatus('Pending')}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Submit for Approval
                </button>
              )}
              {procurement.status === 'Pending' && (
                <button
                  onClick={() => handleUpdateStatus('Approved')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Approve
                </button>
              )}
              {procurement.status === 'Approved' && (
                <button
                  onClick={() => handleUpdateStatus('Ordered')}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Mark as Ordered
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}