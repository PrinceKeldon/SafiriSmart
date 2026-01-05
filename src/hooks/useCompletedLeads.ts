import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CompletedLead } from '@/types/lead';

export const useCompletedLeads = () => {
  return useQuery({
    queryKey: ['completed-leads'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('completed_leads')
        .select('*')
        .order('completed_at', { ascending: false });
      
      if (error) {
        // Table might not exist yet, return empty array
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('completed_leads table not yet created');
          return [];
        }
        throw error;
      }
      return (data || []) as CompletedLead[];
    }
  });
};
