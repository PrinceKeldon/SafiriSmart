
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

      // Get ALL operators count (not just active ones)
      const { count: operatorsCount, error: operatorsError } = await supabase
        .from('operators')
        .select('*', { count: 'exact', head: true });

      if (operatorsError) {
        console.error('Error fetching operators count:', operatorsError);
      }

      console.log('Visits count:', visitsCount);
      console.log('Total operators count:', operatorsCount);

      return {
        safariGuideVisits: visitsCount || 0,
        tourMasterOperators: operatorsCount || 0
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
};
