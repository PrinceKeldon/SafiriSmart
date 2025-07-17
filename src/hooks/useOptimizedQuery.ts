
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enableRetries?: boolean;
  background?: boolean;
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  enableRetries = true,
  background = false,
  ...options
}: OptimizedQueryOptions<T>) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return useQuery({
    queryKey,
    queryFn,
    enabled: isOnline,
    retry: enableRetries ? 3 : false,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: background ? 5 * 60 * 1000 : 30 * 1000, // 5 min for background, 30s for foreground
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: !background,
    refetchOnReconnect: true,
    ...options,
  });
}
