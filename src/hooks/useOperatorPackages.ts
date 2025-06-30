
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OperatorPackage, OperatorPackageCreate, OperatorPackageUpdate } from '@/types/operator';

const API_BASE_URL = 'http://localhost:8001';

export const useOperatorPackages = () => {
  return useQuery({
    queryKey: ['operator-packages'],
    queryFn: async (): Promise<OperatorPackage[]> => {
      const response = await fetch(`${API_BASE_URL}/api/operator/packages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      
      return response.json();
    },
  });
};

export const useCreateOperatorPackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: OperatorPackageCreate): Promise<OperatorPackage> => {
      const response = await fetch(`${API_BASE_URL}/api/operator/packages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create package');
      }
      
      return response.json();
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
      const response = await fetch(`${API_BASE_URL}/api/operator/packages/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update package');
      }
      
      return response.json();
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
      const response = await fetch(`${API_BASE_URL}/api/operator/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete package');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-packages'] });
    },
  });
};
