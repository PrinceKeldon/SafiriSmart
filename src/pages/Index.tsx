
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PreferenceWizard } from '@/components/preferences/PreferenceWizard';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-900">SafariGuide AI</h1>
              <p className="mt-2 text-lg text-gray-600">
                Plan your perfect Kenya safari adventure
              </p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                Tour Operator Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <PreferenceWizard />
      </main>
    </div>
  );
};

export default Index;
