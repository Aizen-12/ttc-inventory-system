// ==================================
// FILE: src/pages/inventory/orders/OrderStatusBadge.jsx
// ==================================
import React from 'react';

export default function OrderStatusBadge({ status, type = 'order' }) {
  const getStatusStyle = () => {
    if (type === 'payment') {
      switch (status) {
        case 'Paid':
          return 'bg-green-100 text-green-700';
        case 'Pending':
          return 'bg-yellow-100 text-yellow-700';
        case 'Failed':
          return 'bg-red-100 text-red-700';
        case 'Refunded':
          return 'bg-purple-100 text-purple-700';
        case 'Partial':
          return 'bg-orange-100 text-orange-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    }

    // Order status
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'Processing':
        return 'bg-indigo-100 text-indigo-700';
      case 'Shipped':
        return 'bg-purple-100 text-purple-700';
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle()}`}>
      {status}
    </span>
  );
}