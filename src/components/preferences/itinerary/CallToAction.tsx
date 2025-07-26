import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CallToActionProps {
  onBack: () => void;
  onContinue: () => void;
  isSmartGenerated?: boolean;
}

export const CallToAction: React.FC<CallToActionProps> = ({ onBack, onContinue, isSmartGenerated }) => {
  return (
    <div className="space-y-4">
      {/* Enhanced CTA messaging for smart generation */}
      {isSmartGenerated && (
        <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Your Smart Safari Plan is Ready! 🎉
          </h3>
          <p className="text-gray-700 mb-4">
            We've created intelligent suggestions based on your preferences and matched them with 
            real operator packages in our system. Now let's connect you with verified tour operators 
            who can bring this plan to life.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-600">
            <span className="bg-white px-3 py-1 rounded-full">✓ Package-matched</span>
            <span className="bg-white px-3 py-1 rounded-full">✓ Budget-optimized</span>
            <span className="bg-white px-3 py-1 rounded-full">✓ Preference-based</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Modify Preferences</span>
        </Button>
        
        <Button
          onClick={onContinue}
          className="bg-orange-600 hover:bg-orange-700 text-white flex items-center space-x-2"
        >
          <span>
            {isSmartGenerated ? 'Connect with Matched Operators' : 'Get Operator Quotes'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
