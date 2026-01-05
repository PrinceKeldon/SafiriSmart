import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Plus, X, Sparkles, Info } from 'lucide-react';
import { DestinationItem } from '../WizardTypes';
import { SafariImage } from '@/components/common/SafariImage';

// Destination image mapping
const destinationImages: Record<string, string> = {
  'Masai Mara': '/images/destinations/masai-mara.jpg',
  'Maasai Mara': '/images/destinations/masai-mara.jpg',
  'Amboseli': '/images/destinations/amboseli.jpg',
  'Tsavo': '/images/destinations/tsavo.jpg',
  'Tsavo East': '/images/destinations/tsavo.jpg',
  'Tsavo West': '/images/destinations/tsavo.jpg',
  'Diani Beach': '/images/destinations/diani-beach.jpg',
  'Diani': '/images/destinations/diani-beach.jpg',
  'Lake Nakuru': '/images/destinations/lake-nakuru.jpg',
  'Nakuru': '/images/destinations/lake-nakuru.jpg',
  'Samburu': '/images/destinations/samburu.jpg',
};

interface DestinationSelectionStepProps {
  aiSuggestedDestinations: DestinationItem[];
  selectedDestinations: DestinationItem[];
  customDestinations: string[];
  onChange: (destinations: DestinationItem[], customDestinations: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const DestinationSelectionStep: React.FC<DestinationSelectionStepProps> = ({
  aiSuggestedDestinations,
  selectedDestinations,
  customDestinations,
  onChange,
  onNext,
  onBack
}) => {
  const [customInput, setCustomInput] = useState('');

  const selectedCount = selectedDestinations.filter(d => d.selected).length + customDestinations.length;
  const totalCount = aiSuggestedDestinations.length;

  const toggleDestination = (destinationName: string) => {
    const updatedDestinations = selectedDestinations.map(dest => 
      dest.name === destinationName 
        ? { ...dest, selected: !dest.selected }
        : dest
    );
    onChange(updatedDestinations, customDestinations);
  };

  const addCustomDestination = () => {
    const trimmed = customInput.trim();
    if (trimmed && !customDestinations.includes(trimmed)) {
      const alreadyExists = selectedDestinations.some(
        d => d.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (!alreadyExists) {
        onChange(selectedDestinations, [...customDestinations, trimmed]);
        setCustomInput('');
      }
    }
  };

  const removeCustomDestination = (destination: string) => {
    onChange(selectedDestinations, customDestinations.filter(d => d !== destination));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomDestination();
    }
  };

  const canProceed = selectedCount > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI-Suggested Destinations
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Based on your interests, we've curated these destinations. Review and customize your selection.
        </p>
      </div>

      {/* Selection Summary */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {selectedCount} destination{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {selectedCount} of {totalCount + customDestinations.length}
        </Badge>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-lg p-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          All destinations are pre-selected. Uncheck any you'd like to skip, or add your own below.
          If you don't make any changes, your itinerary will use all AI suggestions.
        </p>
      </div>

      {/* AI Suggested Destinations */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Suggested Destinations
        </h3>
        <div className="grid gap-3">
          {selectedDestinations.map((destination) => {
            const imageUrl = destinationImages[destination.name] || '/images/destinations/default-safari.jpg';
            
            return (
              <Card 
                key={destination.name}
                className={`cursor-pointer transition-all duration-300 overflow-hidden group ${
                  destination.selected 
                    ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20' 
                    : 'border-border hover:border-muted-foreground/30 opacity-70 hover:opacity-100'
                }`}
                onClick={() => toggleDestination(destination.name)}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Destination Image */}
                    <div className="relative w-24 sm:w-32 h-24 sm:h-32 flex-shrink-0 overflow-hidden">
                      <SafariImage 
                        src={imageUrl}
                        alt={destination.name}
                        className="w-full h-full"
                        overlay={true}
                      />
                      <Checkbox 
                        checked={destination.selected}
                        onCheckedChange={() => toggleDestination(destination.name)}
                        className="absolute top-2 left-2 bg-card/90 border-2"
                      />
                    </div>
                    
                    {/* Destination Info */}
                    <div className="flex-1 p-3 sm:p-4 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-foreground">{destination.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {destination.sourceInterest.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {destination.note}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {destination.activities.slice(0, 3).map((activity, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {activity}
                          </Badge>
                        ))}
                        {destination.activities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{destination.activities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Destinations */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Add Custom Destination (Optional)
        </h3>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter a destination name..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={addCustomDestination}
            disabled={!customInput.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {customDestinations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {customDestinations.map((dest) => (
              <Badge 
                key={dest} 
                variant="default" 
                className="flex items-center gap-1 pl-3 pr-1 py-1"
              >
                {dest}
                <button
                  type="button"
                  onClick={() => removeCustomDestination(dest)}
                  className="ml-1 p-0.5 rounded-full hover:bg-primary-foreground/20"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Next
        </Button>
      </div>
    </div>
  );
};
