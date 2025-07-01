
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OperatorProfile, OperatorProfileUpdate } from '@/types/operator';
import { operatorService } from '@/services/OperatorService';

export const useOperatorProfile = () => {
  return useQuery({
    queryKey: ['operator-profile'],
    queryFn: async (): Promise<OperatorProfile> => {
      const response = await operatorService.getOperatorProfile();
      if (!response.success) {
        throw new Error(response.errors?.[0] || 'Failed to fetch operator profile');
      }
      return response.data;
    },
  });
};

export const useUpdateOperatorProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: OperatorProfileUpdate): Promise<OperatorProfile> => {
      const response = await operatorService.updateOperatorProfile(data);
      if (!response.success) {
        throw new Error(response.errors?.[0] || 'Failed to update operator profile');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-profile'] });
    },
  });
};
