// ==================================
// FILE: src/pages/audit/LogDetailsModal.jsx
// ==================================
import React from 'react';
import { X, Calendar, User, Database, FileText } from 'lucide-react';

export default function LogDetailsModal({ log, onClose }) {
  const formatJSON = (data) => {
    if (!data) return null;
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const getChangedFields = () => {
    if (!log.old_values || !log.new_values) return [];
    
    const oldValues = log.old_values;
    const newValues = log.new_values;
    
    const changes = [];
    Object.keys(newValues).forEach(key => {
      if (oldValues[key] !== newValues[key]) {
        changes.push({
          field: key,
          old: oldValues[key],
          new: newValues[key]
        });
      }
    });
    
    return changes;
  };

  const changes = getChangedFields();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Audit Log Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Calendar className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium text-gray-900">
                  {new Date(log.created_at).toLocaleString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">User</p>
                <p className="font-medium text-gray-900">
                  {log.user?.full_name || 'System'}
                </p>
                {log.user && (
                  <p className="text-xs text-gray-500">{log.user.username} • {log.user.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Database className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">Table & Record</p>
                <p className="font-medium text-gray-900 font-mono">{log.table_name}</p>
                {log.record_id && (
                  <p className="text-xs text-gray-500">Record ID: {log.record_id}</p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileText className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">Action</p>
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                  log.action === 'INSERT' ? 'bg-green-100 text-green-700' :
                  log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                  log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {log.action}
                </span>
              </div>
            </div>
          </div>

          {/* IP Address & User Agent */}
          {(log.ip_address || log.user_agent) && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Connection Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {log.ip_address && (
                  <div>
                    <p className="text-sm text-gray-500">IP Address</p>
                    <p className="font-mono text-sm text-gray-900">{log.ip_address}</p>
                  </div>
                )}
                {log.user_agent && (
                  <div>
                    <p className="text-sm text-gray-500">User Agent</p>
                    <p className="text-xs text-gray-700 break-all">{log.user_agent}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Changed Fields (for UPDATE action) */}
          {log.action === 'UPDATE' && changes.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Changed Fields</h3>
              <div className="space-y-3">
                {changes.map((change, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">{change.field}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Old Value</p>
                        <p className="text-sm text-red-600 font-mono bg-red-50 p-2 rounded">
                          {change.old === null ? 'null' : String(change.old)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">New Value</p>
                        <p className="text-sm text-green-600 font-mono bg-green-50 p-2 rounded">
                          {change.new === null ? 'null' : String(change.new)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Data */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Raw Data</h3>
            
            {log.old_values && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Old Values</p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                  {formatJSON(log.old_values)}
                </pre>
              </div>
            )}
            
            {log.new_values && (
              <div>
                <p className="text-sm text-gray-500 mb-2">New Values</p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                  {formatJSON(log.new_values)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}