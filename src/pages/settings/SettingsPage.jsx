// ==================================
// FILE: src/pages/settings/SettingsPage.jsx
// ==================================
import React, { useState } from 'react';
import { ChevronLeft, Settings as SettingsIcon, Save, Building, Package, ShoppingCart, Bell, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { showSuccess, showError, showLoading, closeLoading } from '../../utils/alerts';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { groupedSettings, loading, error, bulkUpdate } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    if (groupedSettings) {
      const initialData = {};
      Object.values(groupedSettings).flat().forEach(setting => {
        initialData[setting.setting_key] = setting.setting_value;
      });
      setFormData(initialData);
    }
  }, [groupedSettings]);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      showLoading('Saving settings...');
      
      const settingsArray = Object.entries(formData).map(([key, value]) => {
        const existing = Object.values(groupedSettings || {}).flat().find(s => s.setting_key === key);
        return {
          setting_key: key,
          setting_value: value,
          setting_type: existing?.setting_type || 'String',
          description: existing?.description
        };
      });

      await bulkUpdate(settingsArray);
      
      closeLoading();
      showSuccess('Settings saved successfully!');
      setHasChanges(false);
    } catch (err) {
      closeLoading();
      showError(err.message, 'Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
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

  // Empty state — system_settings table has no rows yet (fresh install)
  const hasSettings = groupedSettings && Object.values(groupedSettings).some(arr => arr.length > 0);
  if (!hasSettings) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-gray-400 mb-2">No settings found</div>
        <div className="text-sm text-gray-400">
          Run the settings seed SQL in your Supabase dashboard to populate default values.
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'General', icon: <Building size={18} /> },
    { id: 'inventory', name: 'Inventory', icon: <Package size={18} /> },
    { id: 'orders', name: 'Orders', icon: <ShoppingCart size={18} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={18} /> },
    { id: 'email', name: 'Email', icon: <Mail size={18} /> }
  ];

  return (
    <div>
      <div onClick={() => navigate('/dashboard')} className="flex items-center mb-6 cursor-pointer">
        <ChevronLeft className="text-gray-400 mr-2" size={20} />
        <span className="text-sm text-gray-500">Back to Dashboard</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
            <SettingsIcon className="text-gray-600" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        </div>

        {hasChanges && (
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save size={18} />
            <span>Save Changes</span>
          </button>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Purpose:</strong> Configure system-wide settings for your inventory management system. 
          Changes take effect immediately after saving. Be careful when modifying critical settings.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b">
          <nav className="flex space-x-4 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">General Settings</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <SettingInput
                  label="Company Name"
                  value={formData.company_name || ''}
                  onChange={(v) => handleChange('company_name', v)}
                  placeholder="TTC Homes Essentials"
                />
                
                <SettingInput
                  label="Currency"
                  value={formData.currency || 'PHP'}
                  onChange={(v) => handleChange('currency', v)}
                  placeholder="PHP"
                />
                
                <SettingInput
                  label="Tax Rate (%)"
                  type="number"
                  value={formData.tax_rate || '0.12'}
                  onChange={(v) => handleChange('tax_rate', v)}
                  placeholder="0.12"
                  helper="Default tax rate (e.g., 0.12 for 12%)"
                />
                
                <SettingInput
                  label="Company Phone"
                  value={formData.company_phone || ''}
                  onChange={(v) => handleChange('company_phone', v)}
                  placeholder="0917-123-4567"
                />
                
                <div className="col-span-2">
                  <SettingInput
                    label="Company Address"
                    value={formData.company_address || ''}
                    onChange={(v) => handleChange('company_address', v)}
                    placeholder="123 Main Street, Quezon City"
                  />
                </div>
                
                <div className="col-span-2">
                  <SettingInput
                    label="Company Email"
                    type="email"
                    value={formData.company_email || ''}
                    onChange={(v) => handleChange('company_email', v)}
                    placeholder="info@ttchomes.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Inventory Settings */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Inventory Settings</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <SettingInput
                  label="Low Stock Threshold"
                  type="number"
                  value={formData.low_stock_threshold || '10'}
                  onChange={(v) => handleChange('low_stock_threshold', v)}
                  placeholder="10"
                  helper="Default reorder level for new products"
                />
                
                <SettingInput
                  label="Reservation Expiry (hours)"
                  type="number"
                  value={formData.reservation_expiry_hours || '168'}
                  onChange={(v) => handleChange('reservation_expiry_hours', v)}
                  placeholder="168"
                  helper="Hours before inventory reservation expires (168 = 7 days)"
                />
                
                <SettingToggle
                  label="Low Stock Notifications"
                  value={formData.low_stock_notification === 'true'}
                  onChange={(v) => handleChange('low_stock_notification', v.toString())}
                  helper="Send alerts when stock falls below reorder level"
                />
                
                <SettingToggle
                  label="Auto-Expire Reservations"
                  value={formData.auto_expire_reservations === 'true'}
                  onChange={(v) => handleChange('auto_expire_reservations', v.toString())}
                  helper="Automatically release expired inventory reservations"
                />
                
                <SettingToggle
                  label="Track Batch Numbers"
                  value={formData.track_batch_numbers === 'true'}
                  onChange={(v) => handleChange('track_batch_numbers', v.toString())}
                  helper="Enable batch number tracking for all products"
                />
                
                <SettingToggle
                  label="Expiry Date Alerts"
                  value={formData.expiry_date_alerts === 'true'}
                  onChange={(v) => handleChange('expiry_date_alerts', v.toString())}
                  helper="Send notifications for products nearing expiry"
                />
              </div>
            </div>
          )}

          {/* Order Settings */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Order Settings</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <SettingToggle
                  label="Auto-Confirm Orders"
                  value={formData.auto_confirm_orders === 'true'}
                  onChange={(v) => handleChange('auto_confirm_orders', v.toString())}
                  helper="Automatically confirm new orders (skip manual verification)"
                />
                
                <SettingToggle
                  label="Allow Backorders"
                  value={formData.allow_backorders === 'true'}
                  onChange={(v) => handleChange('allow_backorders', v.toString())}
                  helper="Allow orders when stock is unavailable"
                />
                
                <SettingInput
                  label="Order Number Prefix"
                  value={formData.order_number_prefix || 'ORD'}
                  onChange={(v) => handleChange('order_number_prefix', v)}
                  placeholder="ORD"
                  helper="Prefix for order numbers (e.g., ORD-20250215-000001)"
                />
                
                <SettingInput
                  label="Default Payment Method"
                  value={formData.default_payment_method || 'cod'}
                  onChange={(v) => handleChange('default_payment_method', v)}
                  options={[
                    { value: 'cod', label: 'Cash on Delivery' },
                    { value: 'gcash', label: 'GCash' },
                    { value: 'bank_transfer', label: 'Bank Transfer' },
                    { value: 'credit_card', label: 'Credit Card' }
                  ]}
                />
                
                <SettingInput
                  label="Default Delivery Fee"
                  type="number"
                  value={formData.default_delivery_fee || '0'}
                  onChange={(v) => handleChange('default_delivery_fee', v)}
                  placeholder="0"
                  helper="Default delivery fee for orders"
                />
                
                <SettingToggle
                  label="Order Notifications"
                  value={formData.order_notifications === 'true'}
                  onChange={(v) => handleChange('order_notifications', v.toString())}
                  helper="Send notifications for new orders"
                />
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <SettingToggle
                  label="Enable Notifications"
                  value={formData.enable_notifications !== 'false'}
                  onChange={(v) => handleChange('enable_notifications', v.toString())}
                  helper="Master switch for all notifications"
                />
                
                <SettingToggle
                  label="Email Notifications"
                  value={formData.email_notifications === 'true'}
                  onChange={(v) => handleChange('email_notifications', v.toString())}
                  helper="Send notifications via email"
                />
                
                <SettingToggle
                  label="SMS Notifications"
                  value={formData.sms_notifications === 'true'}
                  onChange={(v) => handleChange('sms_notifications', v.toString())}
                  helper="Send notifications via SMS"
                />
                
                <SettingToggle
                  label="Low Stock Alerts"
                  value={formData.low_stock_notification === 'true'}
                  onChange={(v) => handleChange('low_stock_notification', v.toString())}
                  helper="Alert when products are low on stock"
                />
                
                <SettingToggle
                  label="Order Status Updates"
                  value={formData.order_status_notifications === 'true'}
                  onChange={(v) => handleChange('order_status_notifications', v.toString())}
                  helper="Notify when order status changes"
                />
                
                <SettingToggle
                  label="Procurement Alerts"
                  value={formData.procurement_notifications === 'true'}
                  onChange={(v) => handleChange('procurement_notifications', v.toString())}
                  helper="Notifications for procurement approvals"
                />
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Email Settings</h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Configure SMTP settings to enable email notifications. 
                  Contact your email provider for SMTP credentials.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <SettingInput
                  label="SMTP Host"
                  value={formData.smtp_host || ''}
                  onChange={(v) => handleChange('smtp_host', v)}
                  placeholder="smtp.gmail.com"
                />
                
                <SettingInput
                  label="SMTP Port"
                  type="number"
                  value={formData.smtp_port || '587'}
                  onChange={(v) => handleChange('smtp_port', v)}
                  placeholder="587"
                />
                
                <SettingInput
                  label="SMTP Username"
                  value={formData.smtp_username || ''}
                  onChange={(v) => handleChange('smtp_username', v)}
                  placeholder="your-email@gmail.com"
                />
                
                <SettingInput
                  label="SMTP Password"
                  type="password"
                  value={formData.smtp_password || ''}
                  onChange={(v) => handleChange('smtp_password', v)}
                  placeholder="••••••••"
                />
                
                <SettingInput
                  label="From Email"
                  value={formData.email_from || ''}
                  onChange={(v) => handleChange('email_from', v)}
                  placeholder="noreply@ttchomes.com"
                />
                
                <SettingInput
                  label="From Name"
                  value={formData.email_from_name || ''}
                  onChange={(v) => handleChange('email_from_name', v)}
                  placeholder="TTC Homes Essentials"
                />
                
                <SettingToggle
                  label="Use SSL/TLS"
                  value={formData.smtp_use_ssl === 'true'}
                  onChange={(v) => handleChange('smtp_use_ssl', v.toString())}
                  helper="Enable secure connection (recommended)"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {hasChanges && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            <strong>Unsaved Changes:</strong> You have unsaved changes. Click "Save Changes" to apply them.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper Components
function SettingInput({ label, value, onChange, type = 'text', placeholder, helper, options }) {
  if (options) {
    return (
      <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />
      {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  );
}

function SettingToggle({ label, value, onChange, helper }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">{label}</label>
        {helper && <p className="text-xs text-gray-500">{helper}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}