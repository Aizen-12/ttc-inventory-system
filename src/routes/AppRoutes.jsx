// ==================================
// FILE: src/routes/AppRoutes.jsx (FIXED)
// ==================================
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from '../components/layout/Layout';

// Components
import ProtectedRoute from '../components/common/ProtectedRoute';

// Pages
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import BrandsPage from '../pages/inventory/brands/BrandsPage';
import CategoriesPage from '../pages/inventory/categories/CategoriesPage';
import ProductsPage from '../pages/inventory/products/ProductsPage';
import InventoryPage from '../pages/inventory/stock/InventoryPage';
import OrdersPage from '../pages/inventory/orders/OrdersPage';
import CreateOrderPage from '../pages/inventory/orders/CreateOrderPage';
import OrderDetailsPage from '../pages/inventory/orders/OrderDetailsPage';
import TransactionsPage from '../pages/inventory/transactions/TransactionsPage';
import VendorsPage from '../pages/inventory/vendors/VendorsPage';
import CustomersPage from '../pages/inventory/customers/CustomersPage';
import CustomerDetailsPage from '../pages/inventory/customers/CustomerDetailsPage';
import StockMovementsPage from '../pages/inventory/stock/StockMovementsPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import NotFound from '../pages/NotFound';
import ReportsPage from '../pages/reports/ReportPage';
import InventoryReportsPage from '../pages/reports/InventoryReportsPage';
import BatchesPage from '../pages/inventory/batches/BatchesPage';
import SettingsPage from '../pages/settings/SettingsPage';
import AuditLogsPage from '../pages/audit/AuditLogsPage';
import UserProfilePage from '../pages/profile/UserProfilePage';
// Procurement Pages
import ProcurementsPage from '../pages/inventory/procurement/ProcurementsPage';
import CreateProcurementPage from '../pages/inventory/procurement/CreateProcurementPage';
import ProcurementDetailsPage from '../pages/inventory/procurement/ProcurementDetailsPage';

// Warehouse Pages
import WarehousesPage from '../pages/inventory/warehouses/WarehousesPage';

import UsersPage from '../pages/users/UsersPage';
import PermissionsPage from '../pages/users/PermissionsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Root redirect to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Inventory Module - Protected */}
      <Route
        path="/inventory/brands"
        element={
          <ProtectedRoute>
            <Layout>
              <BrandsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/categories"
        element={
          <ProtectedRoute>
            <Layout>
              <CategoriesPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/products"
        element={
          <ProtectedRoute>
            <Layout>
              <ProductsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/stock"
        element={
          <ProtectedRoute>
            <Layout>
              <InventoryPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Sales/Orders Module - Protected */}
      {/* Create Order - Must come BEFORE /inventory/orders/:id */}
      <Route
        path="/inventory/orders/create"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateOrderPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Order Details - Must come BEFORE /inventory/orders */}
      <Route
        path="/inventory/orders/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <OrderDetailsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Orders List - Must come LAST */}
      <Route
        path="/inventory/orders"
        element={
          <ProtectedRoute>
            <Layout>
              <OrdersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Transactions Module - Protected */}
      <Route
        path="/inventory/transactions"
        element={
          <ProtectedRoute>
            <Layout>
              <TransactionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Procurement Module - Protected */}
      {/* Create Procurement - Must come BEFORE /inventory/procurement/:id */}
      <Route
        path="/inventory/procurement/create"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateProcurementPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Procurement Details - Must come BEFORE /inventory/procurement */}
      <Route
        path="/inventory/procurement/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ProcurementDetailsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Procurements List - Must come LAST */}
      <Route
        path="/inventory/procurement"
        element={
          <ProtectedRoute>
            <Layout>
              <ProcurementsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Warehouse Module - Protected */}
      <Route
        path="/inventory/warehouses"
        element={
          <ProtectedRoute>
            <Layout>
              <WarehousesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Vendor Management Module - Protected */}
      <Route
        path="/inventory/vendors"
        element={
          <ProtectedRoute>
            <Layout>
              <VendorsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Customer Management Module - Protected */}
      {/* Customer Details - Must come BEFORE /inventory/customers */}
      <Route
        path="/inventory/customers/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <CustomerDetailsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Customers List - Must come LAST */}
      <Route
        path="/inventory/customers"
        element={
          <ProtectedRoute>
            <Layout>
              <CustomersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route 
      path="/inventory/movements" 
      element={
      <ProtectedRoute>
        <Layout>
        <StockMovementsPage />
        </Layout>
        </ProtectedRoute>
      } />
        <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
        <Layout>
        <NotificationsPage />
        </Layout>
        </ProtectedRoute>
        
        } />

        <Route path="/reports/report" 
        element={
          <ProtectedRoute>
          <Layout>
        <ReportsPage />
        </Layout>
        </ProtectedRoute>
        } />
      <Route path="/reports/inventory" 
      element={
      <ProtectedRoute>
        <Layout>
      <InventoryReportsPage />
        </Layout>
      </ProtectedRoute>
      } />

      <Route path="/inventory/batches" 
      element={
      <ProtectedRoute>
        <Layout>
      <BatchesPage />
        </Layout>
      </ProtectedRoute>
      } />

      <Route path="/users" 
      element={
      <ProtectedRoute>
        <Layout>
      <UsersPage />
        </Layout>
      </ProtectedRoute>
      } />

      <Route path="/permissions" 
      element={
      <ProtectedRoute>
        <Layout>
      <PermissionsPage />
        </Layout>
      </ProtectedRoute>
      } /> 

      <Route path="/settings" 
      element={
      <ProtectedRoute>
        <Layout>
      <SettingsPage />
        </Layout>
      </ProtectedRoute>
      } /> 

      <Route path="/audit" 
      element={
      <ProtectedRoute>
        <Layout>
      <AuditLogsPage />
        </Layout>
      </ProtectedRoute>
      } /> 

      <Route path="/profile" 
      element={
      <ProtectedRoute>
        <Layout>
      <UserProfilePage />
        </Layout>
      </ProtectedRoute>
      } /> 

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}