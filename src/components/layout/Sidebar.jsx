import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Receipt,
  Package,
  Tag,
  FolderTree,
  Truck,
  CircleUser,
  Users,
  Shield,
  Warehouse,
  BoxesIcon,
  History,
  BarChart2,
  Calendar,
  FileText,
  TrendingUp,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ sidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const isAdmin = user?.role === 'Admin';
  const isManagerOrAbove = ['Admin', 'Manager'].includes(user?.role);

  const NavItem = ({ path, icon: Icon, label, indent = false }) => (
    <button
      onClick={() => navigate(path)}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
        indent ? 'ml-5 w-[calc(100%-20px)]' : ''
      } ${
        isActive(path)
          ? 'bg-blue-50 text-blue-600 font-medium'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon size={indent ? 15 : 18} />
      <span className={indent ? 'text-sm' : ''}>{label}</span>
    </button>
  );

  const SectionLabel = ({ label }) => (
    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-1">
      {label}
    </p>
  );

  return (
    <aside
      className={`${
        sidebarOpen ? 'w-64' : 'w-0'
      } bg-white border-r transition-all duration-300 overflow-hidden flex-shrink-0`}
    >
      <div className="p-6 border-b">
        <h1 className="text-lg font-bold text-blue-600 leading-tight">
          TTC Homes Essentials
        </h1>
      </div>

      <nav className="px-3 py-4 overflow-y-auto h-[calc(100vh-85px)] space-y-0">

        {/* ── Dashboard ───────────────────────────────────────── */}
        <div className="mb-4">
          <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        </div>

        {/* ── Operations ──────────────────────────────────────── */}
        <div className="mb-4">
          <SectionLabel label="Operations" />
          <NavItem path="/inventory/orders"       icon={ShoppingCart} label="Orders" />
          <NavItem path="/inventory/procurement"  icon={ShoppingBag}  label="Procurement" />
          <NavItem path="/inventory/transactions" icon={Receipt}      label="Transactions" />
        </div>

        {/* ── Management ──────────────────────────────────────── */}
        <div className="mb-4">
          <SectionLabel label="Management" />
          <NavItem path="/inventory/products" icon={Package} label="Products" />
          <NavItem path="/inventory/brands"      icon={Tag}        label="Brands"     indent />
          <NavItem path="/inventory/categories"  icon={FolderTree} label="Categories" indent />
          <NavItem path="/inventory/vendors"    icon={Truck}       label="Suppliers" />
          <NavItem path="/inventory/customers"  icon={CircleUser}  label="Customers" />
          {isAdmin && (
            <NavItem path="/users"       icon={Users}  label="Users" />
          )}
          {isAdmin && (
            <NavItem path="/permissions" icon={Shield} label="Permissions" />
          )}
          <NavItem path="/inventory/warehouses" icon={Building2} label="Warehouses" />
        </div>

        {/* ── Inventory ───────────────────────────────────────── */}
        <div className="mb-4">
          <SectionLabel label="Inventory" />
          <NavItem path="/inventory/stock"     icon={BoxesIcon} label="Stock Levels" />
          <NavItem path="/inventory/movements" icon={History}   label="Stock Movements" />
        </div>

        {/* ── Reports ─────────────────────────────────────────── */}
        <div className="mb-4">
          <SectionLabel label="Reports" />
          <NavItem path="/reports/inventory" icon={BarChart2}  label="Inventory Reports" />
          <NavItem path="/inventory/batches" icon={Calendar}   label="Batches & Expiry" />
          {isManagerOrAbove && (
            <NavItem path="/audit" icon={FileText} label="Audit Log" />
          )}
          <NavItem path="/reports/report"    icon={TrendingUp} label="Sales Report" />
        </div>

      </nav>
    </aside>
  );
}