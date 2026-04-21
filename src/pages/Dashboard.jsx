// ==================================
// FILE: src/pages/Dashboard.jsx (UPDATED - SIMPLER)
// ==================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar,
  Truck,
  ShoppingBag,
  Box
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard'; // ← USE THE HOOK
import StatsCardModal from '../components/dashboard/StatsCardModal';
import RecentOrdersWidget from '../components/dashboard/RecentOrdersWidget';
import PendingOrdersWidget from '../components/dashboard/PendingOrdersWidget';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  
  // ✅ USE THE HOOK - THAT'S IT!
  const { loading, error, stats, recentOrders, pendingOrders, reload } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Quick Stats Row 1 - Sales & Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Sales"
          value={`₱${stats.todaySales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          subtitle={`${stats.completedToday} orders completed`}
          icon={<DollarSign className="text-green-600" size={24} />}
          color="green"
          trend={stats.salesGrowth > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(stats.salesGrowth).toFixed(1)}%`}
          onClick={() => setSelectedCard({
            type: 'sales',
            title: 'Sales Overview',
            data: {
              today: stats.todaySales,
              week: stats.weeklySales,
              month: stats.monthlySales,
              total: stats.totalRevenue,
              completedToday: stats.completedToday
            }
          })}
        />

        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders}
          subtitle="Awaiting confirmation"
          icon={<Clock className="text-yellow-600" size={24} />}
          color="yellow"
          alert={stats.pendingOrders > 5}
          onClick={() => setSelectedCard({
            type: 'pendingOrders',
            title: 'Pending Orders',
            data: pendingOrders
          })}
        />

        <StatsCard
          title="Processing Orders"
          value={stats.processingOrders}
          subtitle="In progress"
          icon={<Truck className="text-blue-600" size={24} />}
          color="blue"
          onClick={() => navigate('/inventory/orders')}
        />

        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers}
          subtitle={`${stats.newCustomers} new this month`}
          icon={<Users className="text-purple-600" size={24} />}
          color="purple"
          onClick={() => setSelectedCard({
            type: 'customers',
            title: 'Customer Overview',
            data: {
              total: stats.totalCustomers,
              newThisMonth: stats.newCustomers,
              topCustomer: stats.topCustomer
            }
          })}
        />
      </div>

      {/* Quick Stats Row 2 - Inventory & Procurement */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          subtitle="In inventory"
          icon={<Package className="text-indigo-600" size={24} />}
          color="indigo"
          onClick={() => navigate('/inventory/stock')}
        />

        <StatsCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          subtitle="Need reorder"
          icon={<AlertTriangle className="text-orange-600" size={24} />}
          color="orange"
          alert={stats.lowStockItems > 0}
          onClick={() => setSelectedCard({
            type: 'lowStock',
            title: 'Low Stock Alert',
            data: { count: stats.lowStockItems, outOfStock: stats.outOfStock }
          })}
        />

        <StatsCard
          title="Inventory Value"
          value={`₱${(stats.inventoryValue / 1000).toFixed(0)}K`}
          subtitle="Current stock worth"
          icon={<Box className="text-teal-600" size={24} />}
          color="teal"
          onClick={() => navigate('/reports/inventory')}
        />

        <StatsCard
          title="Pending Procurements"
          value={stats.pendingProcurements}
          subtitle={`${stats.receivedThisWeek} received this week`}
          icon={<ShoppingBag className="text-green-600" size={24} />}
          color="green"
          onClick={() => setSelectedCard({
            type: 'procurement',
            title: 'Procurement Status',
            data: {
              pending: stats.pendingProcurements,
              receivedWeek: stats.receivedThisWeek
            }
          })}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersWidget orders={recentOrders} onRefresh={reload} />
        <PendingOrdersWidget orders={pendingOrders} onRefresh={reload} />
      </div>

      {/* Modal */}
      {selectedCard && (
        <StatsCardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}

// Stats Card Component (same as before)
function StatsCard({ title, value, subtitle, icon, color, trend, trendValue, alert, onClick }) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 hover:bg-green-100',
    yellow: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    indigo: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
    orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
    teal: 'bg-teal-50 border-teal-200 hover:bg-teal-100',
    red: 'bg-red-50 border-red-200 hover:bg-red-100'
  };

  return (
    <div
      onClick={onClick}
      className={`relative ${colorClasses[color]} border rounded-xl p-6 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
    >
      {alert && (
        <div className="absolute top-3 right-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>

      <div className="absolute bottom-3 right-3">
        <Eye className="text-gray-400" size={16} />
      </div>
    </div>
  );
}