
import React from 'react';
import { Button } from '@/components/ui/button';

interface TravelLogisticsStepProps {
  travel: {
    portOfEntry?: string;
    airportPickup: boolean;
    pickupTime?: string;
    pickupLocation?: string;
  };
  onChange: (travel: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const TravelLogisticsStep: React.FC<TravelLogisticsStepProps> = ({ 
  travel, 
  onChange,
  onNext,
  onBack 
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
            value={travel.portOfEntry || ''}
            onChange={(e) => onChange({
              ...travel,
              portOfEntry: e.target.value
            })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="airportPickup"
            checked={travel.airportPickup}
            onChange={(e) => onChange({
              ...travel,
              airportPickup: e.target.checked
            })}
          />
          <label htmlFor="airportPickup" className="text-sm font-medium">
            Airport Pickup Required
          </label>
        </div>
        {travel.airportPickup && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pickup Time</label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-md"
                value={travel.pickupTime || ''}
                onChange={(e) => onChange({
                  ...travel,
                  pickupTime: e.target.value
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pickup Location</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Terminal 1A, Gate 5"
                value={travel.pickupLocation || ''}
                onChange={(e) => onChange({
                  ...travel,
                  pickupLocation: e.target.value
                })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        
        <Button
          onClick={onNext}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
