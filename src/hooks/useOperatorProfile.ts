
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OperatorProfile, OperatorProfileUpdate } from '@/types/operator';
import { apiService } from '@/services/ApiService';

export const useOperatorProfile = () => {
  return useQuery({
    queryKey: ['operator-profile'],
    queryFn: async (): Promise<OperatorProfile> => {
      const response = await apiService.getOperatorProfile();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch operator profile');
      }
      return response.data;
    },
  });
};

export const useUpdateOperatorProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: OperatorProfileUpdate): Promise<OperatorProfile> => {
      const response = await apiService.updateOperatorProfile(data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update operator profile');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-profile'] });
    },
  });
};
