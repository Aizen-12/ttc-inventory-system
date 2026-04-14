// ==================================
// FILE: src/pages/inventory/orders/OrdersPage.jsx
// ==================================
import React, { useState } from 'react';
import { ChevronLeft, ShoppingCart, Search, Plus, Eye, Filter } from 'lucide-react';
import { useOrders } from '../../../hooks/useOrders';
import { useNavigate } from 'react-router-dom';
import OrderStatusBadge from './OrderStatusBadge';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders, loading, error, updateOrderStatus, updatePaymentStatus } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.order_status === statusFilter;
    const matchesPayment = !paymentFilter || order.payment_status === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // TODO: Get current user ID from auth context
      const userId = null; // Replace with actual user ID
      await updateOrderStatus(orderId, newStatus, userId);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handlePaymentChange = async (orderId, newStatus, reference) => {
    try {
      await updatePaymentStatus(orderId, newStatus, reference);
    } catch (err) {
      alert('Error updating payment: ' + err.message);
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setPaymentFilter('');
    setSearchTerm('');
  };

  const activeFiltersCount = [statusFilter, paymentFilter].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading orders...</div>
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

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <ShoppingCart className="text-blue-600" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        </div>

    

        
      </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
  <p className="text-sm text-blue-800">
    <strong>Purpose:</strong> Manage customer orders from creation to delivery. Track order status 
    (Pending → Confirmed → Processing → Shipped → Delivered), monitor payment status, and view order history. 
    The system automatically reserves and deducts inventory as orders progress.
  </p>
</div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payments</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by order number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
          onClick={() => navigate('/inventory/orders/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          
          <span>Add Order</span>
        </button>
        </div>
        
        {activeFiltersCount > 0 && (
          <div className="mt-3 flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">{activeFiltersCount} filters active</span>
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter || paymentFilter 
                      ? 'No orders match your filters' 
                      : 'No orders yet. Create your first order!'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.order_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                      <div className="text-xs text-gray-500">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {order.payment_method?.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₱{parseFloat(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.order_status} />
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.payment_status} type="payment" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/inventory/orders/${order.order_id}`)}
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center space-x-1"
                      >
                        <Eye size={16} />
                        <span className="text-sm">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          </div>
        </div>
      </div>
    </div>
  );
}