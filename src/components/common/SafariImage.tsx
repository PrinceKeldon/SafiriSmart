
import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface SafariImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  overlay?: boolean;
  overlayClassName?: string;
}

export const SafariImage: React.FC<SafariImageProps> = ({
  src,
  alt,
  className = '',
  fallback = '/placeholder.svg',
  overlay = false,
  overlayClassName = ''
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
  }, []);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading placeholder with safari-themed gradient */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-secondary animate-pulse" />
      )}
      
      <img
        src={error ? fallback : src}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
      />
      
      {/* Optional overlay for text readability */}
      {overlay && loaded && (
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent',
          overlayClassName
        )} />
      )}
    </div>
  );
};
