
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OperatorPackage, OperatorPackageCreate, OperatorPackageUpdate } from '@/types/operator';
import { apiService } from '@/services/ApiService';

export const useOperatorPackages = () => {
  return useQuery({
    queryKey: ['operator-packages'],
    queryFn: async (): Promise<OperatorPackage[]> => {
      const response = await apiService.getOperatorPackages();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch packages');
      }
      return response.data;
    },
  });
};

export const useCreateOperatorPackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: OperatorPackageCreate): Promise<OperatorPackage> => {
      const response = await apiService.createOperatorPackage(data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create package');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-packages'] });
    },
  });
};

export const useUpdateOperatorPackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: OperatorPackageUpdate }): Promise<OperatorPackage> => {
      const response = await apiService.updateOperatorPackage(id, data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update package');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-packages'] });
    },
  });
};

export const useDeleteOperatorPackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiService.deleteOperatorPackage(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete package');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-packages'] });
    },
  });
};
