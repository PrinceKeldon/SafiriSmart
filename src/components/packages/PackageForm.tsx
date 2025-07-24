
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OperatorPackage } from '@/types/operator';
import { PackageFormProps } from './types/PackageFormTypes';
import { usePackageForm } from './hooks/usePackageForm';
import { BasicPackageFields } from './components/BasicPackageFields';
import { DurationGroupFields } from './components/DurationGroupFields';
import { BudgetPricingFields } from './components/BudgetPricingFields';
import { DynamicListField } from './components/DynamicListField';
import { POPULAR_LOCATIONS, POPULAR_ACTIVITIES } from './constants/PackageFormConstants';

export const PackageForm: React.FC<PackageFormProps> = ({ isOpen, onClose, package: editPackage }) => {
  const {
    form,
    locationFieldArray,
    activityFieldArray,
    onSubmit,
    isSubmitting,
    isEditing,
  } = usePackageForm(editPackage, onClose);

  const { register, formState: { errors }, setValue, watch } = form;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Package' : 'Create New Package'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <BasicPackageFields 
              register={register} 
              errors={errors} 
              watch={watch}
              setValue={setValue}
            />
            <DurationGroupFields register={register} errors={errors} />
            <BudgetPricingFields register={register} errors={errors} setValue={setValue} />
          </div>

          <DynamicListField
            label="Included Locations"
            fieldArray={locationFieldArray}
            register={register}
            fieldName="included_locations"
            placeholder="Enter location"
            datalistId="popular-locations"
            suggestions={POPULAR_LOCATIONS}
          />

          <DynamicListField
            label="Included Activities"
            fieldArray={activityFieldArray}
            register={register}
            fieldName="included_activities"
            placeholder="Enter activity"
            datalistId="popular-activities"
            suggestions={POPULAR_ACTIVITIES}
          />

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? 'Update Package' : 'Create Package'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
