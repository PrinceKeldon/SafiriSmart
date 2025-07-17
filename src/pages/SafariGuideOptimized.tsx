
import React, { Suspense } from 'react';
import { Compass, ArrowLeft, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { SEOHead } from '@/components/seo/SEOHead';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

// Lazy load components for better performance
const PreferenceWizard = React.lazy(() => import('@/components/preferences/PreferenceWizard'));
const OperatorSelectionDebugger = React.lazy(() => 
  import('@/components/preferences/OperatorSelectionDebugger').then(module => ({
    default: module.OperatorSelectionDebugger
  }))
);

const SafariGuideOptimized = () => {
  usePerformanceMonitor('SafariGuide_Landing');
  const [showDebugger, setShowDebugger] = React.useState(false);

  const handleWizardComplete = (data: any) => {
    console.log('Wizard completed with data:', data);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SafariGuide AI",
    "description": "AI-powered safari planning for Kenya. Create personalized itineraries and connect with expert operators.",
    "url": window.location.origin,
    "applicationCategory": "TravelApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "SafiriSmart",
      "description": "Kenya's leading safari technology platform"
    }
  };

  return (
    <ErrorBoundary>
      <SEOHead
        title="Plan Your Perfect Kenya Safari with AI"
        description="Create personalized safari itineraries for Kenya using AI. Connect with expert tour operators and plan your dream wildlife adventure in Maasai Mara, Amboseli, and more."
        keywords="Kenya safari, safari planning, AI travel planner, Maasai Mara, wildlife tour, safari itinerary, Kenya tour operators"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
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
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => setShowDebugger(!showDebugger)}
              >
                <Bug className="h-4 w-4" />
                {showDebugger ? 'Hide' : 'Show'} Debugger
              </Button>
              <Link to="/">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {showDebugger ? (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Debug Operator Selection Flow
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Use the tools below to test each step of the operator selection process.
                </p>
              </div>
              <Suspense fallback={<div className="flex items-center justify-center h-64">Loading debugger...</div>}>
                <OperatorSelectionDebugger />
              </Suspense>
            </div>
          ) : (
            <>
              <section className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Plan Your Perfect Safari Adventure
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Answer a few questions and let our AI create a personalized safari itinerary just for you.
                </p>
              </section>

              <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading safari planner...</p>
                  </div>
                </div>
              }>
                <PreferenceWizard onComplete={handleWizardComplete} />
              </Suspense>
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default SafariGuideOptimized;
