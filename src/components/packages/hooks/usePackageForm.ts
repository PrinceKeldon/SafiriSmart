
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateOperatorPackage, useUpdateOperatorPackage } from '@/hooks/useOperatorPackages';
import { OperatorPackage, OperatorPackageCreate } from '@/types/operator';
import { PackageFormData, PackageFormHookReturn } from '../types/PackageFormTypes';
import { packageSchema } from '../validation/packageSchema';
import { toast } from 'sonner';

export const usePackageForm = (editPackage?: OperatorPackage, onClose?: () => void): PackageFormHookReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPackage = useCreateOperatorPackage();
  const updatePackage = useUpdateOperatorPackage();

  const form = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      package_name: editPackage?.package_name || '',
      description: editPackage?.description || '',
      contact_person: editPackage?.contact_person || '',
      min_duration: editPackage?.min_duration || 1,
      max_duration: editPackage?.max_duration || 7,
      min_group_size: editPackage?.min_group_size || 1,
      max_group_size: editPackage?.max_group_size || 10,
      budget_tier: (editPackage?.budget_tier as 'budget' | 'mid-range' | 'luxury') || 'budget',
      estimated_cost_per_person_per_day: editPackage?.estimated_cost_per_person_per_day || 100,
      included_locations: editPackage?.included_locations?.map(loc => ({ value: loc })) || [{ value: '' }],
      included_activities: editPackage?.included_activities?.map(act => ({ value: act })) || [{ value: '' }],
    },
  });

  const locationFieldArray = useFieldArray({
    control: form.control,
    name: 'included_locations',
  });

  const activityFieldArray = useFieldArray({
    control: form.control,
    name: 'included_activities',
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    
    try {
      const packageData: OperatorPackageCreate = {
        package_name: data.package_name,
        description: data.description,
        contact_person: data.contact_person,
        min_duration: data.min_duration,
        max_duration: data.max_duration,
        min_group_size: data.min_group_size,
        max_group_size: data.max_group_size,
        budget_tier: data.budget_tier,
        estimated_cost_per_person_per_day: data.estimated_cost_per_person_per_day,
        included_locations: data.included_locations.map(loc => loc.value).filter(Boolean),
        included_activities: data.included_activities.map(act => act.value).filter(Boolean),
      };

      if (editPackage) {
        await updatePackage.mutateAsync({ id: editPackage.id, ...packageData });
        toast.success('Package updated successfully');
      } else {
        await createPackage.mutateAsync(packageData);
        toast.success('Package created successfully');
      }

      onClose?.();
    } catch (error) {
      toast.error(editPackage ? 'Failed to update package' : 'Failed to create package');
    } finally {
      setIsSubmitting(false);
    }
  });

  return {
    form,
    locationFieldArray,
    activityFieldArray,
    onSubmit,
    isSubmitting,
    isEditing: !!editPackage,
  };
};
