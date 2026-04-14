// ==================================
// FILE: src/pages/notifications/NotificationsPage.jsx
// ==================================
import React, { useState } from 'react';
import { ChevronLeft, Bell, Filter, CheckCheck, Trash2, Package, ShoppingCart, AlertTriangle, Settings } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filterType, setFilterType] = useState('');
  const [filterRead, setFilterRead] = useState('');

  const filteredNotifications = notifications.filter(n => {
    if (filterType && n.notification_type !== filterType) return false;
    if (filterRead === 'unread' && n.is_read) return false;
    if (filterRead === 'read' && !n.is_read) return false;
    return true;
  });

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.notification_id);
    }

    if (notification.order_id) {
      navigate(`/inventory/orders/${notification.order_id}`);
    } else if (notification.variant_id) {
      navigate('/inventory/stock');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Order':
        return <ShoppingCart className="text-blue-600" size={20} />;
      case 'Stock':
        return <Package className="text-orange-600" size={20} />;
      case 'Procurement':
        return <Package className="text-green-600" size={20} />;
      case 'System':
        return <Settings className="text-gray-600" size={20} />;
      default:
        return <AlertTriangle className="text-yellow-600" size={20} />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      Urgent: 'bg-red-100 text-red-700',
      High: 'bg-orange-100 text-orange-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      Low: 'bg-gray-100 text-gray-700'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[priority] || colors.Low}`}>
        {priority}
      </span>
    );
  };

  return (
    <div>
      <div onClick={() => navigate('/dashboard')} className="flex items-center mb-6 cursor-pointer">
        <ChevronLeft className="text-gray-400 mr-2" size={20} />
        <span className="text-sm text-gray-500">Back to Dashboard</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Bell className="text-blue-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <CheckCheck size={18} />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">All Types</option>
            <option value="Order">Order</option>
            <option value="Stock">Stock</option>
            <option value="Procurement">Procurement</option>
            <option value="System">System</option>
          </select>
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
          {(filterType || filterRead) && (
            <button
              onClick={() => { setFilterType(''); setFilterRead(''); }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filterType || filterRead ? 'No notifications match your filters' : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.notification_id}
                className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-base ${!notification.is_read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(notification.priority)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.notification_id);
                          }}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{new Date(notification.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                        {notification.notification_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}