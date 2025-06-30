
import React from 'react';
import { UseFieldArrayReturn, UseFormRegister } from 'react-hook-form';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PackageFormData } from '../types/PackageFormTypes';

interface DynamicListFieldProps {
  label: string;
  fieldArray: UseFieldArrayReturn<PackageFormData, 'included_locations' | 'included_activities', 'id'>;
  register: UseFormRegister<PackageFormData>;
  fieldName: 'included_locations' | 'included_activities';
  placeholder: string;
  datalistId: string;
  suggestions: string[];
}

export const DynamicListField: React.FC<DynamicListFieldProps> = ({
  label,
  fieldArray,
  register,
  fieldName,
  placeholder,
  datalistId,
  suggestions,
}) => {
  const { fields, append, remove } = fieldArray;

  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <Input
              {...register(`${fieldName}.${index}.value` as const)}
              placeholder={placeholder}
              list={datalistId}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => remove(index)}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ value: '' })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {label.split(' ')[1]}
        </Button>
      </div>
      <datalist id={datalistId}>
        {suggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
    </div>
  );
};
