// ==================================
// FILE: src/hooks/useSettings.js
// ==================================
import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api/settings';

export function useSettings() {
  const [settings, setSettings] = useState([]);
  const [groupedSettings, setGroupedSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allSettings, grouped] = await Promise.all([
        settingsAPI.getAll(),
        settingsAPI.getGrouped()
      ]);
      setSettings(allSettings);
      setGroupedSettings(grouped);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (key, value, type = 'String', description = null) => {
    try {
      await settingsAPI.upsert(key, value, type, description);
      await fetchSettings();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const bulkUpdate = async (settingsArray) => {
    try {
      await settingsAPI.bulkUpdate(settingsArray);
      await fetchSettings();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getSetting = (key, defaultValue = null) => {
    const setting = settings.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  return {
    settings,
    groupedSettings,
    loading,
    error,
    updateSetting,
    bulkUpdate,
    getSetting,
    refetch: fetchSettings
  };
}