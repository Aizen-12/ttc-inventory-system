// ==================================
// FILE: src/components/layout/Sidebar.jsx (UPDATED)
// ==================================
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  Tag,
  Calendar, 
  FolderTree, 
  Warehouse, 
  ShoppingCart, 
  Truck, 
  Receipt, 
  CircleUser,
  ShoppingBag,
  Building2,
  History,
  FileText,
  Users,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ sidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isAdmin = user?.role === 'Admin';
  const isManagerOrAbove = ['Admin', 'Manager'].includes(user?.role);

  return (
    <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white border-r transition-all duration-300 overflow-hidden`}>
      <div className="p-6">
        <h1 className="text-xl font-bold text-blue-600">TTC Homes Essentials</h1>
      </div>
      
      <nav className="px-3 overflow-y-auto h-[calc(100vh-100px)]">
        {/* DASHBOARD */}
        <div className="mb-6">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Dashboard
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
              isActive('/dashboard')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={18} />
            <span>Dashboard</span>
          </button>
        </div>

        {/* INVENTORY SECTION */}
        <div className="mb-6">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Inventory
          </p>
          
          {/* Stock/Inventory */}
          <button
            onClick={() => navigate('/inventory/stock')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 ${
              isActive('/inventory/stock')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Warehouse size={18} />
            <span>Stock Levels</span>
          </button>

          {/* Products (Parent) */}
          <button
            onClick={() => navigate('/inventory/products')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 ${
              isActive('/inventory/products')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package size={18} />
            <span>Products</span>
          </button>

          {/* Nested under Products */}
          <div className="ml-6 space-y-1 mb-1">
            <button
              onClick={() => navigate('/inventory/brands')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                isActive('/inventory/brands')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Tag size={16} />
              <span className="text-sm">Brands</span>
            </button>

            <button
              onClick={() => navigate('/inventory/categories')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                isActive('/inventory/categories')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FolderTree size={16} />
              <span className="text-sm">Categories</span>
            </button>
          </div>
              <button
            onClick={() => navigate('/inventory/movements')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 ${
              isActive('/inventory/movements')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <History size={18} />
            <span>Stock Movements</span>
          </button>
          {/* Warehouses */}
          <button
            onClick={() => navigate('/inventory/warehouses')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
              isActive('/inventory/warehouses')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Building2 size={18} />
            <span>Warehouses</span>
          </button>
          <button
  onClick={() => navigate('/inventory/batches')}
  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 ${
    isActive('/inventory/batches')
      ? 'bg-blue-50 text-blue-600'
      : 'text-gray-700 hover:bg-gray-100'
  }`}
>
  <Calendar size={18} />
  <span>Batches & Expiry</span>
</button>
        </div>

        {/* TRANSACTIONS SECTION */}
        <div className="mb-6">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Operations
          </p>
          
          {/* Orders */}
          <button
            onClick={() => navigate('/inventory/orders')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 ${
              isActive('/inventory/orders')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShoppingCart size={18} />
            <span>Orders</span>
          </button>

          {/* Procurement */}
          <button
            onClick={() => navigate('/inventory/procurement')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 ${
              isActive('/inventory/procurement')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag size={18} />
            <span>Procurement</span>
          </button>

          {/* Stock Movements/Transactions */}
          <button
            onClick={() => navigate('/inventory/transactions')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
              isActive('/inventory/transactions')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Receipt size={18} />
            <span>Transactions</span>
          </button>
        </div>

        {/* MANAGEMENT SECTION */}
        <div className="mb-6">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Management
          </p>

          {/* Users — Admin only */}
          {isAdmin && (
            <button
              onClick={() => navigate('/users')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 ${
                isActive('/users')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users size={18} />
              <span>Users</span>
            </button>
          )}

          {/* Permissions — Admin only */}
          {isAdmin && (
            <button
              onClick={() => navigate('/permissions')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 ${
                isActive('/permissions')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Shield size={18} />
              <span>Permissions</span>
            </button>
          )}
          

          {/* Customers */}
          <button
            onClick={() => navigate('/inventory/customers')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 ${
              isActive('/inventory/customers')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CircleUser size={18} />
            <span>Customers</span>
          </button>

          {/* Vendors */}
          <button
            onClick={() => navigate('/inventory/vendors')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
              isActive('/inventory/vendors')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Truck size={18} />
            <span>Vendors</span>
          </button>

          {/* Audit Logs — Manager and Admin only */}
          {isManagerOrAbove && (
            <button
              onClick={() => navigate('/audit')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
                isActive('/audit')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText size={18} />
              <span>Audit Logs</span>
            </button>
          )}
          </div>

        <div className="mb-6">
         <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
             Analytics
           </p>
           {/* Report */}
        <button
          onClick={() => navigate('/reports/report')}
        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 ${
          isActive('/reports/report')
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-700 hover:bg-gray-100'
          }`}
         >
        < TrendingUp size={18} />
        <span>Sales Reports</span>
        </button>
          {/* Inventory Report */}
        <button
         onClick={() => navigate('/reports/inventory')}
        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${
           isActive('/reports/inventory')
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-700 hover:bg-gray-100'
        }`}
          >
          <Package size={18} />
          <span>Inventory Reports</span>
          </button>
        </div>
          
        
      </nav>
    </aside>
  );
}