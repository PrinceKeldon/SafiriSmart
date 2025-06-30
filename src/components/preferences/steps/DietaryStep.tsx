
import React from 'react';
import { TravelPreferences } from '../WizardTypes';

interface DietaryStepProps {
  preferences: TravelPreferences;
  updatePreferences: (updates: Partial<TravelPreferences>) => void;
}

export const DietaryStep: React.FC<DietaryStepProps> = ({ 
  preferences, 
  updatePreferences 
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
            value={preferences.dietary.mealWishes}
            onChange={(e) => updatePreferences({
              dietary: { ...preferences.dietary, mealWishes: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Food Allergies & Restrictions</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            placeholder="e.g., Nut allergies, gluten intolerance, lactose intolerance..."
            value={preferences.dietary.allergies}
            onChange={(e) => updatePreferences({
              dietary: { ...preferences.dietary, allergies: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Special Dietary Requirements</label>
          <textarea
            className="w-full px-3 py-2 border rounded-md"
            rows={2}
            placeholder="Any other special dietary needs or medical requirements..."
            value={preferences.dietary.specialRequirements}
            onChange={(e) => updatePreferences({
              dietary: { ...preferences.dietary, specialRequirements: e.target.value }
            })}
          />
        </div>
      </div>
    </div>
  );
};
