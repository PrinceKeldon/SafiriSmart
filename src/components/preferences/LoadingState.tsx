
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Compass, MapPin, Binoculars, TreePine } from 'lucide-react';

const loadingMessages = [
  { icon: Compass, text: "Scanning the savanna for perfect spots..." },
  { icon: MapPin, text: "Consulting with local wildlife experts..." },
  { icon: Binoculars, text: "Mapping your adventure routes..." },
  { icon: TreePine, text: "Finding the best sunrise viewpoints..." },
];

export const LoadingState: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = loadingMessages[messageIndex].icon;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="text-center py-8 overflow-hidden safari-card">
        <CardContent className="space-y-6">
          {/* Safari-themed animated loader */}
          <div className="relative mx-auto w-32 h-32">
            {/* Outer ring with gradient */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-safari-gold/20 to-accent/20 animate-pulse-soft" />
            
            {/* Inner circle with rotating border */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-safari-gold animate-spin" style={{ animationDuration: '2s' }} />
              
              {/* Central icon */}
              <div className="relative z-10 p-4 rounded-full bg-card shadow-lg">
                <Compass className="h-10 w-10 text-primary animate-pulse-soft" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-xl font-heading font-bold text-foreground">
              Creating Your Perfect Safari...
            </h3>
            <p className="text-sm text-muted-foreground">
              Our AI is crafting a personalized itinerary
            </p>
          </div>

          {/* Animated message */}
          <div className="flex items-center justify-center gap-3 min-h-[48px]">
            <CurrentIcon className="h-5 w-5 text-primary flex-shrink-0" />
            <p 
              key={messageIndex}
              className="text-muted-foreground animate-fade-in-up font-body"
            >
              {loadingMessages[messageIndex].text}
            </p>
          </div>

          {/* Shimmer progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-safari-gold to-accent animate-shimmer rounded-full"
              style={{ width: '100%', backgroundSize: '200% 100%' }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2">
            {loadingMessages.map((_, idx) => (
              <div 
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === messageIndex 
                    ? 'w-6 bg-primary' 
                    : 'w-2 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
