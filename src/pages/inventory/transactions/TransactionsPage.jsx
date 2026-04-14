// ==================================
// FILE: src/pages/TransactionsPage.jsx
// ==================================
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Receipt, CreditCard, Calendar } from 'lucide-react';
import { supabase } from '../../../services/supabase';
import OrderStatusBadge from '../orders/OrderStatusBadge';
import { useNavigate } from 'react-router-dom';
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, paid, pending
  const navigate = useNavigate();
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all orders with payment info
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          order_id,
          order_number,
          order_date,
          total_amount,
          payment_method,
          payment_status,
          payment_date,
          payment_reference,
          customer:customers(full_name, email)
        `)
        .is('deleted_at', null)
        .order('order_date', { ascending: false });

      if (fetchError) throw fetchError;
      setTransactions(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'paid') return t.payment_status === 'Paid';
    if (filter === 'pending') return t.payment_status === 'Pending';
    return true;
  });

  // Calculate stats
  const totalRevenue = transactions
    .filter(t => t.payment_status === 'Paid')
    .reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0);
  
  const pendingPayments = transactions
    .filter(t => t.payment_status === 'Pending')
    .reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0);

  const paidCount = transactions.filter(t => t.payment_status === 'Paid').length;
  const pendingCount = transactions.filter(t => t.payment_status === 'Pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading transactions...</div>
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

      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
          <Receipt className="text-green-600" size={20} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
  <p className="text-sm text-green-800">
    <strong>Purpose:</strong> Track all payment transactions and revenue. Monitor which orders have been paid, 
    pending payments, and total revenue. View payment methods, references, and dates for complete financial tracking. 
    This helps with accounting and cash flow management.
  </p>
</div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">₱{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CreditCard className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">₱{pendingPayments.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Calendar className="text-yellow-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Paid Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{paidCount}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Receipt className="text-blue-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending Count</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Receipt className="text-orange-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg ${filter === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Paid ({paidCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Paid Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.order_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      {transaction.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(transaction.order_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.customer?.full_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.customer?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {transaction.payment_method?.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ₱{parseFloat(transaction.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusBadge status={transaction.payment_status} type="payment" />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">
                      {transaction.payment_reference || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {transaction.payment_date 
                        ? new Date(transaction.payment_date).toLocaleDateString()
                        : '-'
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredTransactions.length} of {transactions.length} transactions</span>
            <span className="font-semibold">
              Total: ₱{filteredTransactions.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}