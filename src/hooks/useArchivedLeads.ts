
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useArchivedLeads = () => {
  return useQuery({
    queryKey: ['archived-leads'],
    queryFn: async () => {
      console.log('Fetching archived leads from Supabase...');
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('archived', true)
        .not('assigned_operator_id', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching archived leads:', error);
        throw new Error(`Failed to fetch archived leads: ${error.message}`);
      }

      console.log('Fetched archived leads:', data);
      return data || [];
    },
  });
};
