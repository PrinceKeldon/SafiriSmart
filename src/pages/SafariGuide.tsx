
import { PreferenceWizard } from '@/components/preferences/PreferenceWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const SafariGuide = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">SafariGuide AI</h1>
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
