
import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PackageFormData } from '../types/PackageFormTypes';
import { DescriptionGenerator } from './DescriptionGenerator';

interface BasicPackageFieldsProps {
  register: UseFormRegister<PackageFormData>;
  errors: FieldErrors<PackageFormData>;
  watch: UseFormWatch<PackageFormData>;
  setValue: UseFormSetValue<PackageFormData>;
}

export const BasicPackageFields: React.FC<BasicPackageFieldsProps> = ({ 
  register, 
  errors, 
  watch, 
  setValue 
}) => {
  const packageName = watch('package_name');
  const description = watch('description');

  const handleDescriptionChange = (newDescription: string) => {
    setValue('description', newDescription);
  };

  return (
    <>
      <div className="col-span-2">
        <Label htmlFor="package_name">Package Name *</Label>
        <Input
          id="package_name"
          {...register('package_name', { required: 'Package name is required' })}
          placeholder="e.g., 7-Day Masai Mara Safari Experience"
        />
        {errors.package_name && (
          <p className="text-sm text-red-600 mt-1">{errors.package_name.message}</p>
        )}
      </div>

      <div className="col-span-2">
        <Label htmlFor="contact_person">Contact Person</Label>
        <Input
          id="contact_person"
          {...register('contact_person')}
          placeholder="e.g., John Doe - Safari Guide"
        />
        {errors.contact_person && (
          <p className="text-sm text-red-600 mt-1">{errors.contact_person.message}</p>
        )}
      </div>

      <div className="col-span-2">
        <DescriptionGenerator
          packageName={packageName}
          value={description}
          onChange={handleDescriptionChange}
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>
    </>
  );
};
