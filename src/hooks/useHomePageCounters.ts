
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useHomePageCounters = () => {
  return useQuery({
    queryKey: ['homepage-counters'],
    queryFn: async () => {
      console.log('Fetching homepage counters...');
      
      // Get safari guide visits count
      const { count: visitsCount, error: visitsError } = await supabase
        .from('safari_guide_visits')
        .select('*', { count: 'exact', head: true });

      if (visitsError) {
        console.error('Error fetching visits count:', visitsError);
      }

      // Get ONLY ACTIVE operators count
      const { count: activeOperatorsCount, error: operatorsError } = await supabase
        .from('operators')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (operatorsError) {
        console.error('Error fetching active operators count:', operatorsError);
      }

      console.log('Visits count:', visitsCount);
      console.log('Active operators count:', activeOperatorsCount);

      return {
        safariGuideVisits: visitsCount || 0,
        tourMasterOperators: activeOperatorsCount || 0
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds for more frequent updates
    staleTime: 15000, // Consider data stale after 15 seconds
  });
};
