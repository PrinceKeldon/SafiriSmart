
import { PreferenceWizard } from '@/components/preferences/PreferenceWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const SafariGuide = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-green-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Compass className="h-8 w-8 text-green-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                SafariGuide AI
              </h1>
              <p className="text-xs text-gray-600">by SafiriSmart</p>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Safari Adventure
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Answer a few questions and let our AI create a personalized safari itinerary just for you.
          </p>
        </div>

        {/* Preference Wizard */}
        <PreferenceWizard />
      </div>
    </div>
  );
};

export default SafariGuide;
