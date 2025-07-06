
import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: string;
  onDismiss: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss }) => {
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
      <p className="text-sm text-red-600">{error}</p>
      <Button 
        onClick={onDismiss} 
        variant="outline" 
        size="sm" 
        className="mt-2"
      >
        Dismiss
      </Button>
    </div>
  );
};
