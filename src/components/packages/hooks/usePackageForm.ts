
import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { OperatorPackage, OperatorPackageCreate } from '@/types/operator';
import { useCreateOperatorPackage, useUpdateOperatorPackage } from '@/hooks/useOperatorPackages';
import { PackageFormData } from '../types/PackageFormTypes';
import { DEFAULT_FORM_VALUES } from '../constants/PackageFormConstants';

export const usePackageForm = (editPackage: OperatorPackage | null, onClose: () => void) => {
  const createPackage = useCreateOperatorPackage();
  const updatePackage = useUpdateOperatorPackage();
  const isEditing = !!editPackage;

  const form = useForm<PackageFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const { control, reset, handleSubmit } = form;

  const locationFieldArray = useFieldArray({
    control,
    name: 'included_locations',
  });

  const activityFieldArray = useFieldArray({
    control,
    name: 'included_activities',
  });

  useEffect(() => {
    if (editPackage) {
      reset({
        package_name: editPackage.package_name,
        description: editPackage.description || '',
        min_duration: editPackage.min_duration,
        max_duration: editPackage.max_duration,
        min_group_size: editPackage.min_group_size,
        max_group_size: editPackage.max_group_size,
        budget_tier: editPackage.budget_tier as 'budget' | 'mid-range' | 'luxury',
        estimated_cost_per_person_per_day: editPackage.estimated_cost_per_person_per_day,
        included_locations: editPackage.included_locations.map(loc => ({ value: loc })),
        included_activities: editPackage.included_activities.map(act => ({ value: act })),
      });
    } else {
      reset(DEFAULT_FORM_VALUES);
    }
  }, [editPackage, reset]);

  const onSubmit = async (data: PackageFormData) => {
    try {
      const packageData: OperatorPackageCreate = {
        ...data,
        included_locations: data.included_locations.map(loc => loc.value).filter(Boolean),
        included_activities: data.included_activities.map(act => act.value).filter(Boolean),
      };

      if (isEditing && editPackage) {
        await updatePackage.mutateAsync({ id: editPackage.id, data: packageData });
        toast.success('Package updated successfully');
      } else {
        await createPackage.mutateAsync(packageData);
        toast.success('Package created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update package' : 'Failed to create package');
    }
  };

  return {
    form,
    locationFieldArray,
    activityFieldArray,
    onSubmit: handleSubmit(onSubmit),
    isSubmitting: createPackage.isPending || updatePackage.isPending,
    isEditing,
  };
};
