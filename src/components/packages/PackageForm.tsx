
import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OperatorPackage, OperatorPackageCreate } from '@/types/operator';
import { useCreateOperatorPackage, useUpdateOperatorPackage } from '@/hooks/useOperatorPackages';
import { toast } from 'sonner';

interface PackageFormProps {
  isOpen: boolean;
  onClose: () => void;
  package?: OperatorPackage | null;
}

interface FormData {
  package_name: string;
  description?: string;
  min_duration: number;
  max_duration: number;
  min_group_size: number;
  max_group_size: number;
  budget_tier: 'budget' | 'mid-range' | 'luxury';
  estimated_cost_per_person_per_day: number;
  included_locations: { value: string }[];
  included_activities: { value: string }[];
}

const POPULAR_LOCATIONS = [
  'Masai Mara', 'Serengeti', 'Amboseli', 'Tsavo East', 'Tsavo West',
  'Lake Nakuru', 'Samburu', 'Diani Beach', 'Watamu', 'Malindi',
  'Mount Kenya', 'Hell\'s Gate', 'Naivasha', 'Ngorongoro Crater'
];

const POPULAR_ACTIVITIES = [
  'Game Drives', 'Cultural Visits', 'Walking Safaris', 'Bird Watching',
  'Photography', 'Hot Air Balloon', 'Boat Rides', 'Hiking',
  'Beach Activities', 'Snorkeling', 'Deep Sea Fishing', 'City Tours'
];

export const PackageForm: React.FC<PackageFormProps> = ({ isOpen, onClose, package: editPackage }) => {
  const createPackage = useCreateOperatorPackage();
  const updatePackage = useUpdateOperatorPackage();
  const isEditing = !!editPackage;

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      package_name: '',
      description: '',
      min_duration: 1,
      max_duration: 7,
      min_group_size: 1,
      max_group_size: 10,
      budget_tier: 'mid-range',
      estimated_cost_per_person_per_day: 0,
      included_locations: [],
      included_activities: [],
    },
  });

  const { fields: locationFields, append: appendLocation, remove: removeLocation } = useFieldArray({
    control,
    name: 'included_locations',
  });

  const { fields: activityFields, append: appendActivity, remove: removeActivity } = useFieldArray({
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
      reset({
        package_name: '',
        description: '',
        min_duration: 1,
        max_duration: 7,
        min_group_size: 1,
        max_group_size: 10,
        budget_tier: 'mid-range',
        estimated_cost_per_person_per_day: 0,
        included_locations: [],
        included_activities: [],
      });
    }
  }, [editPackage, reset]);

  const onSubmit = async (data: FormData) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Package' : 'Create New Package'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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

            <div>
              <Label htmlFor="budget_tier">Budget Tier *</Label>
              <Select onValueChange={(value) => setValue('budget_tier', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="mid-range">Mid-range</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="estimated_cost_per_person_per_day">Cost per Person per Day (USD) *</Label>
              <Input
                id="estimated_cost_per_person_per_day"
                type="number"
                min="0"
                step="0.01"
                {...register('estimated_cost_per_person_per_day', { 
                  required: 'Cost is required',
                  min: { value: 0, message: 'Cost must be positive' }
                })}
              />
              {errors.estimated_cost_per_person_per_day && (
                <p className="text-sm text-red-600 mt-1">{errors.estimated_cost_per_person_per_day.message}</p>
              )}
            </div>
          </div>

          {/* Locations */}
          <div>
            <Label>Included Locations</Label>
            <div className="space-y-2">
              {locationFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`included_locations.${index}.value` as const)}
                    placeholder="Enter location"
                    list="popular-locations"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLocation(index)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendLocation({ value: '' })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>
            <datalist id="popular-locations">
              {POPULAR_LOCATIONS.map((location) => (
                <option key={location} value={location} />
              ))}
            </datalist>
          </div>

          {/* Activities */}
          <div>
            <Label>Included Activities</Label>
            <div className="space-y-2">
              {activityFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`included_activities.${index}.value` as const)}
                    placeholder="Enter activity"
                    list="popular-activities"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeActivity(index)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendActivity({ value: '' })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>
            <datalist id="popular-activities">
              {POPULAR_ACTIVITIES.map((activity) => (
                <option key={activity} value={activity} />
              ))}
            </datalist>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createPackage.isPending || updatePackage.isPending}
            >
              {isEditing ? 'Update Package' : 'Create Package'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
