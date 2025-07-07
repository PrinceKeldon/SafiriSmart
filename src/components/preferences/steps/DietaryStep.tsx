
import React from 'react';

interface DietaryStepProps {
  dietary: {
    mealWishes?: string;
    allergies?: string;
    specialRequirements?: string;
  };
  onDietaryChange: (dietary: any) => void;
}

export const DietaryStep: React.FC<DietaryStepProps> = ({ 
  dietary, 
  onDietaryChange 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Dietary Requirements</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Meal Wishes & Preferences</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="e.g., Vegetarian, Halal, local cuisine preferences..."
            value={dietary.mealWishes || ''}
            onChange={(e) => onDietaryChange({
              ...dietary,
              mealWishes: e.target.value
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Food Allergies & Restrictions</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="e.g., Nut allergies, gluten intolerance, lactose intolerance..."
            value={dietary.allergies || ''}
            onChange={(e) => onDietaryChange({
              ...dietary,
              allergies: e.target.value
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Special Dietary Requirements</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md"
            rows={2}
            placeholder="Any other special dietary needs or medical requirements..."
            value={dietary.specialRequirements || ''}
            onChange={(e) => onDietaryChange({
              ...dietary,
              specialRequirements: e.target.value
            })}
          />
        </div>
      </div>
    </div>
  );
};
