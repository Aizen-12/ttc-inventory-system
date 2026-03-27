// ==================================
// FILE: src/services/api/settings.js
// ==================================
import { supabase } from '../supabase';

export const settingsAPI = {
  // Get all settings
  async getAll() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get setting by key
  async getByKey(key) {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', key)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  // Update or create setting
  async upsert(settingKey, settingValue, settingType = 'String', description = null) {
    // Check if exists
    const existing = await this.getByKey(settingKey);

    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('system_settings')
        .update({
          setting_value: settingValue,
          setting_type: settingType,
          description: description,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', settingKey)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('system_settings')
        .insert([{
          setting_key: settingKey,
          setting_value: settingValue,
          setting_type: settingType,
          description: description
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Bulk update settings
  async bulkUpdate(settings) {
    const promises = settings.map(s => 
      this.upsert(s.setting_key, s.setting_value, s.setting_type, s.description)
    );
    
    return await Promise.all(promises);
  },

  // Get settings grouped by category
  async getGrouped() {
    const allSettings = await this.getAll();
    
    const grouped = {
      general: [],
      inventory: [],
      orders: [],
      notifications: [],
      email: [],
      other: []
    };

    allSettings.forEach(setting => {
      const key = setting.setting_key;
      
      if (['currency', 'tax_rate', 'company_name', 'company_address', 'company_phone', 'company_email'].includes(key)) {
        grouped.general.push(setting);
      } else if (key.includes('stock') || key.includes('reorder') || key.includes('reservation')) {
        grouped.inventory.push(setting);
      } else if (key.includes('order') || key.includes('payment')) {
        grouped.orders.push(setting);
      } else if (key.includes('notification') || key.includes('alert')) {
        grouped.notifications.push(setting);
      } else if (key.includes('email') || key.includes('smtp')) {
        grouped.email.push(setting);
      } else {
        grouped.other.push(setting);
      }
    });

    return grouped;
  }
};