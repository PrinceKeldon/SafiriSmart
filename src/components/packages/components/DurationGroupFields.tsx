
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PackageFormData } from '../types/PackageFormTypes';

interface DurationGroupFieldsProps {
  register: UseFormRegister<PackageFormData>;
  errors: FieldErrors<PackageFormData>;
}

export const DurationGroupFields: React.FC<DurationGroupFieldsProps> = ({ register, errors }) => {
  return (
    <>
      <div>
        <Label htmlFor="min_duration">Min Duration (days) *</Label>
        <Input
          id="min_duration"
          type="number"
          min="1"
          {...register('min_duration', { 
            required: 'Min duration is required',
            min: { value: 1, message: 'Must be at least 1 day' }
          })}
        />
        {errors.min_duration && (
          <p className="text-sm text-red-600 mt-1">{errors.min_duration.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="max_duration">Max Duration (days) *</Label>
        <Input
          id="max_duration"
          type="number"
          min="1"
          {...register('max_duration', { 
            required: 'Max duration is required',
            min: { value: 1, message: 'Must be at least 1 day' }
          })}
        />
        {errors.max_duration && (
          <p className="text-sm text-red-600 mt-1">{errors.max_duration.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="min_group_size">Min Group Size *</Label>
        <Input
          id="min_group_size"
          type="number"
          min="1"
          {...register('min_group_size', { 
            required: 'Min group size is required',
            min: { value: 1, message: 'Must be at least 1 person' }
          })}
        />
        {errors.min_group_size && (
          <p className="text-sm text-red-600 mt-1">{errors.min_group_size.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="max_group_size">Max Group Size *</Label>
        <Input
          id="max_group_size"
          type="number"
          min="1"
          {...register('max_group_size', { 
            required: 'Max group size is required',
            min: { value: 1, message: 'Must be at least 1 person' }
          })}
        />
        {errors.max_group_size && (
          <p className="text-sm text-red-600 mt-1">{errors.max_group_size.message}</p>
        )}
      </div>
    </>
  );
};
