
import React from 'react';
import { TravelPreferences } from '../WizardTypes';

interface TravelLogisticsStepProps {
  preferences: TravelPreferences;
  updatePreferences: (updates: Partial<TravelPreferences>) => void;
}

export const TravelLogisticsStep: React.FC<TravelLogisticsStepProps> = ({ 
  preferences, 
  updatePreferences 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Travel Logistics</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Port of Entry</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., Jomo Kenyatta International Airport (NBO)"
            value={preferences.travel.portOfEntry}
            onChange={(e) => updatePreferences({
              travel: { ...preferences.travel, portOfEntry: e.target.value }
            })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="airportPickup"
            checked={preferences.travel.airportPickup}
            onChange={(e) => updatePreferences({
              travel: { ...preferences.travel, airportPickup: e.target.checked }
            })}
          />
          <label htmlFor="airportPickup" className="text-sm font-medium">
            Airport Pickup Required
          </label>
        </div>
        {preferences.travel.airportPickup && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pickup Time</label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-md"
                value={preferences.travel.pickupTime}
                onChange={(e) => updatePreferences({
                  travel: { ...preferences.travel, pickupTime: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pickup Location</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Terminal 1A, Gate 5"
                value={preferences.travel.pickupLocation}
                onChange={(e) => updatePreferences({
                  travel: { ...preferences.travel, pickupLocation: e.target.value }
                })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
