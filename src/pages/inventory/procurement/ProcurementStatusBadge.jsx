// ==================================
// FILE: src/pages/inventory/procurement/ProcurementStatusBadge.jsx
// ==================================
import React from 'react';

export default function ProcurementStatusBadge({ status }) {
  const getStatusStyle = () => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Approved':
        return 'bg-blue-100 text-blue-700';
      case 'Ordered':
        return 'bg-indigo-100 text-indigo-700';
      case 'Partial':
        return 'bg-orange-100 text-orange-700';
      case 'Received':
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