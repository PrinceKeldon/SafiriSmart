
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OperatorPackage, OperatorPackageCreate } from '@/types/operator';
import { useAuth } from '@/contexts/AuthContext';

export const useOperatorPackages = () => {
  return useQuery({
    queryKey: ['operator-packages'],
    queryFn: async () => {
      console.log('Fetching operator packages...');
      
      const { data, error } = await supabase
        .from('operator_packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching operator packages:', error);
        throw new Error(`Failed to fetch packages: ${error.message}`);
      }

      console.log('Raw packages data:', data);
      
      // Transform the data to match our interface
      const transformedData: OperatorPackage[] = (data || []).map(pkg => {
        const transformed = {
          ...pkg,
          budget_tier: pkg.budget_tier as 'budget' | 'mid-range' | 'luxury',
          included_locations: Array.isArray(pkg.included_locations) 
            ? pkg.included_locations as string[]
            : [],
          included_activities: Array.isArray(pkg.included_activities)
            ? pkg.included_activities as string[]
            : [],
        };
        console.log('Transformed package:', transformed);
        return transformed;
      });

      console.log('Final transformed packages:', transformedData);
      return transformedData;
    },
  });
};

export const useCreateOperatorPackage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (packageData: OperatorPackageCreate) => {
      console.log('Creating operator package:', packageData);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { contact_person: _cp, ...rest } = packageData as any;
      const { data, error } = await supabase
        .from('operator_packages')
        .insert({
          ...rest,
          operator_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating operator package:', error);
        throw new Error(`Failed to create package: ${error.message}`);
      }

      console.log('Created package:', data);
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
      
      const { contact_person: _cp, ...rest } = packageData as any;
      const { data, error } = await supabase
        .from('operator_packages')
        .update({
          ...rest,
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
