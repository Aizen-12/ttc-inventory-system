// ==================================
// FILE: src/components/dashboard/StatsCardModal.jsx
// ==================================
import React from 'react';
import { X, TrendingUp, Users, Package, AlertTriangle, ShoppingBag, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StatsCardModal({ card, onClose }) {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">{card.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {card.type === 'sales' && <SalesModal data={card.data} onNavigate={handleNavigate} />}
          {card.type === 'pendingOrders' && <PendingOrdersModal data={card.data} onNavigate={handleNavigate} />}
          {card.type === 'customers' && <CustomersModal data={card.data} onNavigate={handleNavigate} />}
          {card.type === 'lowStock' && <LowStockModal data={card.data} onNavigate={handleNavigate} />}
          {card.type === 'procurement' && <ProcurementModal data={card.data} onNavigate={handleNavigate} />}
        </div>
      </div>
    </div>
  );
}

// Sales Modal Content
function SalesModal({ data, onNavigate }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 mb-1">Today's Sales</p>
          <p className="text-2xl font-bold text-green-900">₱{data.today.toLocaleString()}</p>
          <p className="text-xs text-green-600 mt-1">{data.completedToday} orders</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 mb-1">This Week</p>
          <p className="text-2xl font-bold text-blue-900">₱{data.week.toLocaleString()}</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-700 mb-1">This Month</p>
          <p className="text-2xl font-bold text-purple-900">₱{data.month.toLocaleString()}</p>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-700 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-indigo-900">₱{data.total.toLocaleString()}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t space-y-2">
        <button
          onClick={() => onNavigate('/inventory/orders?status=Delivered')}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          View All Completed Orders
        </button>
        <button
          onClick={() => onNavigate('/reports/report')}
          className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          View Detailed Sales Report
        </button>
      </div>
    </div>
  );
}

// Pending Orders Modal Content
function PendingOrdersModal({ data, onNavigate }) {
  return (
    <div className="space-y-4">
      {data && data.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.slice(0, 5).map((order) => (
              <div key={order.order_id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 cursor-pointer"
                onClick={() => onNavigate(`/orders/${order.order_id}`)}>
                <div>
                  <p className="font-semibold text-gray-900">{order.order_number}</p>
                  <p className="text-sm text-gray-600">{order.customer?.customer_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.order_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₱{parseFloat(order.total_amount).toLocaleString()}</p>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-200 text-yellow-800 rounded-full">
                    {order.order_status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={() => onNavigate('/inventory/orders?status=Pending,Confirmed')}
              className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
            >
              View All {data.length} Pending Orders
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No pending orders</p>
        </div>
      )}
    </div>
  );
}

// Customers Modal Content
function CustomersModal({ data, onNavigate }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="text-purple-600" size={20} />
            <p className="text-sm text-purple-700">Total Customers</p>
          </div>
          <p className="text-3xl font-bold text-purple-900">{data.total}</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="text-green-600" size={20} />
            <p className="text-sm text-green-700">New This Month</p>
          </div>
          <p className="text-3xl font-bold text-green-900">{data.newThisMonth}</p>
        </div>
      </div>

      {data.topCustomer && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-700 mb-2">🏆 Top Customer</p>
          <p className="font-bold text-lg text-indigo-900">{data.topCustomer.customer_name}</p>
          <p className="text-sm text-indigo-600">
            Total Spent: ₱{parseFloat(data.topCustomer.total_spent || 0).toLocaleString()}
          </p>
          <p className="text-xs text-indigo-500 mt-1">
            {data.topCustomer.total_orders || 0} orders placed
          </p>
        </div>
      )}

      <div className="pt-4 border-t space-y-2">
        <button
          onClick={() => onNavigate('/inventory/customers')}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
        >
          View All Customers
        </button>
        <button
          onClick={() => onNavigate('/inventory/customers?filter=new')}
          className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          View New Customers
        </button>
      </div>
    </div>
  );
}

// Low Stock Modal Content
function LowStockModal({ data, onNavigate }) {
  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
        <AlertTriangle className="mx-auto text-orange-600 mb-3" size={48} />
        <p className="text-lg font-bold text-orange-900 mb-2">
          {data.count} Items Need Attention
        </p>
        <p className="text-sm text-orange-700">
          {data.outOfStock} items are completely out of stock
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-sm font-medium text-red-900">Out of Stock</span>
          <span className="text-lg font-bold text-red-600">{data.outOfStock}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <span className="text-sm font-medium text-yellow-900">Low Stock</span>
          <span className="text-lg font-bold text-yellow-600">{data.count - data.outOfStock}</span>
        </div>
      </div>

      <div className="pt-4 border-t space-y-2">
        <button
          onClick={() => onNavigate('/inventory/stock?status=Out+of+Stock')}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          View Out of Stock Items
        </button>
        <button
          onClick={() => onNavigate('/inventory/stock?status=Low')}
          className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
        >
          View Low Stock Items
        </button>
        <button
          onClick={() => onNavigate('/inventory/procurement/create')}
          className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Create Procurement Order
        </button>
      </div>
    </div>
  );
}

// Procurement Modal Content
function ProcurementModal({ data, onNavigate }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ShoppingBag className="text-yellow-600" size={20} />
            <p className="text-sm text-yellow-700">Pending</p>
          </div>
          <p className="text-3xl font-bold text-yellow-900">{data.pending}</p>
          <p className="text-xs text-yellow-600 mt-1">Awaiting approval/order</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="text-green-600" size={20} />
            <p className="text-sm text-green-700">Received This Week</p>
          </div>
          <p className="text-3xl font-bold text-green-900">{data.receivedWeek}</p>
          <p className="text-xs text-green-600 mt-1">Stock updated</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-700 mb-2">📋 Quick Actions</p>
        <ul className="text-xs text-blue-900 space-y-1">
          <li>• Review pending procurement orders</li>
          <li>• Approve or reject pending requests</li>
          <li>• Create new procurement for low stock items</li>
          <li>• Mark received procurements</li>
        </ul>
      </div>

      <div className="pt-4 border-t space-y-2">
        <button
          onClick={() => onNavigate('/inventory/procurement?status=Pending,Approved')}
          className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
        >
          View Pending Procurements
        </button>
        <button
          onClick={() => onNavigate('/inventory/procurement')}
          className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          View All Procurements
        </button>
        <button
          onClick={() => onNavigate('/inventory/procurement/create')}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          Create New Procurement
        </button>
      </div>
    </div>
  );
}