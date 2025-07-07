
import React from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PackageFormData } from '../types/PackageFormTypes';

interface BudgetPricingFieldsProps {
  register: UseFormRegister<PackageFormData>;
  errors: FieldErrors<PackageFormData>;
  setValue: UseFormSetValue<PackageFormData>;
}

export const BudgetPricingFields: React.FC<BudgetPricingFieldsProps> = ({ register, errors, setValue }) => {
  return (
    <>
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
            valueAsNumber: true,
            min: { value: 0.01, message: 'Cost must be positive' }
          })}
        />
        {errors.estimated_cost_per_person_per_day && (
          <p className="text-sm text-red-600 mt-1">{errors.estimated_cost_per_person_per_day.message}</p>
        )}
      </div>
    </>
  );
};
