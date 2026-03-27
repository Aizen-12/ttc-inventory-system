// ==================================
// FILE: src/pages/reports/ReportsPage.jsx
// ==================================
import React, { useState, useEffect } from 'react';
import { ChevronLeft, TrendingUp, Package, Users, DollarSign, ShoppingCart, Download, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReports } from '../../hooks/useReports';

export default function ReportsPage() {
  const navigate = useNavigate();
  const { generateReport, loading } = useReports();

  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const [stats, setStats] = useState(null);
  const [salesByProduct, setSalesByProduct] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      const [statsData, productsData, categoriesData, customersData, trendData] = await Promise.all([
        generateReport('orderStats', dateRange),
        generateReport('salesByProduct', dateRange),
        generateReport('salesByCategory', dateRange),
        generateReport('topCustomers', { limit: 5 }),
        generateReport('dailyTrend', dateRange)
      ]);

      setStats(statsData);
      setSalesByProduct(productsData.slice(0, 10));
      setSalesByCategory(categoriesData);
      setTopCustomers(customersData);
      setDailyTrend(trendData);
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0] || {});
    const rows = data.map(row => headers.map(h => row[h] || '').join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <div onClick={() => navigate('/Dashboard')} className="flex items-center mb-6 cursor-pointer">
        <ChevronLeft className="text-gray-400 mr-2" size={20} />
        <span className="text-sm text-gray-500">Back to Dashboard</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <TrendingUp className="text-purple-600" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center space-x-3">
          <Calendar size={18} className="text-gray-400" />
          <input
            type="date"
            value={dateRange.start_date}
            onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end_date}
            onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-purple-800">
          <strong>Purpose:</strong> View comprehensive sales, inventory, and customer analytics. Track performance 
          metrics, identify trends, and make data-driven decisions. Use date filters to analyze specific periods.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading reports...</div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <StatsCard
                icon={<ShoppingCart className="text-blue-600" size={24} />}
                title="Total Orders"
                value={stats.total_orders}
                subtitle={`${stats.completed_orders} completed`}
                color="blue"
              />
              <StatsCard
                icon={<DollarSign className="text-green-600" size={24} />}
                title="Total Revenue"
                value={`₱${stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                subtitle={`Avg: ₱${stats.average_order_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                color="green"
              />
              <StatsCard
                icon={<Package className="text-orange-600" size={24} />}
                title="Processing"
                value={stats.processing_orders}
                subtitle={`${stats.pending_orders} pending`}
                color="orange"
              />
              <StatsCard
                icon={<Users className="text-purple-600" size={24} />}
                title="Payment Status"
                value={stats.paid_orders}
                subtitle={`${stats.pending_payment} pending payment`}
                color="purple"
              />
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Daily Sales Trend */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Daily Sales Trend</h2>
                <button
                  onClick={() => exportToCSV(dailyTrend, 'daily-sales-trend')}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                >
                  <Download size={14} />
                  <span>Export</span>
                </button>
              </div>
              <SimpleTrendChart data={dailyTrend} />
            </div>

            {/* Sales by Category */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Sales by Category</h2>
                <button
                  onClick={() => exportToCSV(salesByCategory, 'sales-by-category')}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                >
                  <Download size={14} />
                  <span>Export</span>
                </button>
              </div>
              <div className="space-y-3">
                {salesByCategory.map((cat, idx) => (
                  <CategoryBar
                    key={idx}
                    name={cat.category_name}
                    revenue={cat.total_revenue}
                    quantity={cat.total_quantity}
                    max={salesByCategory[0]?.total_revenue || 1}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-white rounded-lg border mb-6">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Top Selling Products</h2>
              <button
                onClick={() => exportToCSV(salesByProduct, 'top-products')}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Units Sold</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {salesByProduct.map((product, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.product_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.brand || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category || '-'}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{product.total_quantity}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                        ₱{product.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Top Customers</h2>
              <button
                onClick={() => exportToCSV(topCustomers, 'top-customers')}
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center space-x-1"
              >
                <Download size={14} />
                <span>Export</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Orders</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Spent</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Loyalty Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topCustomers.map((customer, idx) => (
                    <tr key={customer.customer_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{customer.full_name}</div>
                        <div className="text-xs text-gray-500">{customer.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">{customer.total_orders}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                        ₱{parseFloat(customer.total_spent).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-purple-600">{customer.loyalty_points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon, title, value, subtitle, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    purple: 'bg-purple-50 border-purple-200'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 bg-white rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

// Simple Trend Chart Component
function SimpleTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data available</div>;
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="space-y-2">
      {data.slice(-7).map((day, idx) => {
        const percentage = (day.revenue / maxRevenue) * 100;
        return (
          <div key={idx} className="flex items-center space-x-3">
            <div className="text-xs text-gray-500 w-16">
              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-full h-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-full flex items-center justify-end px-2 transition-all"
                  style={{ width: `${percentage}%` }}
                >
                  {percentage > 20 && (
                    <span className="text-xs font-medium text-white">
                      ₱{day.revenue.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-600 w-12 text-right">{day.order_count}</div>
          </div>
        );
      })}
      <div className="flex justify-between text-xs text-gray-400 mt-2 pt-2 border-t">
        <span>Last 7 days</span>
        <span>Orders</span>
      </div>
    </div>
  );
}

// Category Bar Component
function CategoryBar({ name, revenue, quantity, max }) {
  const percentage = (revenue / max) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-900">{name}</span>
        <span className="text-sm font-semibold text-green-600">
          ₱{revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-400 to-green-600 h-full flex items-center justify-end px-2"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 15 && (
            <span className="text-xs font-medium text-white">{quantity} units</span>
          )}
        </div>
      </div>
    </div>
  );
}