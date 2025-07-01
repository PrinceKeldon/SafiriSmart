
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OperatorPackage, OperatorPackageCreate } from '@/types/operator';

export const useOperatorPackages = () => {
  return useQuery({
    queryKey: ['operator-packages'],
    queryFn: async () => {
      console.log('Fetching operator packages...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('operator_packages')
        .select('*')
        .eq('operator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching operator packages:', error);
        throw new Error(`Failed to fetch packages: ${error.message}`);
      }

      console.log('Fetched operator packages:', data);
      
      // Transform the data to match our interface
      const transformedData: OperatorPackage[] = (data || []).map(pkg => ({
        ...pkg,
        included_locations: Array.isArray(pkg.included_locations) 
          ? pkg.included_locations as string[]
          : [],
        included_activities: Array.isArray(pkg.included_activities)
          ? pkg.included_activities as string[]
          : [],
      }));

      return transformedData;
    },
  });
};

export const useCreateOperatorPackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packageData: OperatorPackageCreate) => {
      console.log('Creating operator package:', packageData);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('operator_packages')
        .insert({
          ...packageData,
          operator_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating operator package:', error);
        throw new Error(`Failed to create package: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-packages'] });
    },
  });
};

export const useUpdateOperatorPackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...packageData }: Partial<OperatorPackage> & { id: string }) => {
      console.log('Updating operator package:', { id, packageData });
      
      const { data, error } = await supabase
        .from('operator_packages')
        .update({
          ...packageData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating operator package:', error);
        throw new Error(`Failed to update package: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-packages'] });
    },
  });
};

export const useDeleteOperatorPackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packageId: string) => {
      console.log('Deleting operator package:', packageId);
      
      const { error } = await supabase
        .from('operator_packages')
        .delete()
        .eq('id', packageId);

      if (error) {
        console.error('Error deleting operator package:', error);
        throw new Error(`Failed to delete package: ${error.message}`);
      }

      return packageId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-packages'] });
    },
  });
};
