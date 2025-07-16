
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  required?: boolean;
  placeholder?: string;
  description?: string;
  register: any;
  errors: any;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  required = false,
  placeholder,
  description,
  register,
  errors,
  className
}) => {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;
  
  const hasError = errors[name];
  
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </Label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-600">
          {description}
        </p>
      )}
      
      {type === 'textarea' ? (
        <Textarea
          id={fieldId}
          placeholder={placeholder}
          {...register(name)}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={`${description ? descriptionId : ''} ${hasError ? errorId : ''}`.trim()}
          className={cn(hasError && 'border-red-500 focus:border-red-500')}
        />
      ) : (
        <Input
          id={fieldId}
          type={type}
          placeholder={placeholder}
          {...register(name)}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={`${description ? descriptionId : ''} ${hasError ? errorId : ''}`.trim()}
          className={cn(hasError && 'border-red-500 focus:border-red-500')}
        />
      )}
      
      {hasError && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {hasError.message}
        </p>
      )}
    </div>
  );
};
