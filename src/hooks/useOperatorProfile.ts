
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useOperatorProfile = () => {
  return useQuery({
    queryKey: ['operator-profile'],
    queryFn: async () => {
      console.log('Fetching operator profile...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching operator profile:', error);
        throw new Error(`Failed to fetch profile: ${error.message}`);
      }

      console.log('Fetched operator profile:', data);
      return data;
    },
  });
};

export const useUpdateOperatorProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: any) => {
      console.log('Updating operator profile:', profileData);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('operators')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating operator profile:', error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-profile'] });
    },
  });
};
