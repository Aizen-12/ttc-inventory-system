// ==================================
// FILE: src/components/dashboard/RecentOrdersWidget.jsx
// ==================================
import React from 'react';
import { Clock, ChevronRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecentOrdersWidget({ orders, onRefresh }) {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'Processing': 'bg-indigo-100 text-indigo-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Returned': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Paid': 'text-green-600',
      'Pending': 'text-yellow-600',
      'Failed': 'text-red-600',
      'Refunded': 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="text-gray-400" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className="text-gray-600" />
            </button>
            <button
              onClick={() => navigate('/inventory/orders')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              View All
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {orders && orders.length > 0 ? (
          orders.slice(0, 5).map((order) => (
            <div
              key={order.order_id}
              onClick={() => navigate(`/inventory/orders/${order.order_id}`)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-gray-900">{order.order_number}</p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{order.customer?.customer_name || 'Guest'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₱{parseFloat(order.total_amount).toLocaleString()}</p>
                  <p className={`text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                    {order.payment_status}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(order.order_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
                <span>{order.delivery_method}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Clock className="mx-auto mb-2 text-gray-300" size={32} />
            <p>No recent orders</p>
          </div>
        )}
      </div>
    </div>
  );
}