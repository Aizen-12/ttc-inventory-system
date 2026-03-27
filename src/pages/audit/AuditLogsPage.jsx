// ==================================
// FILE: src/pages/audit/AuditLogsPage.jsx
// ==================================
import React, { useState, useEffect } from 'react';
import { ChevronLeft, FileText, Search, Filter, Download, Eye, Calendar, User, Database } from 'lucide-react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useUsers } from '../../hooks/useUsers';
import { useNavigate } from 'react-router-dom';
import { auditLogsAPI } from '../../services/api/audit';
import LogDetailsModal from './LogDetailsModal';

export default function AuditLogsPage() {
  const navigate = useNavigate();
  const { users } = useUsers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [stats, setStats] = useState(null);
  
  const [localFilters, setLocalFilters] = useState({
    user_id: '',
    table_name: '',
    action: '',
    start_date: '',
    end_date: ''
  });

  const { logs, loading, error, updateFilters, clearFilters: clearApiFilters } = useAuditLogs();

  useEffect(() => {
    loadStats();
  }, [logs]);

  const loadStats = async () => {
    try {
      const statsData = await auditLogsAPI.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleApplyFilters = () => {
    updateFilters(localFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({
      user_id: '',
      table_name: '',
      action: '',
      start_date: '',
      end_date: ''
    });
    clearApiFilters();
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      log.table_name?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.user?.username?.toLowerCase().includes(searchLower) ||
      log.user?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  const activeFiltersCount = Object.values(localFilters).filter(v => v).length;

  const getActionBadge = (action) => {
    const colors = {
      INSERT: 'bg-green-100 text-green-700',
      UPDATE: 'bg-blue-100 text-blue-700',
      DELETE: 'bg-red-100 text-red-700',
      ARCHIVE: 'bg-orange-100 text-orange-700',
      RESTORE: 'bg-purple-100 text-purple-700',
      LOGIN: 'bg-indigo-100 text-indigo-700',
      LOGOUT: 'bg-gray-100 text-gray-700'
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${colors[action] || 'bg-gray-100 text-gray-700'}`}>
        {action}
      </span>
    );
  };

  const exportToCSV = () => {
    const headers = ['Date/Time', 'User', 'Action', 'Table', 'Record ID', 'IP Address'];
    const rows = filteredLogs.map(log => [
      new Date(log.created_at).toLocaleString(),
      log.user?.full_name || 'System',
      log.action,
      log.table_name,
      log.record_id || '-',
      log.ip_address || '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const uniqueTables = [...new Set(logs.map(l => l.table_name))].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading audit logs...</div>
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
      <div onClick={() => navigate('/Dashboard')} className="flex items-center mb-6 cursor-pointer">
        <ChevronLeft className="text-gray-400 mr-2" size={20} />
        <span className="text-sm text-gray-500">Back to Dashboard</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
            <FileText className="text-slate-600" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center space-x-2"
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-slate-800">
          <strong>Purpose:</strong> View complete audit trail of all system activities. Track who made what changes, 
          when they occurred, and what values were modified. Critical for compliance and troubleshooting.
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Logs</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Inserts</p>
            <p className="text-2xl font-bold text-green-600">{stats.inserts}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Updates</p>
            <p className="text-2xl font-bold text-blue-600">{stats.updates}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Deletes</p>
            <p className="text-2xl font-bold text-red-600">{stats.deletes}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Active Users</p>
            <p className="text-2xl font-bold text-purple-600">{stats.unique_users}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Tables</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.tables_affected}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by table, action, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center space-x-2 ${
              activeFiltersCount > 0 ? 'bg-slate-50 border-slate-500 text-slate-600' : 'hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-slate-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">User</label>
                <select
                  value={localFilters.user_id}
                  onChange={(e) => setLocalFilters({ ...localFilters, user_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">All Users</option>
                  {users.map(u => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Table</label>
                <select
                  value={localFilters.table_name}
                  onChange={(e) => setLocalFilters({ ...localFilters, table_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">All Tables</option>
                  {uniqueTables.map(table => (
                    <option key={table} value={table}>
                      {table}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Action</label>
                <select
                  value={localFilters.action}
                  onChange={(e) => setLocalFilters({ ...localFilters, action: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">All Actions</option>
                  <option value="INSERT">INSERT</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="ARCHIVE">ARCHIVE</option>
                  <option value="RESTORE">RESTORE</option>
                  <option value="LOGIN">LOGIN</option>
                  <option value="LOGOUT">LOGOUT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={localFilters.start_date}
                  onChange={(e) => setLocalFilters({ ...localFilters, start_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={localFilters.end_date}
                  onChange={(e) => setLocalFilters({ ...localFilters, end_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <LogDetailsModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>Date & Time</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  <div className="flex items-center space-x-1">
                    <User size={14} />
                    <span>User</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  <div className="flex items-center space-x-1">
                    <Database size={14} />
                    <span>Table</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Record ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || activeFiltersCount > 0
                      ? 'No logs match your filters'
                      : 'No audit logs found'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{new Date(log.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(log.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.user.full_name}</div>
                          <div className="text-xs text-gray-500">{log.user.username}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      {log.table_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.record_id || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-slate-600 hover:text-slate-800 inline-flex items-center space-x-1"
                      >
                        <Eye size={16} />
                        <span className="text-sm">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredLogs.length} logs</span>
            <span className="text-xs">Displaying most recent 100 entries</span>
          </div>
        </div>
      </div>
    </div>
  );
}