
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OperatorProfile, OperatorProfileUpdate } from '@/types/operator';

const API_BASE_URL = 'http://localhost:8001';

export const useOperatorProfile = () => {
  return useQuery({
    queryKey: ['operator-profile'],
    queryFn: async (): Promise<OperatorProfile> => {
      const response = await fetch(`${API_BASE_URL}/api/operator/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch operator profile');
      }
      
      return response.json();
    },
  });
};

export const useUpdateOperatorProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: OperatorProfileUpdate): Promise<OperatorProfile> => {
      const response = await fetch(`${API_BASE_URL}/api/operator/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update operator profile');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-profile'] });
    },
  });
};
