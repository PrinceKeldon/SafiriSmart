import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppSetting {
  key: string;
  value: boolean;
  description: string | null;
  updated_at: string;
}

export const useAppSettings = () => {
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Use type assertion since app_settings table may not be in generated types yet
      const { data, error } = await (supabase as any)
        .from('app_settings')
        .select('key, value');
      
      if (data && !error) {
        const settingsMap = (data as { key: string; value: boolean }[]).reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, boolean>);
        setSettings(settingsMap);
      } else if (error) {
        console.log('App settings table may not exist yet:', error.message);
      }
    } catch (err) {
      console.log('Error fetching app settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      // Use type assertion since app_settings table may not be in generated types yet
      const { error } = await (supabase as any)
        .from('app_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);
      
      if (!error) {
        setSettings(prev => ({ ...prev, [key]: value }));
        return { success: true };
      }
      return { success: false, error: error.message };
    } catch (err) {
      return { success: false, error: 'Failed to update setting' };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    isOnboardingEnabled: settings['operator_onboarding_enabled'] ?? true, // Default to true if not set
    updateSetting,
    refetch: fetchSettings
  };
};
