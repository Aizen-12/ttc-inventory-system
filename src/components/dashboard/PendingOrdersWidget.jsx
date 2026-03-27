// ==================================
// FILE: src/components/dashboard/PendingOrdersWidget.jsx
// ==================================
import React from 'react';
import { AlertCircle, ChevronRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PendingOrdersWidget({ orders, onRefresh }) {
  const navigate = useNavigate();

  const urgentOrders = orders.filter(order => {
    const orderDate = new Date(order.order_date);
    const hoursSinceOrder = (new Date() - orderDate) / (1000 * 60 * 60);
    return hoursSinceOrder > 24;
  });

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-yellow-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Pending Orders</h2>
            {urgentOrders.length > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
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
              onClick={() => navigate('/inventory/orders?status=Pending,Confirmed')}
              className="text-sm text-yellow-600 hover:text-yellow-800 font-medium flex items-center"
            >
              View All
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y max-h-96 overflow-y-auto">
        {orders && orders.length > 0 ? (
          orders.slice(0, 5).map((order) => {
            const orderDate = new Date(order.order_date);
            const hoursSinceOrder = (new Date() - orderDate) / (1000 * 60 * 60);
            const isUrgent = hoursSinceOrder > 24;

            return (
              <div
                key={order.order_id}
                onClick={() => navigate(`/orders/${order.order_id}`)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isUrgent ? 'bg-red-50 hover:bg-red-100' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900">{order.order_number}</p>
                      {isUrgent && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-200 text-red-800 rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{order.customer?.customer_name || 'Guest'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.floor(hoursSinceOrder)}h {Math.floor((hoursSinceOrder % 1) * 60)}m ago
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">₱{parseFloat(order.total_amount).toLocaleString()}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                      order.order_status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.order_status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/orders/${order.order_id}?action=confirm`);
                    }}
                    className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <CheckCircle size={14} className="mr-1" />
                    Confirm Order
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/orders/${order.order_id}`);
                    }}
                    className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle className="mx-auto mb-2 text-green-300" size={32} />
            <p>No pending orders</p>
            <p className="text-xs mt-1">All orders are being processed</p>
          </div>
        )}
      </div>

      {urgentOrders.length > 0 && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-800 font-medium">
            ⚠️ {urgentOrders.length} order{urgentOrders.length !== 1 ? 's' : ''} pending for over 24 hours
          </p>
        </div>
      )}
    </div>
  );
}