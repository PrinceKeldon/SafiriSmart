
import PreferenceWizard from '@/components/preferences/PreferenceWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Compass, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OperatorSelectionDebugger } from '@/components/preferences/OperatorSelectionDebugger';
import { useState } from 'react';

const SafariGuide = () => {
  const [showDebugger, setShowDebugger] = useState(false);

  const handleWizardComplete = (data: any) => {
    console.log('Wizard completed with data:', data);
    // Handle completion logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <Compass className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></div>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent truncate">
                  SafariGuide AI
                </h1>
                <p className="text-xs text-gray-600 hidden sm:block">by SafiriSmart</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex items-center gap-2 text-xs"
                onClick={() => setShowDebugger(!showDebugger)}
              >
                <Bug className="h-3 w-3 sm:h-4 sm:w-4" />
                {showDebugger ? 'Hide' : 'Show'} Debugger
              </Button>
              <Link to="/">
                <Button variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm touch-target">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {showDebugger ? (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Debug Operator Selection Flow
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Use the tools below to test each step of the operator selection process.
              </p>
            </div>
            <OperatorSelectionDebugger />
          </div>
        ) : (
          <>
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Plan Your Perfect Safari Adventure
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Answer a few questions and let our AI create a personalized safari itinerary just for you.
              </p>
            </div>

            {/* Preference Wizard */}
            <PreferenceWizard onComplete={handleWizardComplete} />
          </>
        )}
      </div>
    </div>
  );
};

export default SafariGuide;
