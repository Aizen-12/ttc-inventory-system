// ==================================
// FILE: src/pages/inventory/orders/OrderDetailsPage.jsx (ENHANCED)
// ==================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Package, User, CreditCard, Truck, Calendar, AlertTriangle } from 'lucide-react';
import { ordersAPI } from '../../../services/api/orders';
import OrderStatusBadge from './OrderStatusBadge';
import { showSuccess, showError, showConfirm, showLoading, closeLoading } from '../../../utils/alerts';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getById(id);
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    // Validation: Cannot cancel if shipped or delivered
    if (newStatus === 'Cancelled' && ['Shipped', 'Delivered'].includes(order.order_status)) {
      showError('Cannot cancel an order that has already been shipped or delivered.', 'Cancellation Not Allowed');
      return;
    }

    const result = await showConfirm(
      `Change order status to ${newStatus}?`,
      'Update Order Status'
    );
    
    if (!result.isConfirmed) return;
    
    try {
      showLoading('Updating status...');
      await ordersAPI.updateStatus(id, newStatus, null);
      await fetchOrder();
      closeLoading();
      showSuccess(`Order status updated to ${newStatus}!`);
    } catch (err) {
      closeLoading();
      showError(err.message, 'Failed to update status');
    }
  };

  const handleCancelOrder = async () => {
    // Check if order can be cancelled
    if (['Shipped', 'Delivered'].includes(order.order_status)) {
      showError('Cannot cancel an order that has already been shipped or delivered.', 'Cancellation Not Allowed');
      return;
    }

    const { value: reason } = await showConfirm(
      'Are you sure you want to cancel this order? This action cannot be undone.',
      'Cancel Order',
      true, // Show input for cancellation reason
      'Enter cancellation reason (optional)'
    );
    
    if (!reason && reason !== '') return; // User clicked cancel
    
    try {
      showLoading('Cancelling order...');
      await ordersAPI.cancelOrder(id, reason);
      await fetchOrder();
      closeLoading();
      
      if (order.payment_status === 'Paid') {
        showSuccess('Order cancelled successfully! Refund has been initiated.', 'Order Cancelled');
      } else {
        showSuccess('Order cancelled successfully!', 'Order Cancelled');
      }
    } catch (err) {
      closeLoading();
      showError(err.message, 'Failed to cancel order');
    }
  };

  const handleUpdatePayment = async (newStatus) => {
    const result = await showConfirm(
      `Change payment status to ${newStatus}?`,
      'Update Payment Status'
    );
    
    if (!result.isConfirmed) return;
    
    try {
      showLoading('Updating payment status...');
      await ordersAPI.updatePaymentStatus(id, newStatus);
      await fetchOrder();
      closeLoading();
      showSuccess(`Payment status updated to ${newStatus}!`);
    } catch (err) {
      closeLoading();
      showError(err.message, 'Failed to update payment');
    }
  };

  const handleMarkAsFailed = async () => {
    const { value: reason } = await showConfirm(
      'Mark this payment as failed?',
      'Payment Failed',
      true,
      'Enter failure reason (optional)'
    );
    
    if (!reason && reason !== '') return;
    
    try {
      showLoading('Marking payment as failed...');
      await ordersAPI.updatePaymentStatus(id, 'Failed', reason);
      await fetchOrder();
      closeLoading();
      showSuccess('Payment marked as failed', 'Payment Updated');
    } catch (err) {
      closeLoading();
      showError(err.message, 'Failed to update payment');
    }
  };

  // Check if order can be cancelled
  const canCancelOrder = order && !['Shipped', 'Delivered', 'Cancelled'].includes(order.order_status);

  // LOADING STATE
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading order details...</div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  // NULL CHECK
  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Order not found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/inventory/orders')} className="flex items-center text-gray-500 hover:text-gray-700">
          <ChevronLeft className="mr-2" size={20} />
          <span className="text-sm">Back to Orders</span>
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order {order.order_number}</h1>
          <p className="text-sm text-gray-500">
            Created {new Date(order.order_date || order.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <OrderStatusBadge status={order.order_status} />
          <OrderStatusBadge status={order.payment_status} type="payment" />
        </div>
      </div>

      {/* Warning if order cannot be cancelled */}
      {!canCancelOrder && order.order_status !== 'Cancelled' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertTriangle className="text-yellow-600 mr-3 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-yellow-800">Order Cannot Be Cancelled</p>
            <p className="text-xs text-yellow-700 mt-1">
              This order has already been shipped or delivered and cannot be cancelled.
            </p>
          </div>
        </div>
      )}

      {/* Refund Notice */}
      {order.payment_status === 'Refunded' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex items-start">
          <CreditCard className="text-purple-600 mr-3 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-purple-800">Refund Issued</p>
            <p className="text-xs text-purple-700 mt-1">
              A refund of ₱{parseFloat(order.total_amount).toLocaleString()} has been initiated for this cancelled order.
            </p>
          </div>
        </div>
      )}

      {/* Failed Payment Notice */}
      {order.payment_status === 'Failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertTriangle className="text-red-600 mr-3 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-red-800">Payment Failed</p>
            <p className="text-xs text-red-700 mt-1">
              The payment for this order has failed. Please contact the customer to retry payment.
            </p>
            {order.payment_reference && (
              <p className="text-xs text-red-600 mt-1">Reason: {order.payment_reference}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <Package className="mr-2" size={20} />
                Order Items
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.order_items?.map((item) => (
                  <div key={item.order_item_id} className="flex items-center justify-between pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-500">{item.variant_name}</p>
                      <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-semibold">₱{parseFloat(item.unit_price).toLocaleString()}</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ₱{parseFloat(item.subtotal).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₱{parseFloat(order.subtotal).toLocaleString()}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span className="text-red-600">-₱{parseFloat(order.discount_amount).toLocaleString()}</span>
                  </div>
                )}
                {order.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>₱{parseFloat(order.tax_amount).toLocaleString()}</span>
                  </div>
                )}
                {order.delivery_fee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee:</span>
                    <span>₱{parseFloat(order.delivery_fee).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>₱{parseFloat(order.total_amount).toLocaleString()}</span>
                </div>
                {order.payment_status === 'Refunded' && (
                  <div className="flex justify-between text-sm text-purple-600 font-medium">
                    <span>Refunded:</span>
                    <span>₱{parseFloat(order.total_amount).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2" size={20} />
              Order Timeline
            </h2>
            <div className="space-y-4">
              {order.created_at && (
                <TimelineItem
                  title="Order Created"
                  date={order.created_at}
                  completed
                />
              )}
              {order.verified_at && (
                <TimelineItem
                  title="Order Confirmed"
                  date={order.verified_at}
                  completed
                />
              )}
              {order.processed_at && (
                <TimelineItem
                  title="Order Processing"
                  date={order.processed_at}
                  completed
                />
              )}
              {order.shipped_at && (
                <TimelineItem
                  title="Order Shipped"
                  date={order.shipped_at}
                  completed
                />
              )}
              {order.delivered_at && (
                <TimelineItem
                  title="Order Delivered"
                  date={order.delivered_at}
                  completed
                />
              )}
              {order.cancelled_at && (
                <TimelineItem
                  title="Order Cancelled"
                  date={order.cancelled_at}
                  completed
                  cancelled
                  note={order.cancellation_reason}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Customer & Actions */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <User className="mr-2" size={20} />
              Customer
            </h2>
            <div className="space-y-2">
              <p className="font-medium">{order.customer?.full_name}</p>
              <p className="text-sm text-gray-600">{order.customer?.email}</p>
              {order.customer?.phone && (
                <p className="text-sm text-gray-600">{order.customer?.phone}</p>
              )}
              {order.customer_notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-1">Customer Notes:</p>
                  <p className="text-sm text-gray-700 italic">{order.customer_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCard className="mr-2" size={20} />
              Payment
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Method:</span>
                <span className="font-medium capitalize">{order.payment_method?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status:</span>
                <OrderStatusBadge status={order.payment_status} type="payment" />
              </div>
              {order.payment_reference && (
                <div className="flex justify-between text-sm">
                  <span>Reference:</span>
                  <span className="font-mono text-xs">{order.payment_reference}</span>
                </div>
              )}
              {order.payment_date && (
                <div className="flex justify-between text-sm">
                  <span>Paid On:</span>
                  <span>{new Date(order.payment_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Truck className="mr-2" size={20} />
              Delivery
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Method:</span>
                <span className="font-medium capitalize">{order.delivery_method}</span>
              </div>
              {order.tracking_number && (
                <div className="flex justify-between text-sm">
                  <span>Tracking:</span>
                  <span className="font-mono text-xs">{order.tracking_number}</span>
                </div>
              )}
              {order.courier && (
                <div className="flex justify-between text-sm">
                  <span>Courier:</span>
                  <span>{order.courier}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              {/* Order Status Actions */}
              {order.order_status === 'Pending' && (
                <button
                  onClick={() => handleUpdateStatus('Confirmed')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm Order
                </button>
              )}
              {order.order_status === 'Confirmed' && (
                <button
                  onClick={() => handleUpdateStatus('Processing')}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Start Processing
                </button>
              )}
              {order.order_status === 'Processing' && (
                <button
                  onClick={() => handleUpdateStatus('Shipped')}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Mark as Shipped
                </button>
              )}
              {order.order_status === 'Shipped' && (
                <button
                  onClick={() => handleUpdateStatus('Delivered')}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark as Delivered
                </button>
              )}
              
              {/* Payment Actions */}
              {order.payment_status === 'Pending' && order.order_status !== 'Cancelled' && (
                <>
                  <button
                    onClick={() => handleUpdatePayment('Paid')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark as Paid
                  </button>
                  <button
                    onClick={handleMarkAsFailed}
                    className="w-full px-4 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50"
                  >
                    Mark as Failed
                  </button>
                </>
              )}

              {/* Retry Failed Payment */}
              {order.payment_status === 'Failed' && order.order_status !== 'Cancelled' && (
                <button
                  onClick={() => handleUpdatePayment('Pending')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry Payment
                </button>
              )}

              {/* Cancel Order */}
              {canCancelOrder && (
                <button
                  onClick={handleCancelOrder}
                  className="w-full px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Cancel Order
                </button>
              )}

              {/* Cannot Cancel Notice */}
              {!canCancelOrder && order.order_status !== 'Cancelled' && (
                <div className="text-xs text-gray-500 text-center py-2 bg-gray-50 rounded">
                  Order cannot be cancelled after shipping
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ title, date, completed, cancelled, note }) {
  return (
    <div className="flex items-start space-x-3">
      <div className={`w-2 h-2 rounded-full mt-2 ${cancelled ? 'bg-red-500' : completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
      <div className="flex-1">
        <p className={`font-medium ${cancelled ? 'text-red-600' : ''}`}>{title}</p>
        <p className="text-sm text-gray-500">
          {new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        {note && (
          <p className="text-xs text-gray-600 mt-1 italic">Reason: {note}</p>
        )}
      </div>
    </div>
  );
}