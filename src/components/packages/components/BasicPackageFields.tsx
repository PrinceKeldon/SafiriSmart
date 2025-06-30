
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PackageFormData } from '../types/PackageFormTypes';

interface BasicPackageFieldsProps {
  register: UseFormRegister<PackageFormData>;
  errors: FieldErrors<PackageFormData>;
}

export const BasicPackageFields: React.FC<BasicPackageFieldsProps> = ({ register, errors }) => {
  return (
    <>
      <div className="col-span-2">
        <Label htmlFor="package_name">Package Name *</Label>
        <Input
          id="package_name"
          {...register('package_name', { required: 'Package name is required' })}
          placeholder="e.g., Classic Safari Adventure"
        />
        {errors.package_name && (
          <p className="text-sm text-red-600 mt-1">{errors.package_name.message}</p>
        )}
      </div>

      <div className="col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Brief description of the package..."
          rows={3}
        />
      </div>
    </>
  );
};
